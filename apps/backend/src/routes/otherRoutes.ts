import express, { Router } from 'express';
import { route } from '../openapi/wrapper';
import StatController from '../controllers/StatController';
import { messageSchema } from '../utils/schemas';
import { object, string } from 'valibot';

const router: Router = express.Router();
const PATH = '';

route(router, PATH, { method: 'get', path: '/api/refresh-stats', handler: StatController.refreshStats,
  summary: 'Actualizar estadísticas del sistema',
  tags: ['Otros'],
  responses: {
    200: { description: 'OK', schema: messageSchema},
    500: { description: 'Error del servidor', schema: object({...messageSchema.entries, error: string()}) },
  }
});
route(router, PATH, { method: 'get', path: '/api/health', handler: (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }),
  summary: 'Verificar que la API está en funcionamiento',
  tags: ['Otros'],
  responses: {
    200: { description: 'OK', schema: object({status: string(), timestamp: string()})},
  }
});

export default router;