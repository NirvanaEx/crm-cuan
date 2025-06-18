// routes/carRoutes.js
const express     = require('express');
const router      = express.Router();
const carCtrl     = require('../../controllers/car/carController');
const checkAccess = require('../../middlewares/checkAccess');

router.get(
  '/available',
  checkAccess('car_read'),
  carCtrl.listAvailable
);

// Затем остальные CRUD-маршруты
router.get('/',        checkAccess('car_read'),   carCtrl.list);
router.get('/:id',     checkAccess('car_read'),   carCtrl.getById);
router.post('/',       checkAccess('car_create'), carCtrl.create);
router.put('/:id',     checkAccess('car_update'), carCtrl.update);
router.delete('/:id',  checkAccess('car_delete'), carCtrl.remove);

module.exports = router;
