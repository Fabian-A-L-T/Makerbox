import type { Request, Response, NextFunction } from 'express';

const checkUserID = (req: Request, res: Response, next: NextFunction) => {
    const user = req.body.user;
    if (!user || user.id !== parseInt(req.body.id)) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
}
export default checkUserID;