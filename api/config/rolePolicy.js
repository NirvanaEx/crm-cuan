// config/rolePolicy.js

const rolePolicy = {
    user: {
        canCreate: (currentUser, targetRole) => {
            if (!currentUser) return false;
            if (!targetRole || typeof targetRole !== 'string') return true;
            const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
            targetRole = targetRole.toLowerCase();
            if (currentRoles.includes('superadmin')) {
                return targetRole !== 'superadmin';
            }
            if (currentRoles.includes('admin')) {
                return targetRole !== 'admin' && targetRole !== 'superadmin';
            }
            return false;
        },
        canUpdate: (currentUser, targetRole) => {
            if (!currentUser) return false;
            if (!targetRole || typeof targetRole !== 'string') return true;
            const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
            targetRole = targetRole.toLowerCase();
            if (targetRole === 'superadmin') return false;
            if (targetRole === 'admin' && !currentRoles.includes('superadmin')) return false;
            return true;
        },
        canDelete: (currentUser, targetRole) => {
            if (!currentUser) return false;
            if (!targetRole || typeof targetRole !== 'string') return true;
            const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
            targetRole = targetRole.toLowerCase();
            if (targetRole === 'superadmin') return false;
            if (targetRole === 'admin' && !currentRoles.includes('superadmin')) return false;
            return true;
        }
    },
    role: {
        canView: (currentUser, targetRole) => {
            if (!currentUser) return false;
            if (!targetRole || typeof targetRole !== 'string') return true;
            const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
            targetRole = targetRole.toLowerCase();
            if (currentRoles.includes('superadmin')) {
                return targetRole !== 'superadmin';
            }
            if (currentRoles.includes('admin')) {
                return targetRole !== 'superadmin' && targetRole !== 'admin';
            }
            return false;
        },
        canCreate: (currentUser, newRoleName) => {
            if (!currentUser) return false;
            if (!newRoleName || typeof newRoleName !== 'string') return false;
            const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
            newRoleName = newRoleName.toLowerCase();
            if (currentRoles.includes('superadmin')) {
                return newRoleName !== 'superadmin';
            }
            if (currentRoles.includes('admin')) {
                return newRoleName !== 'superadmin' && newRoleName !== 'admin';
            }
            return false;
        },
        canModify: (currentUser, targetRole) => {
            // Используется и для обновления, и для удаления
            if (!currentUser) return false;
            if (!targetRole || typeof targetRole !== 'string') return false;
            const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
            targetRole = targetRole.toLowerCase();
            if (currentRoles.includes('superadmin')) {
                return targetRole !== 'superadmin';
            }
            if (currentRoles.includes('admin')) {
                return targetRole !== 'superadmin' && targetRole !== 'admin';
            }
            return false;
        }
    },
    roleAccess: {
        canModifyRoleAccess: (currentUser) => {
            if (!currentUser) return false;
            const currentRoles = currentUser.roles.map(r => r.name.toLowerCase());
            return currentRoles.includes('superadmin');
        }
    },
   
};

module.exports = rolePolicy;
