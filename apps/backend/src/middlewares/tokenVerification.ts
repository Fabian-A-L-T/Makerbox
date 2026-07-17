import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { jwtSecret } from '../config/app.js';

const tokenVerification = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        if(!jwtSecret) throw new Error('JWT_SECRET not defined');

        const decodedToken = jwt.verify(token, jwtSecret);
        req.body.user = decodedToken;
        next();
    }
    catch (err: any) {
        return res.status(403).json({ message: 'Forbidden' });
    }
}
export default tokenVerification;
