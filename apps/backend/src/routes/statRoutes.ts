import express, { Router } from 'express';
import StatController from '../controllers/StatController.js';

const router: Router = express.Router();

router.get('/components', StatController.getComponentStats);
router.get('/tools', StatController.getToolStats);
router.get('/projects', StatController.getProjectStats);

export default router;
