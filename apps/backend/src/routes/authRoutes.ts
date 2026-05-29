import express, { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import tokenVerification from '../middlewares/tokenVerification.js';

const router: Router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/logout', tokenVerification, AuthController.logout);
router.get('/validate', tokenVerification, (req, res) => res.json({valid: true, user: req.body.user}));

export default router;