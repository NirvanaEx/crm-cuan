const authService = require('../services/auth/authService');
const db = require('../config/db');

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Отсутствует заголовок авторизации' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Неверный формат токена' });
    }
    try {
        // Получаем базовую информацию о пользователе
        const userData = await authService.getUserFromToken(token);

        if (!userData) {
            return res.status(401).json({ error: 'Неверный или просроченный токен' });
        }

        // Загрузка ролей пользователя
        const [roleRows] = await db.execute(
            'SELECT r.* FROM role r JOIN users_role ur ON r.id = ur.role_id WHERE ur.user_id = ?',
            [userData.id]
        );
        userData.roles = roleRows;

        // Загрузка разрешений на основе role_access
        const [permRows] = await db.execute(
            `SELECT a.name FROM access a
             JOIN role_access ra ON a.id = ra.access_id
             JOIN users_role ur ON ra.role_id = ur.role_id
             WHERE ur.user_id = ?`,
            [userData.id]
        );
        userData.permissions = permRows.map(r => r.name);

        req.user = userData;
        next();
    } catch (error) {
        console.error('Ошибка в authMiddleware:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};
