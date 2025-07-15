// routes/certificate/certificateRequestRoutes.js
const express     = require('express');
const router      = express.Router();
const checkAccess = require('../../middlewares/checkAccess');
const ctrl        = require('../../controllers/certificate/certificateRequestController');

router.get('/',      ctrl.list);
router.get('/:id',   ctrl.getById);
router.post('/',     checkAccess('certificateRequest_create'),  ctrl.create);
router.put('/:id',   checkAccess('certificateRequest_update'),  ctrl.update);
router.delete('/:id',checkAccess('certificateRequest_delete'),  ctrl.delete);

module.exports = router;
