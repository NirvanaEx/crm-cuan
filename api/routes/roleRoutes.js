const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const checkAccess = require('../middlewares/checkAccess');

// Применяются базовые разрешения и тонкая настройка из rolePolicy
router.get('/', checkAccess('read_role', 'canViewRole'), roleController.getRoles);
router.get('/:id', checkAccess('read_role', 'canViewRole'), roleController.getRoleById);
router.post('/', checkAccess('create_role', 'canCreateRole'), roleController.createRole);
router.put('/:id', checkAccess('update_role', 'canModifyRole'), roleController.updateRole);
router.delete('/:id', checkAccess('delete_role', 'canModifyRole'), roleController.deleteRole);

module.exports = router;
