// src/pages/Login.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../css/Login.css';

export default function Login() {
    const [loginInput, setLoginInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const navigate = useNavigate();
    const { login: loginUser, isAuthenticated } = useContext(AuthContext);

    // Если пользователь уже авторизован, перенаправляем его
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Вызываем метод login, который обращается к API, получает токен и данные пользователя
            await loginUser(loginInput, passwordInput);
            navigate('/');
        } catch (error) {
            alert('Неверный логин или пароль');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Авторизация</h2>
                <input
                    type="text"
                    placeholder="Логин"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                />
                <button type="submit">Войти</button>
            </form>
        </div>
    );
}
