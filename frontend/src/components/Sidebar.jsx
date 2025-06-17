// src/components/Sidebar.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaCog, FaSignOutAlt, FaMoon, FaSun, FaLanguage,
  FaUsers, FaUserShield, FaKey, FaClock, FaFileAlt,
  FaFileContract, FaLayerGroup, FaCar
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../css/Sidebar.css';

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(['sidebar','common']);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { roles, permissions, logout } = useContext(AuthContext);

  const [activeItem, setActiveItem] = useState('');

  const adminItems = [
    { name: t('common:USERS'),      icon: <FaUsers/>,        path: '/admin/users',      required: 'user_pageView' },
    { name: t('common:ROLES'),      icon: <FaUserShield/>,   path: '/admin/roles',      required: 'role_pageView' },
    { name: t('common:ACCESS'),     icon: <FaKey/>,          path: '/admin/access',     required: 'access_pageView' },
    { name: t('common:SESSIONS'),   icon: <FaClock/>,        path: '/admin/sessions',   required: 'session_pageView' },
    { name: t('common:LOGS'),       icon: <FaFileAlt/>,      path: '/admin/logs',       required: 'log_pageView' },
    { name: t('common:LANGUAGES'),  icon: <FaLanguage/>,     path: '/admin/language',   required: 'language_pageView' }
  ];

  const carItems = [
    { name: t('sidebar:CAR_BOOKINGS'),    icon: <FaFileContract/>, path: '/car-book',       required: 'carBook_read' },
    { name: t('sidebar:CAR_CATEGORIES'),  icon: <FaLayerGroup/>,    path: '/car-categories', required: 'carCategory_read' },
    { name: t('sidebar:CAR_MODELS'),      icon: <FaCar/>,           path: '/car-models',     required: 'car_read' }
  ];

  const settingsItem = { name: t('common:SETTINGS'), icon: <FaCog/>, path: '/settings' };

  // Determine active item
  useEffect(() => {
    const all = [...adminItems, ...carItems, settingsItem];
    const cur = all.find(i => location.pathname.startsWith(i.path));
    if (cur) setActiveItem(cur.name);
  }, [location, adminItems, carItems, settingsItem]);

  // Filter by permissions
  const isSuperAdmin = roles?.some(r => r.name === 'superadmin');
  const byPerm = arr =>
    isSuperAdmin ? arr : arr.filter(i => permissions.includes(i.required));
  const adminAllowed = byPerm(adminItems);
  const carAllowed   = byPerm(carItems);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en');

  const renderSection = (title, items) => (
    items.length > 0 && (
      <>
        {isOpen && <h4 className="sidebar-section-title">{title}</h4>}
        <ul className="sidebar-menu">
          {items.map(i => (
            <Link key={i.name} to={i.path} style={{ textDecoration: 'none', color: 'inherit' }}>
              <li className={activeItem === i.name ? 'active' : ''}>
                {i.icon}
                {isOpen && <span>{i.name}</span>}
              </li>
            </Link>
          ))}
        </ul>
      </>
    )
  );

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-logo">
        <h2>DashStack</h2>
      </div>

      {/* Scrollable menu wrapper */}
      <div className="sidebar-menu-wrapper">
        {/* Admin section */}
        {renderSection(t('sidebar:ADMIN_SECTION'), adminAllowed)}

        {/* Cars section */}
        {renderSection(t('sidebar:CAR_SECTION'), carAllowed)}
      </div>

      {/* Settings and Logout */}
      <ul className="sidebar-menu sidebar-bottom">
        <Link to={settingsItem.path} style={{ textDecoration: 'none', color: 'inherit' }}>
          <li className={activeItem === settingsItem.name ? 'active' : ''}>
            {settingsItem.icon}
            {isOpen && <span>{settingsItem.name}</span>}
          </li>
        </Link>
        <li onClick={handleLogout}>
          <FaSignOutAlt />
          {isOpen && <span>{t('common:LOGOUT')}</span>}
        </li>
      </ul>

      {isOpen && (
        <ul className="sidebar-menu extra-settings">
          <li onClick={toggleTheme}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
            <span>{theme === 'light' ? t('sidebar:DARK_MODE') : t('sidebar:LIGHT_MODE')}</span>
          </li>
          <li onClick={toggleLanguage}>
            <FaLanguage /><span>{(i18n.language || 'en').toUpperCase()}</span>
          </li>
        </ul>
      )}
    </div>
  );
}
