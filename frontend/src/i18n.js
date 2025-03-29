import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        common: {
            "HELLO": "Hello!",
            "WELCOME": "Welcome to my app",
            "SETTINGS": "Settings",
            "LOGOUT": "Logout",
            "USERS": "Users",
            "ROLES": "Roles",
            "ACCESS": "Access",
            "SESSIONS": "Sessions",
            "LOGS": "Logs"
        },
        sidebar: {
            "DASHBOARD": "Dashboard",
            "QUESTIONS": "Questions",
            "DARK_MODE": "Dark Mode",
            "LIGHT_MODE": "Light Mode",
            "USER_SECTION": "User",
            "ADMIN_SECTION": "Admin"
        }
    },
    ru: {
        common: {
            "HELLO": "Привет!",
            "WELCOME": "Добро пожаловать в моё приложение",
            "SETTINGS": "Настройки",
            "LOGOUT": "Выход",
            "USERS": "Пользователи",
            "ROLES": "Роли",
            "ACCESS": "Доступы",
            "SESSIONS": "Сессии",
            "LOGS": "Логи"
        },
        sidebar: {
            "DASHBOARD": "Панель",
            "QUESTIONS": "Вопросы",
            "DARK_MODE": "Тёмный режим",
            "LIGHT_MODE": "Светлый режим",
            "USER_SECTION": "Пользователь",
            "ADMIN_SECTION": "Админ"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        ns: ['common', 'sidebar'],
        defaultNS: 'common',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
