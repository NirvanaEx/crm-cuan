// middlewares/checkAccess.js
const rolePolicy = require('../config/rolePolicy');

module.exports = function(requiredPermission) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Пользователь не авторизован' });
        }

        // Суперадмин имеет все права
        if (req.user.roles && req.user.roles.some(r => r.name.toLowerCase() === 'superadmin')) {
            return next();
        }

        // Базовая проверка прав доступа
        const userPermissions = req.user.permissions || [];
        if (!userPermissions.includes(requiredPermission)) {
            return res.status(403).json({ error: 'Недостаточно прав (базовое разрешение)' });
        }

        const parts = requiredPermission.split('_');
        if (parts.length === 2) {
            const [entity, operation] = parts;
            const ruleName = 'can' + operation.charAt(0).toUpperCase() + operation.slice(1);
            if (rolePolicy[entity] && typeof rolePolicy[entity][ruleName] === 'function') {
                const targetRole = req.body.role || req.body.roleId || null;
                if (!rolePolicy[entity][ruleName](req.user, targetRole)) {
                    return res.status(403).json({ error: 'Недостаточно прав (тонкая настройка)' });
                }
            }
        }
        next();
    };
};

