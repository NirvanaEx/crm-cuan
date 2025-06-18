const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/admin/roleController');
const checkAccess = require('../../middlewares/checkAccess');

router.get('/', checkAccess('role_read'), roleController.getRoles);
router.get('/:id', checkAccess('role_read'), roleController.getRoleById);
router.post('/', checkAccess('role_create'), roleController.createRole);
router.put('/:id', checkAccess('role_update'), roleController.updateRole);
router.delete('/:id', checkAccess('role_delete'), roleController.deleteRole);

module.exports = router;
