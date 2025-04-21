const express = require('express');
const router  = express.Router();
const contractController = require('../controllers/employmentContractController');
const checkAccess = require('../middlewares/checkAccess');

router.get('/',              checkAccess('contract_read'),   contractController.getChunk);
router.get('/user/:userId',  checkAccess('contract_read'),   contractController.getContractsByUserId); 
router.post('/',             checkAccess('contract_create'), contractController.createContract);
router.put('/:id',           checkAccess('contract_update'), contractController.updateContract);
router.delete('/:id',        checkAccess('contract_delete'), contractController.deleteContract);

module.exports = router;
