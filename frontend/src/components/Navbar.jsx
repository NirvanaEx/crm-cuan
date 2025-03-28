// src/components/Navbar.jsx
import React, { useState, useContext } from 'react';
import { FaBars, FaMoon, FaSun, FaLanguage } from 'react-icons/fa';
import Notifications from './Notifications';
import ProfileMenu from './ProfileMenu';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext'; // подключаем контекст авторизации
import { useTranslation } from 'react-i18next';
import '../css/Navbar.css';

export default function Navbar({ isSidebarOpen, setIsSidebarOpen }) {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const { theme, toggleTheme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);

    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ru' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Формируем ФИО из данных пользователя, если они есть
    const fullName = user
        ? `${user.surname || ''} ${user.name || ''} ${user.patronym || ''}`.trim()
        : 'Имя пользователя';

    // Если ролей несколько, можно, например, отобразить первую роль
    const userRole = user && user.roles && user.roles.length
        ? user.roles[0].name
        : 'Роль пользователя';

    // Если аватар отсутствует, используем placeholder
    const avatarSrc = user?.avatar || 'https://placehold.co/40?text=?';

    return (
        <div className="navbar">
            <div className="navbar-left">
                <FaBars className="hamburger-icon" onClick={handleToggleSidebar} />
            </div>

            <div className="navbar-right">
                <button className="theme-toggle-btn" onClick={toggleTheme}>
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>

                <div className="language-switch" onClick={toggleLanguage}>
                    <FaLanguage style={{ marginRight: '5px' }} />
                    {i18n.language.toUpperCase()}
                </div>

                <Notifications
                    isOpen={isNotificationsOpen}
                    setIsOpen={setIsNotificationsOpen}
                />

                <div className="user-info">
                    <img src={avatarSrc} alt="avatar" className="avatar" />
                    <div>
                        <div className="user-name">{fullName}</div>
                        <div className="user-role">{userRole}</div>
                    </div>
                </div>

                <ProfileMenu
                    isOpen={isProfileMenuOpen}
                    setIsOpen={setIsProfileMenuOpen}
                />
            </div>
        </div>
    );
}
