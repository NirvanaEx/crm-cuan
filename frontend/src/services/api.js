import axios from 'axios';
import { API_BASE_URL } from '../config';

// Создание инстанса axios с базовым URL
const api = axios.create({
    baseURL: API_BASE_URL
});

// Добавление интерцептора для автоматической подстановки токена из localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Формат заголовка может отличаться (Bearer и т.д.)
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
