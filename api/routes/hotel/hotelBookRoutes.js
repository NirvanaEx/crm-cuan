// routes/hotel/hotelBookRoutes.js
const express     = require('express');
const router      = express.Router();
const ctrl        = require('../../controllers/hotel/hotelBookController');
const checkAccess = require('../../middlewares/checkAccess');

// Admin (all)
router.get(   '/pending',      checkAccess('hotelBook_read_all'),   ctrl.getPendingAll);
router.get(   '/active',       checkAccess('hotelBook_read_all'),   ctrl.getActiveAll);
router.get(   '/history',      checkAccess('hotelBook_read_all'),   ctrl.getHistoryAll);
router.put(   '/:id/status',   checkAccess('hotelBook_update_all'), ctrl.changeStatusAll);

// User (own)
router.get(   '/my/pending',   checkAccess('hotelBook_read_own'),   ctrl.getPendingOwn);
router.get(   '/my/active',    checkAccess('hotelBook_read_own'),   ctrl.getActiveOwn);
router.get(   '/my/history',   checkAccess('hotelBook_read_own'),   ctrl.getHistoryOwn);
router.put(   '/my/:id/status',checkAccess('hotelBook_update_own'), ctrl.changeStatusOwn);

// Shared create
router.post(  '/',             checkAccess('hotelBook_create'),     ctrl.create);

module.exports = router;
