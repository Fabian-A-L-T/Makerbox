// openapi/registry.ts
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

type Schema = v.GenericSchema;

interface RouteDoc {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string; // OpenAPI style: /users/{id}
  tags: string[];
  summary: string;
  params?: Schema;
  query?: Schema;
  body?: Schema;
  cookies?: Schema;
  requireAuth?: boolean;
  responses: Record<number, { description: string; schema?: Schema; headers?: Record<string, { description: string; schema?: Schema }>; }>;
}

const routes: RouteDoc[] = [];
export const defineRoute = (r: RouteDoc) => routes.push(r);

const js = (s: Schema) =>
  toJsonSchema(s, { target: 'openapi-3.0', errorMode: 'warn', typeMode: 'input'});

// Turn valibot schema into OpenAPI `parameters`
function toParameters(schema: Schema | undefined, where: 'path' | 'query' | 'cookie') {
  if (!schema) return [];
  const { properties = {}, required = [] } = js(schema) as any;
  return Object.entries(properties).map(([name, s]) => ({
    name,
    in: where,
    required: where === 'path' || required.includes(name),
    schema: s,
  }));
}

export function buildSpec() {
  const paths: Record<string, any> = {};
  for (const r of routes) {
    paths[r.path] ??= {};
    paths[r.path][r.method] = {
      tags: r.tags,
      summary: r.summary,
      ...(r.requireAuth && {security: [{ bearerAuth: [], ...( r.cookies && {refreshCookie: []})}]}),
      parameters: [
        ...toParameters(r.params, 'path'),
        ...toParameters(r.query, 'query'),
        ...toParameters(r.cookies, 'cookie'),
      ],
      ...(r.body && {
        requestBody: {
          required: true,
          content: { 'application/json': { schema: js(r.body) } },
        },
      }),
      responses: Object.fromEntries(
        Object.entries(r.responses).map(([code, res]) => [
          code,
          {
            description: res.description,
            ...(res.headers && {
              headers: Object.fromEntries(
                Object.entries(res.headers).map(([name, h]) => [
                  name,
                  {
                    description: h.description,
                    schema: h.schema ? js(h.schema) : { type: 'string' },
                  },
                ])
              ),
            }),
            ...(res.schema && {
              content: { 'application/json': { schema: js(res.schema) } },
            }),
          },
        ])
      ),
    };
  }
  return {
    openapi: '3.1.0',
    info: { title: 'Makerbox API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth:{type: 'http', scheme: 'bearer', bearerFormat: 'JWT'},
        refreshCookie: { type: 'apiKey', in: 'cookie', name: 'refreshToken' },
      }
    },
    paths,
  };
}