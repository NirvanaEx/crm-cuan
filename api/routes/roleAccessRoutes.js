const express = require('express');
const router = express.Router();
const roleAccessController = require('../controllers/roleAccessController');

// Получение списка доступов для роли
router.get('/:roleId/access', roleAccessController.getRoleAccess);

// Добавление доступа к роли
router.post('/:roleId/access', roleAccessController.addRoleAccess);

// Удаление доступа из роли
router.delete('/:roleId/access/:accessId', roleAccessController.removeRoleAccess);

module.exports = router;
