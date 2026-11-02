import express, { Router } from 'express';
import ToolController from '../controllers/ToolController.js';
import checkAdmin from '../middlewares/checkAdmin.js';

const router: Router = express.Router();

router.get('/', ToolController.getAll); // GET all tools — optional ?estado= filter
router.get('/:id', ToolController.getByID); // GET single tool by id
router.post('/', checkAdmin, ToolController.create); // POST create tool
router.put('/:id', checkAdmin, ToolController.update); // PATCH update tool
router.delete('/:id', checkAdmin, ToolController.delete); // DELETE tool
router.patch('/:id/restore', checkAdmin, ToolController.restore); // Restore tool

export default router;
