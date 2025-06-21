// index.js
const express = require('express');
const cors = require('cors');
const app = express();
app.set('trust proxy', true);

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

/*Подключение файлов*/
const authMiddleware = require('./middlewares/authMiddleware');

//Авторизация
const authRoutes = require('./routes/auth/authRoutes');
const publicRegRoutes = require('./routes/auth/registrationRoutes');


//Админ
const userRoutes = require('./routes/admin/userRoutes');
const roleRoutes = require('./routes/admin/roleRoutes');
const accessRoutes = require('./routes/admin/accessRoutes');
const roleAccessRoutes = require('./routes/admin/roleAccessRoutes');
const sessionRoutes = require('./routes/admin/sessionRoutes');
const languageRoutes = require('./routes/admin/languageRoutes');
const adminRegRoutes  = require('./routes/admin/registrationAdminRoutes');

//Профиль пользователя
const profileRoutes = require('./routes/profile/profileRoutes');
const userSettingRoutes = require('./routes/profile/userSettingRoutes');

//Бронирование авто
const carCategoryRoutes = require('./routes/car/carCategoryRoutes');
const carRoutes = require('./routes/car/carRoutes');
const carBookRoutes = require('./routes/car/carBookRoutes');


/*Роуты*/
//Авторизация
app.use('/api/auth', authRoutes);
app.use('/api/registration', publicRegRoutes);

//Админ
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/roles', authMiddleware, roleRoutes);
app.use('/api/access', authMiddleware, accessRoutes);
app.use('/api/role-access', authMiddleware, roleAccessRoutes);
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/language', authMiddleware, languageRoutes);
app.use('/api/admin/registration', authMiddleware ,adminRegRoutes);

//Профиль пользователя
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/user-setting', authMiddleware, userSettingRoutes);

//Бронирование авто
app.use('/api/car-categories', authMiddleware, carCategoryRoutes);
app.use('/api/cars',            authMiddleware, carRoutes);
app.use('/api/car-bookings', authMiddleware, carBookRoutes);

const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API запущен на порту ${PORT}`);
});
