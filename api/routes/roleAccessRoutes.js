const express = require('express');
const router = express.Router();
const roleAccessController = require('../controllers/roleAccessController');
const checkAccess = require('../middlewares/checkAccess');

// Получение списка доступов для роли
router.get('/:roleId/access', checkAccess('read_role_access', 'canModifyRoleAccess'), roleAccessController.getRoleAccess);

// Добавление доступа к роли
router.post('/:roleId/access', checkAccess('create_role_access', 'canModifyRoleAccess'), roleAccessController.addRoleAccess);

// Удаление доступа из роли
router.delete('/:roleId/access/:accessId', checkAccess('delete_role_access', 'canModifyRoleAccess'), roleAccessController.removeRoleAccess);

module.exports = router;
