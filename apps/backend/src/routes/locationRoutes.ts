import express, { Router } from 'express';
import LocationController from '../controllers/LocationController.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import { route } from '../openapi/wrapper.js';
import { componentLocationSchema, locationDataSchema, locationFilterSchema, locationSchema, messageSchema, paginationResponse, paginationSchema } from '../utils/schemas.js';
import { array, object, string } from 'valibot';

const router: Router = express.Router();
const PATH = '/api/locations';
const requireAuth = true;

route(router, PATH, { method: 'get', path: '/', handler: LocationController.getAll,
  summary: 'Obtener lista de ubicaciones',
  tags: ['Ubicaciones'],
  requireAuth,
  query: object({...locationFilterSchema.entries, ...paginationSchema.entries}),
  responses: {
    200: { description: 'Lista de ubicaciones', schema: paginationResponse},
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:id', handler: LocationController.getByID,
  summary: 'Obtener información de ubicación por ID',
  tags: ['Ubicaciones'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos de la ubicación', schema: object({content: array(locationDataSchema)})},
    404: { description: 'Ubicación no encontrada', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/', middlewares: [checkAdmin], handler: LocationController.create,
  summary: 'Crear ubicación',
  tags: ['Ubicaciones'],
  requireAuth,
  body: locationSchema,
  responses: {
    201: { description: 'Datos de la ubicación', schema: object({...messageSchema.entries, data: locationDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'put', path: '/:id', middlewares: [checkAdmin], handler: LocationController.update,
  summary: 'Actualizar información de ubicación por ID',
  tags: ['Ubicaciones'],
  requireAuth,
  params: object({id: string()}),
  body: locationSchema,
  responses: {
    200: { description: 'Datos de la ubicación', schema: object({...messageSchema.entries, data: locationDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Ubicación no encontrada', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:id', middlewares: [checkAdmin], handler: LocationController.delete,
  summary: 'Eliminar ubicación (Soft-delete)',
  tags: ['Ubicaciones'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos de la ubicación', schema: object({...messageSchema.entries, data: locationDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Ubicación no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:location_id/components', handler: LocationController.getComponents,
  summary: 'Obtener todos los componentes de una ubicación especifica',
  tags: ['Ubicaciones'],
  requireAuth,
  params: object({location_id: string()}),
  responses: {
    200: { description: 'Lista de componentes', schema: object({content: array(object({...componentLocationSchema.entries, sku: string(), component_name: string()}))})},
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
export default router;
