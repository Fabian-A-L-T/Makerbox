import express, { Router } from 'express';
import LocationController from '../controllers/LocationController.js';
import checkAdmin from '../middlewares/checkAdmin.js';

const router: Router = express.Router();

router.get('/', LocationController.getAll); // GET all locations
router.get('/:id', LocationController.getByID); // GET single location by id
router.post('/', checkAdmin, LocationController.create); // POST create location
router.put('/:id', checkAdmin, LocationController.update); // PATCH update location
router.delete('/:id', checkAdmin, LocationController.delete); // DELETE location (hard delete — children get ubicacion_padre_id SET NULL via DB constraint)
router.get('/:location_id/components', LocationController.getComponents); // GET all components in a specific location

export default router;
