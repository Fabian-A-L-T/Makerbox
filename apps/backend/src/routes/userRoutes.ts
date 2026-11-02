import express, { Router } from 'express';
import UserController from "../controllers/UserController.js";
import checkAdmin from '../middlewares/checkAdmin.js';

const router: Router = express.Router();

router.get('/', checkAdmin, UserController.getAll); // Get all users
router.get('/:id',checkAdmin, UserController.getByID); // Get user by id
router.put('/profile', UserController.updateName); // Update user profile
router.patch('/profile/email', UserController.updateEmail); // Update user email
router.patch('/profile/password', UserController.updatePassword); // Update user password
router.post('/', checkAdmin, UserController.create); // Create user
router.put('/:id', checkAdmin, UserController.update); // Update user
router.put("/:id/restore", checkAdmin, UserController.restore); // Restore user
router.delete('/:id', checkAdmin, UserController.delete); // Delete user

export default router;