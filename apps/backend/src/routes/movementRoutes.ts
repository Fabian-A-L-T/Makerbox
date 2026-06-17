import express, { Router } from 'express';
import MovementController from '../controllers/MovementController.js';
import checkAdmin from '../middlewares/checkAdmin.js';

const router: Router = express.Router();

router.get('/', MovementController.getAll);
router.get('/:id', MovementController.getByID);
router.post('/', checkAdmin, MovementController.create);

export default router;
