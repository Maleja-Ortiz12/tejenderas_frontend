import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'client';
    address?: string;
    phone?: string;
    city?: string;
    department?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string, passwordConfirmation: string, address: string, phone: string, city: string, department: string) => Promise<User>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, [token]);

    const login = async (email: string, password: string) => {
        const response = await api.post('/login', { email, password });
        const { user, token } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return user;
    };

    const register = async (name: string, email: string, password: string, passwordConfirmation: string, address: string, phone: string, city: string, department: string) => {
        const response = await api.post('/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            address,
            phone,
            city,
            department,
        });
        const { user, token } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return user;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
