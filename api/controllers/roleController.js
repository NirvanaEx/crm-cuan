const roleService = require('../services/roleService');
const rolePolicy = require('../config/rolePolicy');

exports.getRoles = async (req, res, next) => {
    try {
        const roles = await roleService.getRoles();
        // Фильтрация ролей на основе тонкой настройки (если есть текущий пользователь)
        if (req.user) {
            const currentRoles = req.user.roles.map(r => r.name.toLowerCase());
            let filteredRoles = roles;
            if (currentRoles.includes('superadmin')) {
                // Суперадмин не видит роли "superadmin"
                filteredRoles = roles.filter(r => r.name.toLowerCase() !== 'superadmin');
            } else if (currentRoles.includes('admin')) {
                // Админ не видит роли "superadmin" и "admin"
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
        // Проверка тонкой настройки для просмотра
        if (req.user && !rolePolicy.canViewRole(req.user, role.name)) {
            return res.status(403).json({ error: 'Недостаточно прав для просмотра этой роли' });
        }
        res.json(role);
    } catch (error) {
        next(error);
    }
};

exports.createRole = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Название роли обязательно' });
        // Проверка тонкой настройки для создания роли
        if (req.user && !rolePolicy.canCreateRole(req.user, name)) {
            return res.status(403).json({ error: 'Недостаточно прав для создания роли с этим именем' });
        }
        const role = await roleService.createRole(name);
        res.status(201).json(role);
    } catch (error) {
        next(error);
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        const { name } = req.body;
        // Получаем текущую роль
        const role = await roleService.getRoleById(req.params.id);
        if (!role) return res.status(404).json({ error: 'Роль не найдена' });
        // Проверка тонкой настройки для обновления роли
        if (req.user && !rolePolicy.canModifyRole(req.user, role.name)) {
            return res.status(403).json({ error: 'Недостаточно прав для обновления этой роли' });
        }
        const updated = await roleService.updateRole(req.params.id, name);
        if (!updated) return res.status(404).json({ error: 'Роль не найдена' });
        res.json({ message: 'Роль обновлена' });
    } catch (error) {
        next(error);
    }
};

exports.deleteRole = async (req, res, next) => {
    try {
        // Получаем роль по id
        const role = await roleService.getRoleById(req.params.id);
        if (!role) return res.status(404).json({ error: 'Роль не найдена' });
        // Проверка тонкой настройки для удаления роли
        if (req.user && !rolePolicy.canModifyRole(req.user, role.name)) {
            return res.status(403).json({ error: 'Недостаточно прав для удаления этой роли' });
        }
        const deleted = await roleService.deleteRole(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Роль не найдена' });
        res.json({ message: 'Роль удалена' });
    } catch (error) {
        next(error);
    }
};
