const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/hotel/hotelPhotoController');
const checkAccess = require('../../middlewares/checkAccess');

router.get('/',    checkAccess('hotelPhoto_read'),   ctrl.list);
router.get('/:id', checkAccess('hotelPhoto_read'),   ctrl.getById);
router.post('/',   checkAccess('hotelPhoto_create'), ctrl.create);
router.put('/:id', checkAccess('hotelPhoto_update'), ctrl.update);
router.delete('/:id', checkAccess('hotelPhoto_delete'), ctrl.delete);

module.exports = router;
