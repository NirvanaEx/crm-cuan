// middlewares/checkAccess.js
const rolePolicy = require('../config/rolePolicy');

module.exports = function(requiredPermission, fineTuningRuleName) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Пользователь не авторизован' });
        }

        // Суперадмин имеет все права
        if (req.user.roles && req.user.roles.some(r => r.name.toLowerCase() === 'superadmin')) {
            return next();
        }

        // Если задана функция тонкой настройки и она определена в rolePolicy,
        // вызываем её для проверки. Здесь предполагается, что целевая роль
        // передается в req.body.role или req.body.roleId.
        if (fineTuningRuleName && typeof rolePolicy[fineTuningRuleName] === 'function') {
            const targetRole = req.body.role || req.body.roleId || null;
            if (!rolePolicy[fineTuningRuleName](req.user, targetRole)) {
                return res.status(403).json({ error: 'Недостаточно прав (тонкая настройка)' });
            }
            return next();
        }

        // Если тонкая настройка не задана, используем базовую проверку разрешений,
        // которые загружены в req.user.permissions (например, ['create_user', ...])
        const userPermissions = req.user.permissions || [];
        if (!userPermissions.includes(requiredPermission)) {
            return res.status(403).json({ error: 'Недостаточно прав (базовое разрешение)' });
        }

        next();
    };
};
