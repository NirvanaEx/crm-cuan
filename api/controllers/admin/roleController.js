// controllers/roleController.js
const roleService = require('../../services/admin/roleService');

exports.getRoles = async (req, res, next) => {
    try {
        const roles = await roleService.getRoles();
        // Если необходимо фильтровать список ролей в зависимости от текущего пользователя,
        // данную логику можно вынести в отдельный сервис или middleware.
        if (req.user) {
            const currentRoles = req.user.roles.map(r => r.name.toLowerCase());
            let filteredRoles = roles;
            if (currentRoles.includes('superadmin')) {
                filteredRoles = roles.filter(r => r.name.toLowerCase() !== 'superadmin');
            } else if (currentRoles.includes('admin')) {
                filteredRoles = roles.filter(r => {
                    const name = r.name.toLowerCase();
                    return name !== 'superadmin' && name !== 'admin';
                });
            }
            return res.json(filteredRoles);
        }
        res.json(roles);
    } catch (error) {
        next(error);
    }
};

exports.getRoleById = async (req, res, next) => {
    try {
        const role = await roleService.getRoleById(req.params.id);
        if (!role) return res.status(404).json({ error: 'Роль не найдена' });
        res.json(role);
    } catch (error) {
        next(error);
    }
};

exports.createRole = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Название роли обязательно' });
        const role = await roleService.createRole(name);
        res.status(201).json(role);
    } catch (error) {
        next(error);
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        const role = await roleService.getRoleById(req.params.id);
        if (!role) return res.status(404).json({ error: 'Роль не найдена' });
        const { name } = req.body;
        const updated = await roleService.updateRole(req.params.id, name);
        if (!updated) return res.status(404).json({ error: 'Роль не найдена' });
        res.json({ message: 'Роль обновлена' });
    } catch (error) {
        next(error);
    }
};

exports.deleteRole = async (req, res, next) => {
    try {
        const role = await roleService.getRoleById(req.params.id);
        if (!role) return res.status(404).json({ error: 'Роль не найдена' });
        const deleted = await roleService.deleteRole(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Роль не найдена' });
        res.json({ message: 'Роль удалена' });
    } catch (error) {
        next(error);
    }
};
