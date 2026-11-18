// openapi/route.ts
import { Router, type RequestHandler } from 'express';
import * as v from 'valibot';
import { defineRoute } from './registry';

type Schema = v.GenericSchema;

interface RouteConfig {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  summary: string;
  tags: string[];
  params?: Schema;
  query?: Schema;
  body?: Schema;
  requireAuth?: boolean;
  cookies?: Schema;
  responses: Record<number, { description: string; schema?: Schema; headers?: Record<string, { description: string; schema?: Schema }>; }>;
  handler: RequestHandler;
  middlewares?: RequestHandler[];
}

export function route(router: Router, basePath: string, cfg: RouteConfig) {
  router[cfg.method](cfg.path, ...(cfg.middlewares ?? []), cfg.handler);

  defineRoute({
    method: cfg.method,
    // /users + /:id  ->  /users/{id}
    path: (basePath + cfg.path).replace(/:(\w+)/g, '{$1}'),
    tags: cfg.tags,
    summary: cfg.summary,
    cookies: cfg.cookies,
    params: cfg.params,
    query: cfg.query,
    body: cfg.body,
    requireAuth: cfg.requireAuth,
    responses: cfg.responses,
  });
}