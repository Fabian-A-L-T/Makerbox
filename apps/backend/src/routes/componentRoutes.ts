import express, { Router } from 'express';
import ComponentController from '../controllers/ComponentController.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import { route } from '../openapi/wrapper.js';
import { componentDataSchema, componentFilterSchema, componentLocationDataSchema, componentLocationSchema, componentSchema, messageSchema, paginationResponse, paginationSchema } from '../utils/schemas.js';
import { array, nullable, number, object, string } from 'valibot';

const router: Router = express.Router();
const PATH = '/api/components';
const requireAuth = true;

route(router, PATH, { method: 'get', path: '/', handler: ComponentController.getAll,
  summary: 'Obtener lista de componentes',
  tags: ['Componentes electrónicos'],
  requireAuth,
  query: object({...componentFilterSchema.entries, ...paginationSchema.entries}),
  responses: {
    200: { description: 'Lista de componentes', schema: paginationResponse},
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:id', handler: ComponentController.getByID,
  summary: 'Obtener información de componente por ID',
  tags: ['Componentes electrónicos'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del componente', schema: object({content: array(object({...componentDataSchema.entries, created_at: string(), category: string(), manufacturer: string(), manufacturer_website: string() }))})},
    404: { description: 'Componente no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/', middlewares: [checkAdmin], handler: ComponentController.create,
  summary: 'Crear componente',
  tags: ['Componentes electrónicos'],
  requireAuth,
  body: componentSchema,
  responses: {
    201: { description: 'Datos del componente', schema: object({...messageSchema.entries, data: array(componentDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    409: { description: 'SKU duplicado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'put', path: '/:id', middlewares: [checkAdmin], handler: ComponentController.update,
  summary: 'Actualizar información de componente por ID',
  tags: ['Componentes electrónicos'],
  requireAuth,
  params: object({id: string()}),
  body: componentSchema,
  responses: {
    200: { description: 'Datos del componente', schema: object({...messageSchema.entries, data: array(componentDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Componente no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:id', middlewares: [checkAdmin], handler: ComponentController.delete,
  summary: 'Eliminar componente (Soft-delete)',
  tags: ['Componentes electrónicos'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del componente', schema: object({...messageSchema.entries, data: array(componentDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Componente no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/:id/restore', middlewares: [checkAdmin], handler: ComponentController.restore,
  summary: 'Restaurar componente eliminado',
  tags: ['Componentes electrónicos'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del componente', schema: object({...messageSchema.entries, data: array(componentDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Componente no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:component_id/locations', handler: ComponentController.getAllLocations,
  summary: 'Obtener lista de ubicaciones de un componente',
  tags: ['Componentes electrónicos'],
  requireAuth,
  params: object({component_id: string()}),
  responses: {
    200: { description: 'Lista de ubicaciones', schema: object({content: array(object({...componentLocationSchema.entries, location_name: string(), location_description: nullable(string()), location_route: string()}))})},
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/:component_id/locations', middlewares: [checkAdmin], handler: ComponentController.addToLocation,
  summary: 'Agregar componente a una ubicación',
  tags: ['Componentes electrónicos'],
  requireAuth,
  params: object({component_id: string()}),
  body: object({location_id: number(), amount: number()}),
  responses: {
    201: { description: 'Operación exitosa', schema: object({message: string(), data: array(componentLocationDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:component_id/locations/:location_id', handler: ComponentController.getLocation,
  summary: 'Obtener stock de un componente en una ubicación especifica',
  tags: ['Componentes electrónicos'],
  requireAuth,
  params: object({component_id: string(), location_id: string()}),
  responses: {
    200: { description: 'Datos del componente y su ubicación', schema: object({content: array(componentLocationDataSchema)})},
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/:component_id/locations/:location_id', middlewares: [checkAdmin], handler: ComponentController.updateQuantity,
  summary: 'Actualizar stock de un componente en una ubicación especifica',
  tags: ['Componentes electrónicos'],
  requireAuth,
  params: object({component_id: string(), location_id: string()}),
  body: object({amount: number()}),
  responses: {
    200: { description: 'Operación exitosa', schema: object({message: string(), data: array(componentLocationDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Componente o ubicación no encontrada', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:component_id/locations/:location_id', middlewares: [checkAdmin], handler: ComponentController.removeFromLocation,
  summary: 'Eliminar stock de un componente en una ubicación especifica',
  tags: ['Componentes electrónicos'],
  requireAuth,
  params: object({component_id: string(), location_id: string()}),
  responses: {
    200: { description: 'Operación exitosa', schema: object({message: string(), data: array(componentLocationDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Componente o ubicación no encontrada', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});

export default router;
