import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
//import slowDown from 'express-slow-down';
//import rateLimit from 'express-rate-limit'
//Endpoints
import userRoutes from './routes/userRoutes';
import componentRoutes from './routes/componentRoutes';
import categoryRoutes from './routes/categoryRoutes';
import locationRoutes from './routes/locationRoutes';
import manufacturerRoutes from './routes/manufacturerRoutes';
import toolRoutes from './routes/toolRoutes';
import projectRoutes from './routes/projectRoutes';
import movementRoutes from './routes/movementRoutes';
import authRoutes from './routes/authRoutes';
import fileRoutes from './routes/fileRoutes';
import toolCategoryRoutes from './routes/toolCategoryRoutes';
import statRoutes from './routes/statRoutes';

import tokenVerification from './middlewares/tokenVerification';
import { frontUrl } from './config/app';

const app = express();
/*
const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 0,
  delayMs: (hits) => hits * 200
});

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 100,
  max: 1, // limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
});
*/

// --- Middleware ---
app.use(helmet())
app.use(express.json());
app.use(cors({ 
  origin: frontUrl,
  credentials: true
}));
app.use(cookieParser());

app.use('/uploads', tokenVerification, express.static('uploads'));
//app.use(speedLimiter);

// --- Routes ---
// All the defined endpoints follows the same structure:
// - First we extract the data from the request body or params if needed
// - Then we validate the data if needed
// - Then we select/insert/update/delete the data from the database using a SQL query
// - Finally we return as response a message and the result of the query
// - If there is no result, we return a 404 status code and a message indicating that the data was not found
// - If something goes wrong, we return a 500 error with the error message
app.use('/api/auth', authRoutes);

//app.use(limiter);
app.use('/api/users', tokenVerification,  userRoutes);
app.use('/api/components', tokenVerification,  componentRoutes);
app.use('/api/component-categories', tokenVerification,  categoryRoutes);
app.use('/api/locations', tokenVerification,  locationRoutes);
app.use('/api/manufacturers', tokenVerification,  manufacturerRoutes);
app.use('/api/tools', tokenVerification,  toolRoutes);
app.use('/api/projects', tokenVerification,  projectRoutes);
app.use('/api/movements', tokenVerification,  movementRoutes);
app.use('/api/files', tokenVerification,  fileRoutes);
app.use('/api/tool-categories', tokenVerification,  toolCategoryRoutes);
app.use('/api/stats', tokenVerification, statRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
