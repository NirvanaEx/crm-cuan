const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/certificate/certificateFieldController');
const checkAccess = require('../../middlewares/checkAccess');

router.get('/',      checkAccess('certificateField_read'),   ctrl.list);
router.get('/:id',   checkAccess('certificateField_read'),   ctrl.getById);
router.post('/',     checkAccess('certificateField_create'), ctrl.create);
router.put('/:id',   checkAccess('certificateField_update'), ctrl.update);
router.delete('/:id',checkAccess('certificateField_delete'), ctrl.delete);

module.exports = router;
