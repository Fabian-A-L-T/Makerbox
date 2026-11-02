import type { Request, Response, NextFunction } from 'express';

const checkTechnician = (req: Request, res: Response, next: NextFunction) => {
    const user = req.body.user;
    if (!user || (user.role !== 'technician' && user.role !== 'admin')) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
}
export default checkTechnician;