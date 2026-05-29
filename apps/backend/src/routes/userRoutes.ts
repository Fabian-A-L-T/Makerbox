import express, { Router } from 'express';
import UserController from "../controllers/UserController.js";
import checkAdmin from '../middlewares/checkAdmin.js';

const router: Router = express.Router();
router.use(checkAdmin);

router.get('/', UserController.getAll); // Get all users
router.get('/:id', UserController.getByID); // Get user by id
router.post('/', UserController.create); // Create user
router.put('/:id', UserController.update); // Update user
router.put("/:id/restore", UserController.restore); // Restore user
router.delete('/:id', UserController.delete); // Delete user

export default router;