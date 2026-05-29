import express, { Router } from 'express';
import ManufacturerController from '../controllers/ManufacturerController.js';
import checkAdmin from '../middlewares/checkAdmin.js';

const router: Router = express.Router();

router.get('/', ManufacturerController.getAll); // GET all manufacturers
router.get('/:id', ManufacturerController.getByID); // GET single manufacturer by id
router.post('/', checkAdmin, ManufacturerController.create); // POST create manufacturer
router.put('/:id', checkAdmin, ManufacturerController.update); // PATCH update manufacturer
router.delete('/:id', checkAdmin, ManufacturerController.delete); // DELETE manufacturer

export default router;
