import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaHome,
    FaQuestionCircle,
    FaCog,
    FaSignOutAlt,
    FaMoon,
    FaSun,
    FaLanguage,
    FaUsers,
    FaUserShield,
    FaKey,
    FaClock,
    FaFileAlt
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../css/Sidebar.css';

export default function Sidebar({ isOpen }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { roles, logout } = useContext(AuthContext);
    const [activeItem, setActiveItem] = useState(t('DASHBOARD'));

    const menuItems = [
        { name: t('DASHBOARD'), icon: <FaHome />, path: '/dashboard', roles: ['superadmin', 'admin', 'manager', 'user'] },
        { name: t('QUESTIONS'), icon: <FaQuestionCircle />, path: '/questions', roles: ['superadmin', 'admin', 'manager'] },
        { name: 'Пользователи', icon: <FaUsers />, path: '/admin/users', roles: ['superadmin', 'admin'] },
        { name: 'Роли', icon: <FaUserShield />, path: '/admin/roles', roles: ['superadmin'] },
        { name: 'Доступы', icon: <FaKey />, path: '/admin/access', roles: ['superadmin'] },
        { name: 'Сессии', icon: <FaClock />, path: '/admin/sessions', roles: ['superadmin', 'admin'] },
        { name: 'Логи', icon: <FaFileAlt />, path: '/admin/logs', roles: ['superadmin', 'admin'] },
    ];

    const pageItems = [];

    useEffect(() => {
        const allItems = [...menuItems, ...pageItems];
        const currentItem = allItems.find((item) =>
            location.pathname.includes(item.path)
        );
        if (currentItem) {
            setActiveItem(currentItem.name);
        }
    }, [location]);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ru' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = async () => {
        try {
            await logout(); // вызываем метод logout из AuthContext
            navigate('/login');
        } catch (error) {
            console.error("Ошибка при выходе:", error);
        }
    };

    // Формируем массив имен ролей пользователя, если roles возвращаются как объекты
    const userRoleNames = roles && roles.length ? roles.map(r => r.name) : [];

    const filteredMenuItems = menuItems.filter((item) =>
        item.roles.some((role) => userRoleNames.includes(role))
    );

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-logo">
                <h2>DashStack</h2>
            </div>

            <ul className="sidebar-menu">
                {filteredMenuItems.map((item) => (
                    <Link
                        to={item.path}
                        key={item.name}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <li className={activeItem === item.name ? 'active' : ''}>
                            {item.icon}
                            {isOpen && <span>{item.name}</span>}
                        </li>
                    </Link>
                ))}
            </ul>

            {isOpen && <h4 className="sidebar-section-title">{t('PAGES')}</h4>}
            <ul className="sidebar-menu">
                {pageItems.map((item) => (
                    <Link
                        to={item.path}
                        key={item.name}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <li className={activeItem === item.name ? 'active' : ''}>
                            {item.icon}
                            {isOpen && <span>{item.name}</span>}
                        </li>
                    </Link>
                ))}
            </ul>

            <ul className="sidebar-menu sidebar-bottom">
                <li
                    className={activeItem === t('SETTINGS') ? 'active' : ''}
                    onClick={() => setActiveItem(t('SETTINGS'))}
                >
                    <FaCog />
                    {isOpen && <span>{t('SETTINGS')}</span>}
                </li>
                <li
                    className={activeItem === t('LOGOUT') ? 'active' : ''}
                    onClick={handleLogout}
                >
                    <FaSignOutAlt />
                    {isOpen && <span>{t('LOGOUT')}</span>}
                </li>
            </ul>

            {isOpen && (
                <ul className="sidebar-menu sidebar-bottom extra-settings">
                    <li onClick={toggleTheme}>
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                        <span>{theme === 'light' ? t('DARK_MODE') : t('LIGHT_MODE')}</span>
                    </li>
                    <li onClick={toggleLanguage}>
                        <FaLanguage />
                        <span>{(i18n.language || 'en').toUpperCase()}</span>
                    </li>
                </ul>
            )}
        </div>
    );
}
