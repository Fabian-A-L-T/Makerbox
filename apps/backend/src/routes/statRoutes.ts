import express, { Router } from 'express';
import StatController from '../controllers/StatController.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import checkTechnician from '../middlewares/checkTechnician.js';
import { route } from '../openapi/wrapper.js';
import { array, object } from 'valibot';
import { componentStatsSchema, globalProjectStatsSchema, messageSchema, toolStatsSchema, userProjectStatsSchema } from '../utils/schemas.js';

const router: Router = express.Router();
const PATH = '/api/stats';
const requireAuth = true;

route(router, PATH, { method: 'get', path: '/components', handler: StatController.getComponentStats,
  summary: 'Obtener estadísticas de componentes',
  tags: ['Estadísticas'],
  requireAuth,
  responses: {
    200: { description: 'Estadísticas de componentes', schema: object({content: array(componentStatsSchema)})},
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/tools', handler: StatController.getToolStats,
  summary: 'Obtener estadísticas de herramientas',
  tags: ['Estadísticas'],
  requireAuth,
  responses: {
    200: { description: 'Estadísticas de herramientas', schema: object({content: array(toolStatsSchema)})},
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/projects/global', middlewares: [checkAdmin], handler: StatController.getGlobalProjectStats,
  summary: 'Obtener estadísticas de todos los proyectos registrados',
  tags: ['Estadísticas'],
  requireAuth,
  responses: {
    200: { description: 'Estadísticas globales de proyectos', schema: object({content: array(globalProjectStatsSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/projects/user', middlewares: [checkTechnician], handler: StatController.getUserProjectStats,
  summary: 'Obtener estadísticas de los proyectos registrados por usuario',
  tags: ['Estadísticas'],
  requireAuth,
  responses: {
    200: { description: 'Estadísticas de proyectos del usuario', schema: object({content: array(userProjectStatsSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});

export default router;
