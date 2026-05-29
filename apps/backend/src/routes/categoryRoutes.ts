import express, { Router } from 'express';
import CategoryController from '../controllers/CategoryController.js';
import checkAdmin from '../middlewares/checkAdmin.js';

const router: Router = express.Router();

router.get('/children', CategoryController.getChildren);
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getByID);
router.post('/', checkAdmin, CategoryController.create);
router.put('/:id', checkAdmin, CategoryController.update);
router.delete('/:id', checkAdmin, CategoryController.delete);

export default router;
