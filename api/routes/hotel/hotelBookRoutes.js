const express = require('express');
const router  = express.Router();
const ctrl    = require('../../controllers/hotel/hotelBookController');
const checkAccess = require('../../middlewares/checkAccess');

// GET    /api/hotel/bookings
router.get('/',            checkAccess('hotelBook_read'),   ctrl.list);
// GET    /api/hotel/bookings/:id
router.get('/:id',         checkAccess('hotelBook_read'),   ctrl.getById);
// POST   /api/hotel/bookings
router.post('/',           checkAccess('hotelBook_create'), ctrl.create);
// PUT    /api/hotel/bookings/:id
router.put('/:id',         checkAccess('hotelBook_update'), ctrl.update);
// DELETE /api/hotel/bookings/:id
router.delete('/:id',      checkAccess('hotelBook_delete'), ctrl.delete);

module.exports = router;
