import express, { Router } from 'express';
import ToolController from '../controllers/ToolController.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import { route } from '../openapi/wrapper.js';
import { array, nullish, object, string } from 'valibot';
import { messageSchema, paginationResponse, paginationSchema, toolDataSchema, toolFilterSchema, toolSchema } from '../utils/schemas.js';

const router: Router = express.Router();
const PATH = '/api/tools';
const requireAuth = true;

route(router, PATH, { method: 'get', path: '/', handler: ToolController.getAll,
  summary: 'Obtener lista de herramientas',
  tags: ['Herramientas'],
  requireAuth,
  query: object({...toolFilterSchema.entries, ...paginationSchema.entries}),
  responses: {
    200: { description: 'Lista de herramientas', schema: paginationResponse},
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:id', handler: ToolController.getByID,
  summary: 'Obtener información de herramienta por ID',
  tags: ['Herramientas'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos de la herramienta', schema: object({content: array(object({...toolDataSchema.entries, manufacturer: nullish(string()), category: nullish(string()), created_at: string(), location_name: nullish(string()), location_route: nullish(string()), location_description: nullish(string()) }))})},
    404: { description: 'Herramienta no encontrada', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/', middlewares: [checkAdmin], handler: ToolController.create,
  summary: 'Crear herramienta',
  tags: ['Herramientas'],
  requireAuth,
  body: toolSchema,
  responses: {
    201: { description: 'Datos de la herramienta', schema: object({...messageSchema.entries, data: toolDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    409: { description: 'SKU o numero de serie duplicado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'put', path: '/:id', middlewares: [checkAdmin], handler: ToolController.update,
  summary: 'Actualizar información de herramienta por ID',
  tags: ['Herramientas'],
  requireAuth,
  params: object({id: string()}),
  body: toolSchema,
  responses: {
    200: { description: 'Datos de la herramienta', schema: object({...messageSchema.entries, data: toolDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Herramienta no encontrada', schema: messageSchema },
    409: { description: 'Herramienta ya existe', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:id', middlewares: [checkAdmin], handler: ToolController.delete,
  summary: 'Eliminar herramienta (Soft-delete)',
  tags: ['Herramientas'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos de la herramienta', schema: object({...messageSchema.entries, data: toolDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Herramienta no encontrada', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/:id/restore', middlewares: [checkAdmin], handler: ToolController.restore,
  summary: 'Restaurar herramienta eliminada',
  tags: ['Herramientas'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos de la herramienta', schema: object({...messageSchema.entries, data: array(toolDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Herramienta no encontrada', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});

export default router;
