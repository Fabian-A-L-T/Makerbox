import express, { Router } from 'express';
import ProjectController from '../controllers/ProjectController.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import checkTechnician from '../middlewares/checkTechnician.js';
import { route } from '../openapi/wrapper.js';
import { componentListSchema, componentSchema, messageSchema, milestoneDataSchema, milestoneListSchema, milestoneSchema, paginationResponse, paginationSchema, projectComponentSchema, projectDataSchema, projectFilterSchema, projectSchema, projectToolSchema } from '../utils/schemas.js';
import { array, number, object, omit, optional, pick, picklist, record, string } from 'valibot';

const router: Router = express.Router();
const PATH = '/api/projects';
const requireAuth = true;

route(router, PATH, { method: 'get', path: '/',middlewares: [checkTechnician], handler: ProjectController.getAll,
  summary: 'Obtener lista de proyectos',
  tags: ['Proyectos'],
  requireAuth,
  query: object({...projectFilterSchema.entries, ...paginationSchema.entries}),
  responses: {
    200: { description: 'Lista de proyectos', schema: paginationResponse},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:id',middlewares: [checkTechnician], handler: ProjectController.getByID,
  summary: 'Obtener información de proyecto por ID',
  tags: ['Proyectos'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del proyecto', schema: object({content: object({...projectDataSchema.entries, created_at: string(), user_name: string(), components: array(object({...projectComponentSchema.entries, ...pick(componentSchema, ['sku','name','unit_cost']).entries})), tools: array(object({...projectToolSchema.entries, sku: string(), tool_name: string()})), milestones: array(milestoneDataSchema)})})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/', middlewares: [checkTechnician], handler: ProjectController.create,
  summary: 'Crear proyecto',
  tags: ['Proyectos'],
  requireAuth,
  body: object({...omit(projectSchema, ['responsible_id']).entries, compList: record(string(), componentListSchema), milestoneList: array(milestoneListSchema)}),
  responses: {
    201: { description: 'Datos del proyecto', schema: object({...messageSchema.entries, status: string(), data: optional(object({notFoundCount: number(), outOfStockList: array(string())}))})},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'put', path: '/:id', middlewares: [checkTechnician], handler: ProjectController.update,
  summary: 'Actualizar información de proyecto por ID',
  tags: ['Proyectos'],
  requireAuth,
  params: object({id: string()}),
  body: omit(projectSchema, ['responsible_id']),
  responses: {
    200: { description: 'Datos del proyecto', schema: object({...messageSchema.entries, data: array(omit(projectDataSchema, ['created_at']))})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:id', middlewares: [checkAdmin], handler: ProjectController.delete,
  summary: 'Eliminar proyecto',
  tags: ['Proyectos'],
  requireAuth,
  params: object({id: string()}),
  responses: {
    200: { description: 'Datos del proyecto', schema: object({...messageSchema.entries, data: array(omit(projectDataSchema, ['created_at']))})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/:project_id/state/update', middlewares: [checkTechnician], handler: ProjectController.updateState,
  summary: "Actualizar estado de proyecto a 'Pausado', 'Finalizado' o 'Cancelado'",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string()}),
  body: object({state: picklist(['paused', 'completed', 'cancelled'])}),
  responses: {
    200: { description: 'Datos del proyecto', schema: object({...messageSchema.entries, data: array(pick(projectDataSchema, ['id', 'name', 'responsible_id', 'state']))})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/:project_id/state/revert', middlewares: [checkTechnician], handler: ProjectController.revertState,
  summary: "Revertir estado de proyecto a 'En planificación' o 'En desarrollo'",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string()}),
  responses: {
    200: { description: 'Datos del proyecto', schema: object({...messageSchema.entries, data: array(pick(projectDataSchema, ['id', 'name', 'state', 'responsible_id']))})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/:project_id/milestones', middlewares: [checkTechnician], handler: ProjectController.createMilestone,
  summary: "Agregar hito a un proyecto",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string()}),
  body: omit(milestoneSchema, ['project_id']),
  responses: {
    200: { description: 'Datos del proyecto', schema: object({...messageSchema.entries, data: array(milestoneDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'put', path: '/:project_id/milestones/:milestone_id', middlewares: [checkTechnician], handler: ProjectController.updateMilestone,
  summary: "Actualizar hito de un proyecto",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string(), milestone_id: string()}),
  body: omit(milestoneSchema, ['project_id']),
  responses: {
    200: { description: 'Datos del hito', schema: object({...messageSchema.entries, data: array(milestoneDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Hito o proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:project_id/milestones/:milestone_id', middlewares: [checkTechnician], handler: ProjectController.deleteMilestone,
  summary: "Eliminar hito de un proyecto",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string(), milestone_id: string()}),
  responses: {
    200: { description: 'Datos del hito', schema: object({...messageSchema.entries, data: array(milestoneDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Hito o proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/:project_id/milestones/complete', middlewares: [checkTechnician], handler: ProjectController.completeMilestone,
  summary: "Marcar hito actual como completado",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string()}),
  responses: {
    200: { description: 'Datos del hito', schema: object({...messageSchema.entries, data: array(milestoneDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/:project_id/milestones/revert', middlewares: [checkTechnician], handler: ProjectController.revertMilestone,
  summary: "Revertir hito a estado inicial",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string()}),
  responses: {
    200: { description: 'Datos del hito', schema: object({...messageSchema.entries, data: array(milestoneDataSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/:project_id/tools', middlewares: [checkAdmin], handler: ProjectController.addTool,
  summary: "Reservar herramienta a proyecto",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string()}),
  body: omit(projectToolSchema, ['project_id']),
  responses: {
    201: { description: 'Datos de la herramienta', schema: object({...messageSchema.entries, data: array(projectToolSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/:project_id/tools/:tool_id', middlewares: [checkAdmin], handler: ProjectController.updateTool,
  summary: "Actualizar estado de herramienta reservada para el proyecto",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string(), tool_id: string()}),
  body: omit(projectToolSchema, ['project_id', 'tool_id']),
  responses: {
    200: { description: 'Datos de la herramienta', schema: object({...messageSchema.entries, data: array(projectToolSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:project_id/tools/:tool_id', middlewares: [checkAdmin], handler: ProjectController.removeTool,
  summary: "Liberar herramienta de proyecto",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string(), tool_id: string()}),
  responses: {
    200: { description: 'Datos de la herramienta', schema: object({...messageSchema.entries, data: array(projectToolSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'get', path: '/:project_id/components', middlewares: [checkTechnician], handler: ProjectController.getProjectComponents,
  summary: "Obtener componentes requeridos por el proyecto",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string()}),
  responses: {
    200: { description: 'Componentes del proyecto', schema: object({content: array(object({...projectComponentSchema.entries, ...pick(componentSchema, ['sku','name','unit_cost']).entries}))})},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/:project_id/components', middlewares: [checkAdmin], handler: ProjectController.addComponent,
  summary: "Agregar componentes a proyecto",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string()}),
  body: omit(projectComponentSchema, ['project_id']),
  responses: {
    201: { description: 'Componentes del proyecto', schema: object({...messageSchema.entries, data: array(projectComponentSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'patch', path: '/:project_id/components/:component_id', middlewares: [checkAdmin], handler: ProjectController.updateComponent,
  summary: "Actualizar componente de un proyecto",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string(), component_id: string()}),
  body: omit(projectComponentSchema, ['project_id', 'component_id']),
  responses: {
    200: { description: 'Componentes del proyecto', schema: object({...messageSchema.entries, data: array(projectComponentSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto o componente no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'delete', path: '/:project_id/components/:component_id', middlewares: [checkAdmin], handler: ProjectController.removeComponent,
  summary: "Eliminar componente de un proyecto",
  tags: ['Proyectos'],
  requireAuth,
  params: object({project_id: string(), component_id: string()}),
  responses: {
    200: { description: 'Componentes del proyecto', schema: object({...messageSchema.entries, data: array(projectComponentSchema)})},
    403: { description: 'Prohibido', schema: messageSchema },
    404: { description: 'Proyecto o componente no encontrado', schema: messageSchema },
    422: { description: 'Error de validación', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});

export default router;
