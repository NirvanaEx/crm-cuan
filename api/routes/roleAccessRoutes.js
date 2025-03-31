// routes/roleAccessRoutes.js
const express = require('express');
const router = express.Router();
const roleAccessController = require('../controllers/roleAccessController');
const checkAccess = require('../middlewares/checkAccess');

// Получение списка доступов для роли
router.get('/:roleId/access', checkAccess('roleAccess_read'), roleAccessController.getRoleAccess);

// Добавление доступа к роли
router.post('/:roleId/access', checkAccess('roleAccess_create'), roleAccessController.addRoleAccess);

// Удаление доступа из роли
router.delete('/:roleId/access/:accessId', checkAccess('roleAccess_delete'), roleAccessController.removeRoleAccess);

module.exports = router;
