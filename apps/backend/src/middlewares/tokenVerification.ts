import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const tokenVerification = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
        req.body.user = decodedToken;
        next();
    } catch (err: any) {
        return res.status(403).json({ message: 'Forbidden' });
    }
}
export default tokenVerification;
