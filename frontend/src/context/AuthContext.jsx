// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);

    // При загрузке приложения проверяем, есть ли токен и пытаемся получить данные пользователя
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            fetchUserData();
        }
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/auth/me');
            // Если roles не переданы отдельно, берем их из user.roles
            const userData = response.data.user;
            setUser(userData);
            setRoles(userData.roles || []); // устанавливаем roles из user.roles, или пустой массив
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
            setIsAuthenticated(false);
            setUser(null);
            setRoles([]);
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
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, roles, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
