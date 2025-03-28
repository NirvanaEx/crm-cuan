// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "HELLO": "Hello!",
            "WELCOME": "Welcome to my app",
            "SETTINGS": "Settings",
            "LOGOUT": "Logout",
            "DASHBOARD": "Dashboard",
            "PRODUCTS": "Products",
            "FAVORITES": "Favorites",
            "INBOX": "Inbox",
            "ORDER_LISTS": "Order Lists",
            "PRODUCT_STOCK": "Product Stock",
            "PRICING": "Pricing",
            "CALENDAR": "Calendar",
            "TODO": "To-Do",
            "CONTACT": "Contact",
            "INVOICE": "Invoice",
            "UI_ELEMENTS": "UI Elements",
            "TEAM": "Team",
            "TABLE": "Table",
            "PAGES": "PAGES",
            "DARK_MODE": "Dark Mode",
            "LIGHT_MODE": "Light Mode",
            "LANGUAGE": "Language",
            "NOTIFICATIONS": "Notifications",
            "NOTIFICATION_1": "Notification 1",
            "NOTIFICATION_2": "Notification 2",
            "NOTIFICATION_3": "Notification 3",
            "QUESTIONS": "Questions",
            "QUESTION_NUMBER": "Question Number",
            "QUESTION": "Question",
            "CREATION_DATE": "Creation Date",
            "ADD_QUESTION": "Add Question",
            "EDIT_QUESTION": "Edit Question",
            "DELETE_QUESTION": "Delete Question",
            "SEARCH": "Search...",
            "NO_QUESTIONS": "No questions found",
            "SAVE": "Save"
        }
    },
    ru: {
        translation: {
            "HELLO": "Привет!",
            "WELCOME": "Добро пожаловать в моё приложение",
            "SETTINGS": "Настройки",
            "LOGOUT": "Выход",
            "DASHBOARD": "Панель",
            "PRODUCTS": "Продукты",
            "FAVORITES": "Избранное",
            "INBOX": "Входящие",
            "ORDER_LISTS": "Список заказов",
            "PRODUCT_STOCK": "Склад товаров",
            "PRICELIST": "Цены",
            "CALENDAR": "Календарь",
            "TODO": "Список дел",
            "CONTACT": "Контакты",
            "INVOICE": "Счёт",
            "UI_ELEMENTS": "Элементы UI",
            "TEAM": "Команда",
            "TABLE": "Таблица",
            "PAGES": "СТРАНИЦЫ",
            "DARK_MODE": "Тёмный режим",
            "LIGHT_MODE": "Светлый режим",
            "LANGUAGE": "Язык",
            "NOTIFICATIONS": "Уведомления",
            "NOTIFICATION_1": "Уведомление 1",
            "NOTIFICATION_2": "Уведомление 2",
            "NOTIFICATION_3": "Уведомление 3",
            "QUESTIONS": "Вопросы",
            "QUESTION_NUMBER": "Номер вопроса",
            "QUESTION": "Вопрос",
            "CREATION_DATE": "Дата создания",
            "ADD_QUESTION": "Добавить вопрос",
            "EDIT_QUESTION": "Редактировать вопрос",
            "DELETE_QUESTION": "Удалить вопрос",
            "SEARCH": "Поиск...",
            "NO_QUESTIONS": "Вопросы не найдены",
            "SAVE": "Сохранить"
        }
    }
};

i18n
    .use(LanguageDetector) // Определяет язык автоматически и сохраняет в localStorage
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en', // Язык по умолчанию
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
