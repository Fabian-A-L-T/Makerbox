import express, { Router } from 'express';
import UserController from "../controllers/UserController.js";
import checkAdmin from '../middlewares/checkAdmin.js';
import checkUserID from '../middlewares/checkUserID.js';

const router: Router = express.Router();


router.get('/', checkAdmin, UserController.getAll); // Get all users
router.get('/:id',checkAdmin, UserController.getByID); // Get user by id
router.put('/profile', UserController.updateProfile); // Update user profile
router.post('/', checkAdmin, UserController.create); // Create user
router.put('/:id', checkAdmin, UserController.update); // Update user
router.put("/:id/restore", checkAdmin, UserController.restore); // Restore user
router.delete('/:id', checkAdmin, UserController.delete); // Delete user


export default router;