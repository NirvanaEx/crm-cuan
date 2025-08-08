import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    common: {
      USERS:       "Users",
      ROLES:       "Roles",
      ACCESS:      "Access",
      SESSIONS:    "Sessions",
      LOGS:        "Logs",
      LANGUAGES:   "Languages",
      SETTINGS:    "Settings",
      LOGOUT:      "Logout"
    },
    sidebar: {
      ADMIN_SECTION:       "Admin",
      CAR_SECTION:         "Cars",
      HOTEL_SECTION:       "Hotel",
      CERTIFICATE_SECTION: "Certificates",
      COWORKING_SECTION:   "Coworking",

      CAR_BOOKINGS:         "Bookings",
      CAR_CATEGORIES:       "Categories",
      CAR_MODELS:           "Models",
      CAR_CALENDAR:         "Calendar",

      HOTEL_ROOMS:          "Rooms",
      HOTEL_BOOKINGS:       "Bookings",

      CERTIFICATES:         "Certificates",
      CERTIFICATE_FIELDS:   "Fields",
      CERTIFICATE_REQUESTS: "Requests",

      COWORKING_ROOMS:     "Rooms",
      COWORKING_BOOKINGS:  "Bookings",

      DARK_MODE:   "Dark Mode",
      LIGHT_MODE:  "Light Mode",
      REGISTRATIONS: "Registrations"
    }
  },
  ru: {
    common: {
      USERS:       "Пользователи",
      ROLES:       "Роли",
      ACCESS:      "Доступы",
      SESSIONS:    "Сессии",
      LOGS:        "Логи",
      LANGUAGES:   "Языки",
      SETTINGS:    "Настройки",
      LOGOUT:      "Выход"
    },
    sidebar: {
      ADMIN_SECTION:       "Админ",
      CAR_SECTION:         "Автомобили",
      HOTEL_SECTION:       "Отели",
      CERTIFICATE_SECTION: "Справки",
      COWORKING_SECTION:   "Коворкинг", 

      CAR_BOOKINGS:         "Бронирования",
      CAR_CATEGORIES:       "Категории авто",
      CAR_MODELS:           "Модели авто",
      CAR_CALENDAR:         "Календарь",

      HOTEL_ROOMS:          "Номера",
      HOTEL_BOOKINGS:       "Бронирования",

      CERTIFICATES:         "Справки",
      CERTIFICATE_FIELDS:   "Поля справок",
      CERTIFICATE_REQUESTS: "Запросы",

      COWORKING_ROOMS:     "Комнаты",
      COWORKING_BOOKINGS:  "Бронирования",

      DARK_MODE:   "Тёмный режим",
      LIGHT_MODE:  "Светлый режим",
      REGISTRATIONS: "Регистрации"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['common','sidebar'],
    defaultNS: 'common',
    interpolation: { escapeValue: false }
  });

export default i18n;
