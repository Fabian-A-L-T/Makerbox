import express, { Router } from 'express';
import CategoryController from '../controllers/ToolCategoryController.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import { route } from '../openapi/wrapper.js';
import { array, object, optional, string } from 'valibot';
import { categoryDataSchema, categoryFilterSchema, categorySchema, messageSchema, paginationResponse, paginationSchema } from '../utils/schemas.js';

const router: Router = express.Router();
const PATH = '/api/tool-categories';
const requireAuth = true;

route(router, PATH, { method: 'get', path: '/children', handler: CategoryController.getChildren,
  summary: 'Obtener todas las categorías padres',
  tags: ['Categorías de herramientas'],
  requireAuth,
  query: object({path: optional(string())}),
  responses: {
    200: { description: 'Lista de categorías', schema: object({content: array(categoryDataSchema)})},
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/', handler: CategoryController.getAll,
  summary: 'Obtener lista de categorías',
  tags: ['Categorías de herramientas'],
  requireAuth,
  query: object({...categoryFilterSchema.entries, ...paginationSchema.entries}),
  responses: {
    200: { description: 'Lista de categorías', schema: paginationResponse},
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:id', handler: CategoryController.getByID,
  summary: 'Obtener información de categoría por ID',
  tags: ['Categorías de herramientas'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos de la categoría', schema: object({content: categoryDataSchema})},
    404: { description: 'Categoría no encontrada', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/', middlewares: [checkAdmin], handler: CategoryController.create,
  summary: 'Crear categoría',
  tags: ['Categorías de herramientas'],
  requireAuth,
  body: categorySchema,
  responses: {
    201: { description: 'Datos de la categoría', schema: object({...messageSchema.entries, data: array(categoryDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    409: { description: 'Categoría ya existe', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'put', path: '/:id', middlewares: [checkAdmin], handler: CategoryController.update,
  summary: 'Actualizar información de categoría por ID',
  tags: ['Categorías de herramientas'],
  requireAuth,
  params: object({id: string()}),
  body: categorySchema,
  responses: {
    200: { description: 'Datos de la categoría', schema: object({...messageSchema.entries, data: categoryDataSchema})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Categoría no encontrada', schema: messageSchema },
    409: { description: 'Categoría ya existe', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:id', middlewares: [checkAdmin], handler: CategoryController.delete,
  summary: 'Eliminar categoría (Soft-delete)',
  tags: ['Categorías de herramientas'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    201: { description: 'Datos de la categoría', schema: object({...messageSchema.entries, data: array(categoryDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Categoría no encontrada', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});

export default router;
