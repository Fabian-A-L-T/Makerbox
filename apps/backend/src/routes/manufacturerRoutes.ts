import express, { Router } from 'express';
import ManufacturerController from '../controllers/ManufacturerController.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import { route } from '../openapi/wrapper.js';
import { array, object, string } from 'valibot';
import { manufacturerDataSchema, manufacturerFilterSchema, manufacturerSchema, messageSchema, paginationResponse, paginationSchema } from '../utils/schemas.js';

const router: Router = express.Router();
const PATH = '/api/manufacturers';
const requireAuth = true;

route(router, PATH, { method: 'get', path: '/', handler: ManufacturerController.getAll,
  summary: 'Obtener lista de fabricantes',
  tags: ['Fabricantes'],
  requireAuth,
  query: object({...manufacturerFilterSchema.entries, ...paginationSchema.entries}),
  responses: {
    200: { description: 'Lista de fabricantes', schema: paginationResponse},
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:id', handler: ManufacturerController.getByID,
  summary: 'Obtener información de fabricante por ID',
  tags: ['Fabricantes'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del fabricante', schema: object({content: array(manufacturerDataSchema)})},
    404: { description: 'Fabricante no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/', middlewares: [checkAdmin], handler: ManufacturerController.create,
  summary: 'Crear fabricante',
  tags: ['Fabricantes'],
  requireAuth,
  body: manufacturerSchema,
  responses: {
    201: { description: 'Datos del fabricante', schema: object({...messageSchema.entries, data: array(manufacturerDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'put', path: '/:id', middlewares: [checkAdmin], handler: ManufacturerController.update,
  summary: 'Actualizar información de fabricante por ID',
  tags: ['Fabricantes'],
  requireAuth,
  params: object({id: string()}),
  body: manufacturerSchema,
  responses: {
    201: { description: 'Datos del fabricante', schema: object({...messageSchema.entries, data: array(manufacturerDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Fabricante no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:id', middlewares: [checkAdmin], handler: ManufacturerController.delete,
  summary: 'Eliminar fabricante (Soft-delete)',
  tags: ['Fabricantes'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del fabricante', schema: object({...messageSchema.entries, data: array(manufacturerDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Fabricante no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});

export default router;
