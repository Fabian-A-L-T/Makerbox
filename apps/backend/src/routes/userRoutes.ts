import express, { Router } from 'express';
import UserController from "../controllers/UserController.js";
import checkAdmin from '../middlewares/checkAdmin.js';
import { route } from '../openapi/wrapper.js';
import { messageSchema, filterSchema, paginationResponse, paginationSchema, userDataSchema, userLoginSchema, userRoleSchema, userSchema, userUpdatePasswdSchema, userUpdateSchema } from '../utils/schemas.js';
import { object, string } from 'valibot';

const router: Router = express.Router();
const PATH = '/api/users';
const requireAuth = true;

route(router, PATH, { method: 'put', path: '/profile', handler: UserController.updateName,
  summary: 'Actualizar nombre de usuario autenticado',
  tags: ['Usuarios'],
  requireAuth,
  body: object({name: userUpdateSchema.entries['name']}),
  responses: {
    200: { description: 'Datos del usuario', schema: object({...messageSchema.entries, data: userDataSchema})},
    404: { description: 'Usuario no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/profile/email', handler: UserController.updateEmail,
  summary: 'Actualizar correo de usuario autenticado',
  tags: ['Usuarios'],
  requireAuth,
  body: userLoginSchema,
  responses: {
    200: { description: 'Datos del usuario', schema: object({...messageSchema.entries, data: userDataSchema})},
    401: { description: 'Contraseña incorrecta', schema: messageSchema },
    404: { description: 'Usuario no encontrado', schema: messageSchema },
    409: { description: 'Correo duplicado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/profile/password', handler: UserController.updatePassword,
  summary: 'Actualizar contraseña de usuario autenticado',
  tags: ['Usuarios'],
  requireAuth,
  body: userUpdatePasswdSchema,
  responses: {
    200: { description: 'Datos del usuario', schema: object({...messageSchema.entries, data: userDataSchema})},
    401: { description: 'Contraseña incorrecta', schema: messageSchema },
    404: { description: 'Usuario no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/', middlewares: [checkAdmin], handler: UserController.getAll,
  summary: 'Obtener lista de usuarios',
  tags: ['Usuarios'],
  requireAuth,
  query: object({...filterSchema.entries, ...paginationSchema.entries}),
  responses: {
    200: { description: 'Lista de usuarios', schema: paginationResponse},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/', middlewares: [checkAdmin], handler: UserController.create,
  summary: 'Crear usuario',
  tags: ['Usuarios'],
  requireAuth,
  body: userSchema,
  responses: {
    201: { description: 'Datos del usuario', schema: object({...messageSchema.entries, data: userDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    409: { description: 'Correo duplicado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:id', middlewares: [checkAdmin], handler: UserController.getByID,
  summary: 'Obtener información de usuario por ID',
  tags: ['Usuarios'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del usuario', schema: object({content: userDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Usuario no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'put', path: '/:id', middlewares: [checkAdmin], handler: UserController.update,
  summary: 'Actualizar información de usuario por ID',
  tags: ['Usuarios'],
  requireAuth,
  params: object({id: string()}),
  body: userRoleSchema,
  responses: {
    200: { description: 'Datos del usuario', schema: object({...messageSchema.entries, data: userDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Usuario no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'put', path: '/:id/restore', middlewares: [checkAdmin], handler: UserController.restore,
  summary: 'Restaurar usuario eliminado',
  tags: ['Usuarios'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del usuario', schema: object({...messageSchema.entries, data: userDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Usuario no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:id', middlewares: [checkAdmin], handler: UserController.delete,
  summary: 'Eliminar usuario (Soft-delete)',
  tags: ['Usuarios'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del usuario', schema: object({...messageSchema.entries, data: userDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Usuario no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});

export default router;