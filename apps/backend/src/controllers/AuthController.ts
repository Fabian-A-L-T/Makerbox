import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { userLoginSchema, userRegisterSchema } from '../utils/schemas.js';
import { safeParse } from 'valibot';
import { ValidationError } from '../utils/errors.js';
import bcrypt from 'bcrypt';
import { jwtSecret } from '../config/app.js';

export default class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const {name, email, passwd} = req.body;

            const validatedData = safeParse(userRegisterSchema, {name, email, passwd});
            if(!validatedData.success) throw new ValidationError();

            const userExists = await User.exists(validatedData.output.email);
            if(userExists) throw new Error('Ya existe un usuario asociado a este correo');

            validatedData.output.passwd = await bcrypt.hash(validatedData.output.passwd, 10);
            
            const user = await User.create(validatedData.output);
            res.status(201).json({ message: 'User registered successfully', data: user });
        }
        catch (error) {
            res.status(500).json({ message: 'Error registering user', error: error });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const validatedData = safeParse(userLoginSchema, req.body);
            if(!validatedData.success) throw new ValidationError();
            
            const user = await User.login(validatedData.output.email);
            
            const validPasswd = await bcrypt.compare(validatedData.output.passwd, user[0].passwd);
            if(!validPasswd) throw new ValidationError();

            if(!jwtSecret) throw new Error('JWT_SECRET not defined');

            const userData = {
                id: user[0].id,
                name: user[0].name,
                email: user[0].email,
                role: user[0].role
            };
            const token = jwt.sign(userData, jwtSecret, {expiresIn: '1h'});
            res.cookie('token', token, {
                httpOnly: true, 
                secure: true, 
                sameSite: 'strict', 
                maxAge: 1000 * 60 * 60
            });
            res.status(200).json({ message: 'User logged in successfully', data: userData });
        }
        catch (error) {
            res.status(500).json({ message: 'Error logging in user', error: error });
        }
    }
    
    static async logout(_req: Request, res: Response) {
        try {
            res.clearCookie('token');
            res.status(200).json({ message: 'User logged out successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error logging out user', error: error });
        }
    }
}
