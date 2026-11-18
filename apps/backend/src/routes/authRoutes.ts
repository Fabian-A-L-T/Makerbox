import express, { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import tokenVerification from '../middlewares/tokenVerification.js';
import { route } from '../openapi/wrapper.js';
import { boolean, object, optional, picklist, string } from 'valibot';
import { messageSchema, userDataSchema, userLoginSchema } from '../utils/schemas.js';

const router: Router = express.Router();
const PATH = '/api/auth';

route(router, PATH, { method: 'post', path: '/login', handler: AuthController.login,
  summary: 'Inicio de sesión',
  tags: ['Autenticación'],
  body: object({...userLoginSchema.entries, remember: optional(picklist(['false','true']))}),
  responses: {
    200: { description: 'Token de acceso', schema: object({userData: userDataSchema, accessToken: string()})},
    404: { description: 'Usuario no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/refresh', handler: AuthController.refresh,
  summary: 'Refrescar token',
  tags: ['Autenticación'],
  cookies: object({ refresh_token: string() }),
  responses: {
    200: { description: 'Token de acceso', schema: object({userData: userDataSchema, accessToken: string()}), 
    headers: {
      'Set-Cookie': {
        description:
          'Rotated `refresh_token` cookie (HttpOnly, Secure, SameSite=Strict)',
      },
    }},
    401: { description: 'Acceso no autorizado', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/logout', middlewares: [tokenVerification], handler: AuthController.logout,
  summary: 'Cierre de sesión',
  tags: ['Autenticación'],
  requireAuth: true,
  cookies: object({ refresh_token: string() }),
  responses: {
    200: { description: 'OK', schema: messageSchema,
      headers: {
      'Set-Cookie': {
        description:
          '`refresh_token` cookie (HttpOnly, Secure, SameSite=Strict)',
      },
    }},
    401: { description: 'Acceso no autorizado', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/validate', middlewares: [tokenVerification], handler: (req, res) => res.json({valid: true, user: req.body.user}),
  summary: 'Verificar validez de token de acceso',
  tags: ['Autenticación'],
  requireAuth: true,
  responses: {
    200: { description: 'OK', schema: object({valid: boolean(), user: userDataSchema})}
  }
});

export default router;