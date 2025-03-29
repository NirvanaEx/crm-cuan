// controllers/roleAccessController.js
const roleAccessService = require('../services/roleAccessService');
const roleService = require('../services/roleService');
const rolePolicy = require('../config/rolePolicy');

exports.getRoleAccess = async (req, res, next) => {
    try {
        // Проверка прав для получения доступа для роли.
        if (!rolePolicy.canModifyRoleAccess(req.user)) {
            return res.status(403).json({ error: 'Недостаточно прав для просмотра доступа' });
        }
        const { roleId } = req.params;
        const role = await roleService.getRoleById(roleId);
        if (!role) {
            return res.status(404).json({ error: 'Роль не найдена' });
        }
        const accesses = await roleAccessService.getAccessForRole(roleId);
        res.json(accesses);
    } catch (error) {
        next(error);
    }
};

exports.addRoleAccess = async (req, res, next) => {
    try {
        // Проверка прав для добавления доступа.
        if (!rolePolicy.canModifyRoleAccess(req.user)) {
            return res.status(403).json({ error: 'Недостаточно прав для добавления доступа' });
        }
        const { roleId } = req.params;
        const { accessId } = req.body;
        if (!accessId) {
            return res.status(400).json({ error: 'accessId обязательно' });
        }
        const role = await roleService.getRoleById(roleId);
        if (!role) {
            return res.status(404).json({ error: 'Роль не найдена' });
        }
        const success = await roleAccessService.addAccessToRole(roleId, accessId);
        if (!success) {
            return res.status(400).json({ error: 'Не удалось добавить доступ для роли' });
        }
        res.status(201).json({ message: 'Доступ добавлен' });
    } catch (error) {
        next(error);
    }
};

exports.removeRoleAccess = async (req, res, next) => {
    try {
        // Проверка прав для удаления доступа.
        if (!rolePolicy.canModifyRoleAccess(req.user)) {
            return res.status(403).json({ error: 'Недостаточно прав для удаления доступа' });
        }
        const { roleId, accessId } = req.params;
        const role = await roleService.getRoleById(roleId);
        if (!role) {
            return res.status(404).json({ error: 'Роль не найдена' });
        }
        const success = await roleAccessService.removeAccessFromRole(roleId, accessId);
        if (!success) {
            return res.status(400).json({ error: 'Не удалось удалить доступ для роли' });
        }
        res.json({ message: 'Доступ удален' });
    } catch (error) {
        next(error);
    }
};
