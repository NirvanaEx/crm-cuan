const express = require('express');
const router  = express.Router();
const ctrl    = require('../../controllers/hotel/hotelRoomController');
const checkAccess = require('../../middlewares/checkAccess');

// GET    /api/hotel/rooms
router.get('/',            checkAccess('hotelRoom_read'),   ctrl.list);

router.get(
  '/available',
   checkAccess('hotelRoom_read'),
   ctrl.listAvailable
);

// GET    /api/hotel/rooms/:id
router.get('/:id',         checkAccess('hotelRoom_read'),   ctrl.getById);
// POST   /api/hotel/rooms
router.post('/',           checkAccess('hotelRoom_create'), ctrl.create);
// PUT    /api/hotel/rooms/:id
router.put('/:id',         checkAccess('hotelRoom_update'), ctrl.update);
// DELETE /api/hotel/rooms/:id
router.delete('/:id',      checkAccess('hotelRoom_delete'), ctrl.delete);

module.exports = router;
