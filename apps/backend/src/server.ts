import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import slowDown from 'express-slow-down';
//Endpoints
import userRoutes from './routes/userRoutes.js';
import componentRoutes from './routes/componentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import manufacturerRoutes from './routes/manufacturerRoutes.js';
import toolRoutes from './routes/toolRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import movementRoutes from './routes/movementRoutes.js';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import toolCategoryRoutes from './routes/toolCategoryRoutes.js'

import tokenVerification from './middlewares/tokenVerification.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 1,           // allow 10 requests to go at full speed
  delayMs: (hits) => hits * 1000 // increase delay by 500ms for every request over the limit
});


// --- Middleware ---
app.use(helmet())
app.use(express.json());
app.use(cors({ 
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use('/uploads', tokenVerification, express.static('uploads'));


// --- Routes ---
// All the defined endpoints follows the same structure:
// - First we extract the data from the request body or params if needed
// - Then we validate the data if needed
// - Then we select/insert/update/delete the data from the database using a SQL query
// - Finally we return as response a message and the result of the query
// - If there is no result, we return a 404 status code and a message indicating that the data was not found
// - If something goes wrong, we return a 500 error with the error message

app.use('/auth', authRoutes);

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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
