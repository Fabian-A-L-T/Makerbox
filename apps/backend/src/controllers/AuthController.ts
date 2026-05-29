import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { UserEmail, UserPassword } from '../models/schemas.js';
import { safeParse, string } from 'valibot';
import { ValidationError, NotFoundError } from '../errors.js';
import bcrypt from 'bcrypt';
import { loadEnvFile } from 'node:process';

loadEnvFile('.env');

class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const {name, email, passwd} = req.body;

            const validatedName = safeParse(string(), name);
            if(!validatedName.success) throw new ValidationError();
            
            const validatedEmail = safeParse(UserEmail, email);
            if(!validatedEmail.success) throw new ValidationError();

            const validatedPasswd = safeParse(UserPassword, passwd);
            if(!validatedPasswd.success) throw new ValidationError();

            const userExists = await User.exists(validatedEmail.output);
            if(userExists) throw new Error('User already exists');

            const hashPasswd = await bcrypt.hash(validatedPasswd.output, 10);
            
            const user = await User.create({name: validatedName.output, email: validatedEmail.output, passwd: hashPasswd});
            res.status(201).json({ message: 'User registered successfully', data: user });

        } catch (error) {
            res.status(500).json({ message: 'Error registering user', error: error });
        }
    }
    static async login(req: Request, res: Response) {
        try {
            const {email, passwd} = req.body;
            
            const validatedEmail = safeParse(UserEmail, email);
            if(!validatedEmail.success) throw new ValidationError();

            const validatedPasswd = safeParse(UserPassword, passwd);
            if(!validatedPasswd.success) throw new ValidationError();
            
            const user = await User.login(validatedEmail.output);
            if(!user) throw new NotFoundError();

            const validPasswd = await bcrypt.compare(validatedPasswd.output, user.passwd);
            if(!validPasswd) throw new ValidationError();

            const JWT_SECRET = process.env.JWT_SECRET;
            if(!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };
            const token = jwt.sign(userData, JWT_SECRET, {expiresIn: '1h'});
            res.cookie('token', token, 
                {
                    httpOnly: true, 
                    secure: true, 
                    sameSite: 'strict', 
                    maxAge: 1000 * 60 * 60
                });
            res.status(200).json({ 
                message: 'User logged in successfully', 
                data: userData
            });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in user', error: error });
        }
    }
    static async logout(req: Request, res: Response) {
        try {
            res.clearCookie('token');
            res.status(200).json({ message: 'User logged out successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error logging out user', error: error });
        }
    }
}
export default AuthController;