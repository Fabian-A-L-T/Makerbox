import express, { Router } from 'express';
import MovementController from '../controllers/MovementController.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import { array, nullable, object, string } from 'valibot';
import { messageSchema, movementDataSchema, movementFilterSchema, movementSchema, paginationResponse, paginationSchema } from '../utils/schemas.js';
import { route } from '../openapi/wrapper.js';

const router: Router = express.Router();
const PATH = '/api/movements';
const requireAuth = true;

route(router, PATH, { method: 'get', path: '/', middlewares: [checkAdmin], handler: MovementController.getAll,
  summary: 'Obtener todos los movimientos de los componentes',
  tags: ['Movimientos'],
  requireAuth,
  query: object({...movementFilterSchema.entries, ...paginationSchema.entries}),
  responses: {
    200: { description: 'Lista de movimientos', schema: paginationResponse},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:id', middlewares: [checkAdmin], handler: MovementController.getByID,
  summary: 'Obtener información de movimiento por ID',
  tags: ['Movimientos'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del movimiento', schema: object({content: array(object({...movementDataSchema.entries, component_sku: string(), component_name: string(), user_name: nullable(string()), origin_location_name: nullable(string()), destination_location_name: nullable(string()), project_name: nullable(string()), created_at: string()}))})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Movimiento no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/', middlewares: [checkAdmin], handler: MovementController.create,
  summary: 'Crear movimiento de componentes',
  tags: ['Movimientos'],
  requireAuth,
  body: movementSchema,
  responses: {
    201: { description: 'Datos del movimiento', schema: object({...messageSchema.entries, data: array(movementDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});

export default router;
