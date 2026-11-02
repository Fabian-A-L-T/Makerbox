import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { jwtSecret } from '../config/app.js';
import { HttpError, UnauthorizedError } from '../utils/errors.js';

/**Express middleware to verify the access token*/
const tokenVerification = (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!jwtSecret) throw new Error('JWT_SECRET not defined'); //! [NOTE]: To future me, don't forget to handle this better!!

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) throw new UnauthorizedError();

        const decodedToken = jwt.verify(token, jwtSecret);
        req.body.user = decodedToken;
        next();
    }
    catch (error: any) {
        const status = error instanceof HttpError ? error.statusCode : error.name === 'TokenExpiredError' ? 401 : 500;
        res.status(status).json({ message: error.message });
    }
}
export default tokenVerification;
