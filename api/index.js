// index.js
const express = require('express');
const cors = require('cors');
const app = express();
app.set('trust proxy', true);

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

const authMiddleware = require('./middlewares/authMiddleware');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const accessRoutes = require('./routes/accessRoutes');
const roleAccessRoutes = require('./routes/roleAccessRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const profileRoutes = require('./routes/profileRoutes');


app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roles', authMiddleware, roleRoutes);
app.use('/api/access', authMiddleware, accessRoutes);
app.use('/api/role-access', authMiddleware, roleAccessRoutes);
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);

const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API запущен на порту ${PORT}`);
});
