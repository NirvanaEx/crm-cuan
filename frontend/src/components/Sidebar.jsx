import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaQuestionCircle, FaCog, FaSignOutAlt, FaMoon, FaSun, FaLanguage, FaUsers, FaUserShield, FaKey, FaClock, FaFileAlt } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../css/Sidebar.css';

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(['sidebar', 'common']);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { roles, permissions, logout } = useContext(AuthContext);
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    console.log('Permissions в Sidebar:', permissions);
  }, [permissions]);

  const userItems = [
    { name: t('sidebar:DASHBOARD'), icon: <FaHome />, path: '/dashboard', requiredPermission: 'dashboard_view' },
    { name: t('sidebar:QUESTIONS'), icon: <FaQuestionCircle />, path: '/questions', requiredPermission: 'questions_read' },
  ];

  const adminItems = [
    { name: t('common:USERS'), icon: <FaUsers />, path: '/admin/users', requiredPermission: 'user_read' },
    { name: t('common:ROLES'), icon: <FaUserShield />, path: '/admin/roles', requiredPermission: 'role_read' },
    { name: t('common:ACCESS'), icon: <FaKey />, path: '/admin/access', requiredPermission: 'access_read' },
    { name: t('common:SESSIONS'), icon: <FaClock />, path: '/admin/sessions', requiredPermission: 'session_read' },
    { name: t('common:LOGS'), icon: <FaFileAlt />, path: '/admin/logs', requiredPermission: 'log_read' },
  ];

  const settingsItem = { name: t('common:SETTINGS'), icon: <FaCog />, path: '/settings' };

  useEffect(() => {
    const allItems = [...userItems, ...adminItems, settingsItem];
    const currentItem = allItems.find(item => location.pathname.includes(item.path));
    if (currentItem) {
      setActiveItem(currentItem.name);
    }
  }, [location, userItems, adminItems, settingsItem]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  const isSuperAdmin = roles && roles.some(role => role.name === 'superadmin');

  const filterItems = items => {
    if (isSuperAdmin) {
      return items;
    }
    return items.filter(item => {
      if (item.requiredPermission) {
        return (permissions || []).includes(item.requiredPermission);
      }
      return true;
    });
  };

  const filteredUserItems = filterItems(userItems);
  const filteredAdminItems = filterItems(adminItems);

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-logo">
        <h2>DashStack</h2>
      </div>

      {filteredUserItems.length > 0 && (
        <>
          {isOpen && <h4 className="sidebar-section-title">{t('sidebar:USER_SECTION')}</h4>}
          <ul className="sidebar-menu">
            {filteredUserItems.map(item => (
              <Link to={item.path} key={item.name} style={{ textDecoration: 'none', color: 'inherit' }}>
                <li className={activeItem === item.name ? 'active' : ''}>
                  {item.icon}
                  {isOpen && <span>{item.name}</span>}
                </li>
              </Link>
            ))}
          </ul>
        </>
      )}

      {filteredAdminItems.length > 0 && (
        <>
          {isOpen && <h4 className="sidebar-section-title">{t('sidebar:ADMIN_SECTION')}</h4>}
          <ul className="sidebar-menu">
            {filteredAdminItems.map(item => (
              <Link to={item.path} key={item.name} style={{ textDecoration: 'none', color: 'inherit' }}>
                <li className={activeItem === item.name ? 'active' : ''}>
                  {item.icon}
                  {isOpen && <span>{item.name}</span>}
                </li>
              </Link>
            ))}
          </ul>
        </>
      )}

      <ul className="sidebar-menu sidebar-bottom">
        <Link to={settingsItem.path} style={{ textDecoration: 'none', color: 'inherit' }}>
          <li className={activeItem === settingsItem.name ? 'active' : ''}>
            {settingsItem.icon}
            {isOpen && <span>{settingsItem.name}</span>}
          </li>
        </Link>
        <li className={activeItem === t('common:LOGOUT') ? 'active' : ''} onClick={handleLogout}>
          <FaSignOutAlt />
          {isOpen && <span>{t('common:LOGOUT')}</span>}
        </li>
      </ul>

      {isOpen && (
        <ul className="sidebar-menu sidebar-bottom extra-settings">
          <li onClick={toggleTheme}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
            <span>{theme === 'light' ? t('sidebar:DARK_MODE') : t('sidebar:LIGHT_MODE')}</span>
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
