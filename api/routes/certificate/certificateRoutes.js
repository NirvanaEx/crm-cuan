// routes/certificate/certificateRoutes.js
const express     = require('express');
const router      = express.Router();
const checkAccess = require('../../middlewares/checkAccess');
const ctrl        = require('../../controllers/certificate/certificateController');

router.get('/',      checkAccess('certificate_read'),   ctrl.list);
router.get('/:id',   checkAccess('certificate_read'),   ctrl.getById);
router.post('/',     checkAccess('certificate_create'), ctrl.create);
router.put('/:id',   checkAccess('certificate_update'), ctrl.update);
router.delete('/:id',checkAccess('certificate_delete'), ctrl.delete);

module.exports = router;
