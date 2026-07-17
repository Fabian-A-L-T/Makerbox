import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { RiLoader4Line } from '@remixicon/react';

interface User {
    id: string
    name: string
    email: string
    role: string
}

export interface AuthState {
    isAuthenticated: boolean
    user: User | null
    login(email: string, passwd: string): Promise<void>
    logout(): void
    checkAuth(): void
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const baseURL = import.meta.env.VITE_BACKEND_URL;

    // Restore auth state on app load
    useEffect(() => {
        console.log('Checking auth');
        axios.get(`${baseURL}/auth/validate`, {
            withCredentials: true
        })
        .then((response) => {
            if (response.status === 200) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        })
        .catch(() => {
            console.log("Validation failed");
            setUser(null);
            setIsAuthenticated(false);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }, []);

    if(isLoading) return (
        <div className="flex flex-col items-center justify-center h-screen w-full fixed">
            <RiLoader4Line size={64} color="var(--color-text)" className='animate-spin' />
            <span className='font-semibold ml-2 text-lg'>Cargando...</span>
        </div>
    )

    async function login(email: string, passwd: string) {
        await axios.post(`${baseURL}/auth/login`, { email, passwd }, {withCredentials: true})
        .then((response) => {
            if (response.status !== 200) {
                throw new Error('Authentication failed');
            }
            setUser(response.data.data);
            setIsAuthenticated(true);
        })
        .catch(() => {
            throw new Error('Authentication failed');
        })
    }

    async function logout() {
        await axios.get(`${baseURL}/auth/logout`, {withCredentials: true})
        .then((response) => {
            if (response.status !== 200) {
                throw new Error('Logout failed');
            }
            setUser(null);
            setIsAuthenticated(false);
        })
        .catch(() => {
            throw new Error('Logout failed');
        })
    }

    async function checkAuth(){
        try {
            await axios.get(`${baseURL}/auth/validate`, {withCredentials: true});
        }
        catch (err: any) {
            setIsAuthenticated(false);
            setUser(null);
            console.log("Validation check failed");
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}