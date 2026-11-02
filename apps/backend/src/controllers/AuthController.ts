import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { userLoginSchema } from '../utils/schemas.js';
import { safeParse } from 'valibot';
import { HttpError, UnauthorizedError, ValidationError } from '../utils/errors.js';
import bcrypt from 'bcrypt';
import { accessTTL, jwtSecret } from '../config/app.js';
import RefreshToken from '../models/RefreshToken';
import { generateRefreshToken } from '../utils/utils.js';
import crypto from 'crypto';

export default class AuthController {
    static async login(req: Request, res: Response) {
        try {
            if(!jwtSecret) throw new Error('JWT_SECRET not defined'); //! [NOTE]: To future me, don't forget to handle this better!!
            const rememberFlag = req.body.remember === 'true';

            // User validation section
            const { success: loginDataSuccess, output: loginData } = safeParse(userLoginSchema, req.body);
            if(!loginDataSuccess) throw new ValidationError();
            
            const user = await User.login(loginData.email);

            const validPasswd = bcrypt.compareSync(loginData.passwd, user[0].passwd);
            if(!validPasswd) throw new ValidationError();
            //--------------------------------------------

            // Refresh token section
            await generateRefreshToken(user[0].id, rememberFlag, res, req.ip || 'desconocido', req.headers["user-agent"] || 'desconocido');
            //--------------------------------------------

            // Access token section
            const userData = {
                id: user[0].id,
                name: user[0].name,
                email: user[0].email,
                role: user[0].role
            };
            const token = jwt.sign(userData, jwtSecret, {expiresIn: accessTTL});
            //--------------------------------------------

            res.json({ accessToken: token, userData});
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async refresh(req: Request, res: Response) {
        try {
            if(!jwtSecret) throw new Error('JWT_SECRET not defined'); //! [NOTE]: To future me, don't forget to handle this better!!

            const refresh_token = req.cookies.refresh_token;
            if (!refresh_token) throw new UnauthorizedError();
            
            // Refresh token validation section
            const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');
            
            const record = await RefreshToken.findByToken(tokenHash);
            if (!record || record[0].expires_at < new Date()) {
                res.clearCookie('refresh_token', { path: '/api/auth' });
                throw new UnauthorizedError();
            }
            //--------------------------------------------

            // Generate new refresh token section
            await RefreshToken.deleteByToken(record[0].token_hash);
            await generateRefreshToken(record[0].user_id, record[0].remember, res, req.ip || 'desconocido', req.headers["user-agent"] || 'desconocido');
            //--------------------------------------------

            // Access token section
            const user = await User.getById(record[0].user_id);
            const userData = {
                id: user[0].id,
                name: user[0].name,
                email: user[0].email,
                role: user[0].role
            };
            const token = jwt.sign(userData, jwtSecret, {expiresIn: accessTTL});
            //--------------------------------------------

            res.json({ accessToken: token, userData});
        } 
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
    
    static async logout(req: Request, res: Response) {
        try {
            const refresh_token = req.cookies.refresh_token;
            if (!refresh_token) throw new UnauthorizedError();
            else {
                const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');
                await RefreshToken.deleteByToken(tokenHash);

                res.clearCookie('refresh_token', { path: '/api/auth' });
                res.status(200).json({ message: 'Logout exitoso' });
            }
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
}
