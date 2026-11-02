import express, { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import tokenVerification from '../middlewares/tokenVerification.js';

const router: Router = express.Router();

router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', tokenVerification, AuthController.logout);
router.get('/validate', tokenVerification, (req, res) => res.json({valid: true, user: req.body.user}));

export default router;