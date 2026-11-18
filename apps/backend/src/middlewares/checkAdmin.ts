import type { Request, Response, NextFunction } from 'express';

const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.body.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Prohibido' });
    }
    next();
}
export default checkAdmin;