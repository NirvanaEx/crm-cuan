// controllers/accessController.js
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
        const deleted = await accessService.deleteAccess(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Доступ не найден' });
        res.json({ message: 'Доступ удален' });
    } catch (error) {
        next(error);
    }
};
