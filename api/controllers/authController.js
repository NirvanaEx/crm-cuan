const authService = require('../services/authService');``

exports.login = async (req, res, next) => {
    try {
        const { login, password, device } = req.body;
        // Получение IP-адреса из запроса
        const ipAddress = req.ip;
        if (!login || !password) {
            return res.status(400).json({ error: 'Поля login и password обязательны' });
        }
        const token = await authService.login(login, password, device, ipAddress);
        if (!token) {
            return res.status(401).json({ error: 'Неверные учетные данные' });
        }
        res.json({ token });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Пользователь не авторизован' });
        }
        res.json({ user: req.user });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Отсутствует заголовок авторизации' });
        }
        const token = authHeader.split(' ')[1];
        const result = await authService.logout(token);
        if (!result) {
            return res.status(400).json({ error: 'Ошибка при выходе из системы' });
        }
        res.json({ message: 'Вы успешно вышли из системы' });
    } catch (error) {
        next(error);
    }
};
