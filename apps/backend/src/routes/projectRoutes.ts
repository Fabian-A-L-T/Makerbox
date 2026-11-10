import express, { Router } from 'express';
import ProjectController from '../controllers/ProjectController.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import checkTechnician from '../middlewares/checkTechnician.js';

const router: Router = express.Router();

router.get('/', checkTechnician, ProjectController.getAll); // GET all projects — optional ?estado= filter
router.get('/:id', checkTechnician, ProjectController.getByID); // GET single project by id (with components and tools)
router.post('/', checkTechnician, ProjectController.create); // POST create project
router.put('/:id', checkTechnician, ProjectController.update); // PATCH update project
router.delete('/:id', checkAdmin, ProjectController.delete); // DELETE project (hard delete — cascades to pivot tables)

router.patch('/:project_id/state/update', checkTechnician, ProjectController.updateState);
router.patch('/:project_id/state/revert', checkTechnician, ProjectController.revertState);

router.post('/:project_id/milestones', checkTechnician, ProjectController.createMilestone);
router.put('/:project_id/milestones/:milestone_id', checkTechnician, ProjectController.updateMilestone);
router.delete('/:project_id/milestones/:milestone_id', checkTechnician, ProjectController.deleteMilestone);

router.patch('/:project_id/milestones/complete', checkTechnician, ProjectController.completeMilestone);
router.patch('/:project_id/milestones/revert', checkTechnician, ProjectController.revertMilestone);

router.post('/:project_id/tools', checkAdmin, ProjectController.addTool); // POST assign a tool to a project
router.patch('/:project_id/tools/:tool_id', checkAdmin, ProjectController.updateTool); // PATCH update a tool assigned to a project
router.delete('/:project_id/tools/:tool_id', checkAdmin, ProjectController.removeTool); // DELETE unassign a tool from a project

router.get('/:project_id/components', checkTechnician, ProjectController.getProjectComponents); // GET all components for a project
router.post('/:project_id/components', checkAdmin, ProjectController.addComponent); // POST add a component to a project
router.patch('/:project_id/components/:component_id', checkAdmin, ProjectController.updateComponent); // PATCH update a component in a project
router.delete('/:project_id/components/:component_id', checkAdmin, ProjectController.removeComponent); // DELETE unassign a component from a project

export default router;
