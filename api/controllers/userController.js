// controllers/userController.js
const userService = require('../services/userService');

exports.createUserWithRole = async (req, res, next) => {
    try {
        const { login, password, surname, name, patronym, phone, roleId } = req.body;
        if (!login || !password || !surname || !name || !roleId) {
            return res.status(400).json({ error: 'Обязательные поля: login, password, surname, name, roleId' });
        }
        const user = await userService.createUserWithRole(req.user, { login, password, surname, name, patronym, phone, roleId });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        const users = await userService.getUsers(req.user);
        res.json(users);
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        let user;
        if (req.user && req.user.roles && req.user.roles.some(r => r.name.toLowerCase() === 'superadmin')) {
            user = await userService.getUserFullDetails(req.params.id);
        } else {
            user = await userService.getUserById(req.params.id);
        }
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { login, password, surname, name, patronym, phone, roleId, status } = req.body;
        const updated = await userService.updateUserFull(req.user, req.params.id, { login, password, surname, name, patronym, phone, roleId, status });
        if (!updated) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json({ message: 'Пользователь обновлён' });
    } catch (error) {
        next(error);
    }
};

exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['active', 'banned', 'deleted'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Неверный статус' });
        }
        const updated = await userService.updateUserStatus(req.user, req.params.id, status);
        if (!updated) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json({ message: 'Статус пользователя обновлён' });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const removed = await userService.deleteUser(req.user, req.params.id);
        if (!removed) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json({ message: 'Пользователь удалён' });
    } catch (error) {
        next(error);
    }
};
