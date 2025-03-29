// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            fetchUserData();
        }
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/auth/me');
            const userData = response.data.user;
            setUser(userData);
            setRoles(userData.roles || []);
            setPermissions(userData.permissions || []);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
            setIsAuthenticated(false);
            setUser(null);
            setRoles([]);
            setPermissions([]);
        }
    };

    const login = async (loginValue, passwordValue) => {
        try {
            const response = await api.post('/auth/login', { login: loginValue, password: passwordValue });
            const { token } = response.data;
            localStorage.setItem('authToken', token);
            await fetchUserData();
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('authToken');
            setUser(null);
            setRoles([]);
            setPermissions([]);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, roles, permissions, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
