const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');

router.get('/', languageController.getAllLanguages);
router.get('/:id', languageController.getLanguageById);
router.post('/', languageController.createLanguage);
router.put('/:id', languageController.updateLanguage);
router.delete('/:id', languageController.deleteLanguage);

module.exports = router;
