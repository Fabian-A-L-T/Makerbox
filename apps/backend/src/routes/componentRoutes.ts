import express, { Router } from 'express';
import ComponentController from '../controllers/ComponentController.js';
import checkAdmin from '../middlewares/checkAdmin.js';

const router: Router = express.Router();

router.get('/', ComponentController.getAll); // Get all components
router.post('/', checkAdmin, ComponentController.create); // Create component
router.get('/:id', ComponentController.getByID); // Get component by id
router.put('/:id', checkAdmin, ComponentController.update); // Update component
router.delete('/:id', checkAdmin, ComponentController.delete); // Delete component
router.patch('/:id/restore', checkAdmin, ComponentController.restore); // Restore component

router.get('/:component_id/locations', ComponentController.getAllLocations); // Get all locations for a specific component
router.post('/:component_id/locations/', checkAdmin, ComponentController.addToLocation); // Add component to a location
router.get('/:component_id/locations/:location_id', ComponentController.getLocation); // Get location for a specific component
router.patch('/:component_id/locations/:location_id', checkAdmin, ComponentController.updateQuantity); // Update quantity for a component in a location
router.delete('/:component_id/locations/:location_id', checkAdmin, ComponentController.removeFromLocation); // Remove component from a location

export default router;
