import express, { Router } from 'express';
import StatController from '../controllers/StatController.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import checkTechnician from '../middlewares/checkTechnician.js';

const router: Router = express.Router();

router.get('/components', StatController.getComponentStats);
router.get('/tools', StatController.getToolStats);
router.get('/projects/global', checkAdmin, StatController.getGlobalProjectStats);
router.get('/projects/user', checkTechnician, StatController.getUserProjectStats);

export default router;
