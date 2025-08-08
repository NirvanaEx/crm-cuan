const express     = require('express');
const router      = express.Router();
const ctrl        = require('../../controllers/coworking/coworkingRoomController');
const checkAccess = require('../../middlewares/checkAccess');

// Список комнат (с пагинацией/поиском)
router.get('/',            checkAccess('coworkingRoom_pageView'),  ctrl.list);
// Доступные комнаты на период (для формы создания брони)
router.get('/available',   checkAccess('coworkingRoom_pageView'),  ctrl.listAvailable);

// CRUD
router.get('/:id',         checkAccess('coworkingRoom_pageView'),  ctrl.getById);
router.post('/',           checkAccess('coworkingRoom_create'),    ctrl.create);
router.put('/:id',         checkAccess('coworkingRoom_update'),    ctrl.update);
router.delete('/:id',      checkAccess('coworkingRoom_delete'),    ctrl.remove);

module.exports = router;
