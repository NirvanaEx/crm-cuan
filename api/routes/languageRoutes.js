const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');
const checkAccess = require('../middlewares/checkAccess');

router.get('/', languageController.getAllLanguages);
router.get('/:id', languageController.getLanguageById);
router.post('/', checkAccess('language_create'), languageController.createLanguage);
router.put('/:id', checkAccess('language_update'),languageController.updateLanguage);
router.delete('/:id', checkAccess('language_delete'),languageController.deleteLanguage);

module.exports = router;
