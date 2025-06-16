import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome, FaQuestionCircle, FaCog, FaSignOutAlt, FaMoon, FaSun, FaLanguage,
  FaUsers, FaUserShield, FaKey, FaClock, FaFileAlt, FaBriefcase, FaFileContract
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../css/Sidebar.css';

export default function Sidebar({ isOpen }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { t, i18n} = useTranslation(['sidebar','common']);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { roles, permissions, logout } = useContext(AuthContext);

  /* ---------------- локальный state ---------------- */
  const [activeItem, setActiveItem] = useState('');

  /* ---------------- пункты меню ---------------- */
  const userItems = [
    { name: t('sidebar:DASHBOARD'), icon:<FaHome/>, path:'/dashboard',  required:'dashboard_view'  },
    { name: t('sidebar:QUESTIONS'), icon:<FaQuestionCircle/>, path:'/questions', required:'questions_read' }
  ];

  const adminItems = [
    { name: t('common:USERS'),      icon:<FaUsers/>, path:'/admin/users',      required:'user_pageView' },
    { name: t('common:ROLES'),      icon:<FaUserShield/>, path:'/admin/roles', required:'role_pageView' },
    { name: t('common:ACCESS'),     icon:<FaKey/>, path:'/admin/access',       required:'access_pageView' },
    { name: t('common:SESSIONS'),   icon:<FaClock/>, path:'/admin/sessions',   required:'session_pageView' },
    { name: t('common:LOGS'),       icon:<FaFileAlt/>, path:'/admin/logs',     required:'log_pageView' },
    { name: t('common:LANGUAGES'),  icon:<FaLanguage/>, path:'/admin/language', required:'language_pageView' }
  ];



  const settingsItem = { name: t('common:SETTINGS'), icon:<FaCog/>, path:'/settings' };

  /* ------------- активный пункт ------------- */
  useEffect(()=> {
    const all = [...userItems, ...adminItems,  settingsItem];
    const cur = all.find(i => location.pathname.startsWith(i.path));
    if (cur) setActiveItem(cur.name);
  }, [location, userItems, adminItems,  settingsItem]);

  /* ------------- права ------------- */
  const isSuperAdmin = roles?.some(r => r.name === 'superadmin');
  const byPermission = arr =>
    isSuperAdmin ? arr : arr.filter(i => (i.required ? permissions?.includes(i.required) : true));

  const u    = byPermission(userItems);
  const a    = byPermission(adminItems);

  /* ------------- handlers ------------- */
  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en');

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch(e) { console.error('Logout error', e); }
  };

  /* ------------- шаблон отрисовки секции ------------- */
  const renderSection = (title, items) => (
    items.length > 0 && (
      <>
        {isOpen && <h4 className="sidebar-section-title">{title}</h4>}
        <ul className="sidebar-menu">
          {items.map(i=>(
            <Link key={i.name} to={i.path} style={{textDecoration:'none',color:'inherit'}}>
              <li className={activeItem===i.name ? 'active' : ''}>
                {i.icon}
                {isOpen && <span>{i.name}</span>}
              </li>
            </Link>
          ))}
        </ul>
      </>
    )
  );

  /* ================= render ================= */
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-logo"><h2>DashStack</h2></div>

      {renderSection(t('sidebar:USER_SECTION'),  u)}
      {renderSection(t('sidebar:ADMIN_SECTION'), a)}

      {/* нижнее меню */}
      <ul className="sidebar-menu sidebar-bottom">
        <Link to={settingsItem.path} style={{textDecoration:'none',color:'inherit'}}>
          <li className={activeItem===settingsItem.name ? 'active' : ''}>
            {settingsItem.icon}
            {isOpen && <span>{settingsItem.name}</span>}
          </li>
        </Link>
        <li onClick={handleLogout}>
          <FaSignOutAlt/>
          {isOpen && <span>{t('common:LOGOUT')}</span>}
        </li>
      </ul>

      {/* тема / язык */}
      {isOpen && (
        <ul className="sidebar-menu sidebar-bottom extra-settings">
          <li onClick={toggleTheme}>
            {theme==='light' ? <FaMoon/> : <FaSun/>}
            <span>{theme==='light' ? t('sidebar:DARK_MODE') : t('sidebar:LIGHT_MODE')}</span>
          </li>
          <li onClick={toggleLanguage}>
            <FaLanguage/><span>{(i18n.language||'en').toUpperCase()}</span>
          </li>
        </ul>
      )}
    </div>
  );
}
