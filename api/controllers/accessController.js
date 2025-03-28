const accessService = require('../services/accessService');

exports.getAccessList = async (req, res, next) => {
    try {
        const accessList = await accessService.getAccessList();
        res.json(accessList);
    } catch (error) {
        next(error);
    }
};


exports.getAccessById = async (req, res, next) => {
    try {
        const access = await accessService.getAccessById(req.params.id);
        if (!access) return res.status(404).json({ error: 'Доступ не найден' });
        res.json(access);
    } catch (error) {
        next(error);
    }
};

exports.createAccess = async (req, res, next) => {
    try {
        // Функционал доступен только для супер-админа
        if (!req.user || !req.user.roles || !req.user.roles.some(r => r.name.toLowerCase() === 'superadmin')) {
            return res.status(403).json({ error: 'Недостаточно прав для создания доступа' });
        }
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Название доступа обязательно' });
        const access = await accessService.createAccess(name);
        res.status(201).json(access);
    } catch (error) {
        next(error);
    }
};

exports.updateAccess = async (req, res, next) => {
    try {
        // Только супер-админ может обновлять доступы
        if (!req.user || !req.user.roles || !req.user.roles.some(r => r.name.toLowerCase() === 'superadmin')) {
            return res.status(403).json({ error: 'Недостаточно прав для обновления доступа' });
        }
        const { name } = req.body;
        const updated = await accessService.updateAccess(req.params.id, name);
        if (!updated) return res.status(404).json({ error: 'Доступ не найден' });
        res.json({ message: 'Доступ обновлен' });
    } catch (error) {
        next(error);
    }
};

exports.deleteAccess = async (req, res, next) => {
    try {
        // Только супер-админ может удалять доступы
        if (!req.user || !req.user.roles || !req.user.roles.some(r => r.name.toLowerCase() === 'superadmin')) {
            return res.status(403).json({ error: 'Недостаточно прав для удаления доступа' });
        }
        const deleted = await accessService.deleteAccess(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Доступ не найден' });
        res.json({ message: 'Доступ удален' });
    } catch (error) {
        next(error);
    }
};
