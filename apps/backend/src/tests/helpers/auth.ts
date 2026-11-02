import jwt from 'jsonwebtoken';
import { accessTTL, jwtSecret } from '../../config/app';

interface UserJWTData {
    id: number,
    name: string,
    email: string,
    role: 'admin' | 'reader' | 'technician'
}

export function generateToken(userData: UserJWTData){
    if(!jwtSecret) throw new Error('JWT_SECRET not defined');

    return jwt.sign(userData, jwtSecret, {expiresIn: accessTTL});
}

export function generateAuthHeader(userData: UserJWTData){
    return {Authorization: `Bearer ${generateToken(userData)}`};
}