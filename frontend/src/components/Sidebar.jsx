// src/components/Sidebar.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaCog, FaSignOutAlt, FaMoon, FaSun, FaLanguage,
  FaUsers, FaUserShield, FaKey, FaClock, FaFileAlt,
  FaFileContract, FaLayerGroup, FaCar, FaUserPlus, FaBed, FaCertificate
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext }  from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../css/Sidebar.css';

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(['sidebar','common']);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { roles, permissions, logout } = useContext(AuthContext);

  // Новый state: путь активного пункта
  const [activePath, setActivePath] = useState('');

  // Проверка суперадмина
  const isSuperAdmin = roles?.some(r => r.name.toLowerCase() === 'superadmin');
  const byPerm = arr => isSuperAdmin ? arr : arr.filter(i => permissions.includes(i.required));

  // Меню
  const adminItems = [
    { name: t('common:USERS'),        icon:<FaUsers/>,        path:'/admin/users',        required:'user_pageView' },
    { name: t('common:ROLES'),        icon:<FaUserShield/>,   path:'/admin/roles',        required:'role_pageView' },
    { name: t('common:ACCESS'),       icon:<FaKey/>,          path:'/admin/access',       required:'access_pageView' },
    { name: t('common:SESSIONS'),     icon:<FaClock/>,        path:'/admin/sessions',     required:'session_pageView' },
    { name: t('common:LOGS'),         icon:<FaFileAlt/>,      path:'/admin/logs',         required:'log_pageView' },
    { name: t('common:LANGUAGES'),    icon:<FaLanguage/>,     path:'/admin/language',     required:'language_pageView' },
    { name: t('sidebar:REGISTRATIONS'),icon:<FaUserPlus/>,    path:'/admin/registration', required:'registration_read' }
  ];
  const carItems = [
    { name: t('sidebar:CAR_BOOKINGS'),   icon:<FaFileContract/>, path:'/car-book',      required:'carBook_pageView' },
    { name: t('sidebar:CAR_CATEGORIES'), icon:<FaLayerGroup/>,   path:'/car-categories',required:'carCategory_pageView' },
    { name: t('sidebar:CAR_MODELS'),     icon:<FaCar/>,          path:'/car-models',    required:'car_pageView' },
    { name: t('sidebar:CAR_CALENDAR'),   icon:<FaClock/>,        path:'/car-calendar',  required:'carBookCalendar_pageView' }
  ];
  const hotelItems = [
    { name: t('sidebar:HOTEL_ROOMS'),    icon:<FaBed/>,          path:'/hotel/rooms',    required:'hotelRoom_pageView' },
    { name: t('sidebar:HOTEL_BOOKINGS'), icon:<FaFileContract/>, path:'/hotel/bookings', required:'hotelBook_pageView' }
  ];
  const certificateItems = [
    { name: t('sidebar:CERTIFICATES'),        icon:<FaCertificate/>, path:'/certificates',       required:'certificate_read' },
    { name: t('sidebar:CERTIFICATE_FIELDS'),  icon:<FaFileAlt/>,     path:'/certificate-fields', required:'certificateField_read' },
    { name: t('sidebar:CERTIFICATE_REQUESTS'),icon:<FaFileContract/>,path:'/certificate-requests',required:'certificateRequest_read' }
  ];
  const settingsItem = { name: t('common:SETTINGS'), icon:<FaCog/>, path:'/settings' };

  // Фильтруем по правам
  const adminAllowed       = byPerm(adminItems);
  const carAllowed         = byPerm(carItems);
  const hotelAllowed       = byPerm(hotelItems);
  const certificateAllowed = byPerm(certificateItems);

  // При изменении маршрута — находим первый подходящий пункт и сохраняем его path
  useEffect(() => {
    const all = [
      ...adminItems,
      ...carItems,
      ...hotelItems,
      ...certificateItems,
      settingsItem
    ];
    const cur = all.find(i => location.pathname.startsWith(i.path));
    setActivePath(cur ? cur.path : '');
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en');

  // Рендер секции
  const renderSection = (title, items) => (
    items.length > 0 && (
      <div className="sidebar-section">
        {isOpen && <h4 className="sidebar-section-title">{title}</h4>}
        <ul className="sidebar-menu">
          {items.map(i => (
            <Link key={i.path} to={i.path} className="sidebar-link">
              <li className={activePath === i.path ? 'active' : ''}>
                {i.icon}
                {isOpen && <span>{i.name}</span>}
              </li>
            </Link>
          ))}
        </ul>
      </div>
    )
  );

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-logo"><h2>DashStack</h2></div>
      <div className="sidebar-menu-wrapper">
        {renderSection(t('sidebar:ADMIN_SECTION'), adminAllowed)}
        {renderSection(t('sidebar:CAR_SECTION'), carAllowed)}
        {renderSection(t('sidebar:HOTEL_SECTION'), hotelAllowed)}
        {renderSection(t('sidebar:CERTIFICATE_SECTION'), certificateAllowed)}
      </div>
      <ul className="sidebar-menu sidebar-bottom">
        <Link to={settingsItem.path} className="sidebar-link">
          <li className={activePath===settingsItem.path?'active':''}>
            {settingsItem.icon}
            {isOpen && <span>{settingsItem.name}</span>}
          </li>
        </Link>
        <li onClick={handleLogout}>
          <FaSignOutAlt/>
          {isOpen && <span>{t('common:LOGOUT')}</span>}
        </li>
      </ul>
      {isOpen && (
        <ul className="sidebar-menu extra-settings">
          <li onClick={toggleTheme}>
            {theme==='light'?<FaMoon/>:<FaSun/>}
            <span>{theme==='light'?t('sidebar:DARK_MODE'):t('sidebar:LIGHT_MODE')}</span>
          </li>
          <li onClick={toggleLanguage}>
            <FaLanguage/>
            <span>{i18n.language.toUpperCase()}</span>
          </li>
        </ul>
      )}
    </div>
  );
}
