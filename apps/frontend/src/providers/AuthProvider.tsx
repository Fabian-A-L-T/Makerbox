import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiLoader4Line } from '@remixicon/react';
import { AuthContext } from '@utils/authContext';
import type { User } from '../interfaces/auth';
import { makerboxApi, setAccessToken } from '../api/makerbox.api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const baseURL = import.meta.env.VITE_BACKEND_URL;

    // Restore auth state on app load so it logins right away if it has a refresh token
    useEffect(() => {
        console.log('Checking auth');
        axios.post(`${baseURL}/api/auth/refresh`, null, { withCredentials: true })
        .then(({ data }) => { 
            setAccessToken(data.accessToken);
            setIsAuthenticated(true);
            setUser(data.userData);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }, []);

    if(isLoading) return (
        <div className="flex flex-col items-center justify-center h-screen w-full fixed">
            <RiLoader4Line size={64} color="var(--color-text)" className='animate-spin' />
            <span className='font-semibold ml-2 text-lg'>Cargando...</span>
        </div>
    )

    async function login(email: string, passwd: string, remember: string) {
        await axios.post(`${baseURL}/api/auth/login`, { email, passwd, remember }, {withCredentials: true})
        .then((response) => {
            if (response.status !== 200) {
                throw new Error('Authentication failed');
            }
            setUser(response.data.userData);
            setAccessToken(response.data.accessToken);
            setIsAuthenticated(true);
        })
        .catch(() => {
            throw new Error('Authentication failed');
        })
    }

    async function logout() {
        await makerboxApi.post(`/api/auth/logout`, null)
        .then(() => {
            setUser(null);
            setAccessToken(null);
            setIsAuthenticated(false);
        })
        .catch(() => {
            throw new Error('Logout failed');
        })
    }
    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
