import express, { Router } from 'express';
import ProjectController from '../controllers/ProjectController.js';
import checkAdmin from '../middlewares/checkAdmin.js';

const router: Router = express.Router();

router.get('/', ProjectController.getAll); // GET all projects — optional ?estado= filter
router.get('/:id', ProjectController.getByID); // GET single project by id (with components and tools)
router.post('/', checkAdmin, ProjectController.create); // POST create project
router.patch('/:id', checkAdmin, ProjectController.update); // PATCH update project
router.delete('/:id', checkAdmin, ProjectController.delete); // DELETE project (hard delete — cascades to pivot tables)

router.get('/:project_id/tools', ProjectController.getProjectTools); // GET all tools assigned to a project
router.post('/:project_id/tools', checkAdmin, ProjectController.addTool); // POST assign a tool to a project
router.patch('/:project_id/tools/:tool_id', checkAdmin, ProjectController.updateTool); // PATCH update a tool assigned to a project
router.delete('/:project_id/tools/:tool_id', checkAdmin, ProjectController.removeTool); // DELETE unassign a tool from a project

router.get('/:project_id/components', ProjectController.getProjectComponents); // GET all components for a project
router.post('/:project_id/components', checkAdmin, ProjectController.addComponent); // POST add a component to a project
router.patch('/:project_id/components/:component_id', checkAdmin, ProjectController.updateComponent); // PATCH update a component in a project
router.delete('/:project_id/components/:component_id', checkAdmin, ProjectController.removeComponent); // DELETE unassign a component from a project

export default router;
