// config/rolePolicy.js
// Определяет тонкие правила для операций над пользователями на основе ролей

const rolePolicy = {
    canCreateUser: (currentUser, targetRole) => {
        if (!currentUser) return false;
        // Если targetRole не задан или не строка, считаем, что тонкая настройка не требуется
        if (!targetRole || typeof targetRole !== 'string') return true;
        const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
        targetRole = targetRole.toLowerCase();
        // Суперадмин может создавать любые роли, кроме супер-админа
        if (currentRoles.includes('superadmin')) {
            return targetRole !== 'superadmin';
        }
        // Админ может создавать только роли, отличные от admin и superadmin
        if (currentRoles.includes('admin')) {
            return targetRole !== 'admin' && targetRole !== 'superadmin';
        }
        return false;
    },
    canUpdateUser: (currentUser, targetRole) => {
        if (!currentUser) return false;
        if (!targetRole || typeof targetRole !== 'string') return true;
        const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
        targetRole = targetRole.toLowerCase();
        // Редактирование супер-админа запрещено
        if (targetRole === 'superadmin') return false;
        // Если целевой пользователь admin, обновлять может только суперадмин
        if (targetRole === 'admin' && !currentRoles.includes('superadmin')) return false;
        return true;
    },
    canUpdateStatus: (currentUser, targetRole) => {
        if (!currentUser) return false;
        if (!targetRole || typeof targetRole !== 'string') return true;
        const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
        targetRole = targetRole.toLowerCase();
        // Изменение статуса супер-админа запрещено
        if (targetRole === 'superadmin') return false;
        if (targetRole === 'admin' && !currentRoles.includes('superadmin')) return false;
        return true;
    },
    canDeleteUser: (currentUser, targetRole) => {
        if (!currentUser) return false;
        if (!targetRole || typeof targetRole !== 'string') return true;
        const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
        targetRole = targetRole.toLowerCase();
        // Удаление супер-админа запрещено
        if (targetRole === 'superadmin') return false;
        if (targetRole === 'admin' && !currentRoles.includes('superadmin')) return false;
        return true;
    },

    // Для операций просмотра ролей
    canViewRole: (currentUser, targetRole) => {
        if (!currentUser) return false;
        // Если targetRole не задан или не строка, разрешаем
        if (!targetRole || typeof targetRole !== 'string') return true;
        const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
        targetRole = targetRole.toLowerCase();
        if (currentRoles.includes('superadmin')) {
            // Суперадмин не видит роли с именем superadmin
            return targetRole !== 'superadmin';
        }
        if (currentRoles.includes('admin')) {
            // Админ не видит роли с именами superadmin и admin
            return targetRole !== 'superadmin' && targetRole !== 'admin';
        }
        return false;
    },

    // Для операций создания, обновления, удаления ролей
    canModifyRole: (currentUser, targetRole) => {
        if (!currentUser) return false;
        if (!targetRole || typeof targetRole !== 'string') return false;
        const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
        targetRole = targetRole.toLowerCase();
        if (currentRoles.includes('superadmin')) {
            // Суперадмин не может модифицировать роль с именем superadmin
            return targetRole !== 'superadmin';
        }
        if (currentRoles.includes('admin')) {
            // Админ не может модифицировать роли с именами superadmin и admin
            return targetRole !== 'superadmin' && targetRole !== 'admin';
        }
        return false;
    },

    // При создании новой роли: проверка нового имени роли
    canCreateRole: (currentUser, newRoleName) => {
        if (!currentUser) return false;
        if (!newRoleName || typeof newRoleName !== 'string') return false;
        const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
        newRoleName = newRoleName.toLowerCase();
        if (currentRoles.includes('superadmin')) {
            // Суперадмин не может создавать роль с именем superadmin
            return newRoleName !== 'superadmin';
        }
        if (currentRoles.includes('admin')) {
            // Админ не может создавать роли с именами superadmin или admin
            return newRoleName !== 'superadmin' && newRoleName !== 'admin';
        }
        return false;
    }

};

module.exports = rolePolicy;
