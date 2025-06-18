const languageService = require('../../services/admin/languageService');

exports.getAllLanguages = async (req, res, next) => {
  try {
    const languages = await languageService.getAllLanguages();
    res.json(languages);
  } catch (error) {
    next(error);
  }
};

exports.getLanguageById = async (req, res, next) => {
  try {
    const language = await languageService.getLanguageById(req.params.id);
    if (!language) return res.status(404).json({ error: 'Язык не найден' });
    res.json(language);
  } catch (error) {
    next(error);
  }
};

exports.createLanguage = async (req, res, next) => {
  try {
    const { code, name } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Код и имя обязательны' });
    }
    const language = await languageService.createLanguage({ code, name });
    res.status(201).json(language);
  } catch (error) {
    next(error);
  }
};

exports.updateLanguage = async (req, res, next) => {
  try {
    const { code, name } = req.body;
    const updated = await languageService.updateLanguage(req.params.id, { code, name });
    if (!updated) return res.status(404).json({ error: 'Язык не найден' });
    res.json({ message: 'Язык обновлен' });
  } catch (error) {
    next(error);
  }
};

exports.deleteLanguage = async (req, res, next) => {
  try {
    const deleted = await languageService.deleteLanguage(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Язык не найден' });
    res.json({ message: 'Язык удален' });
  } catch (error) {
    next(error);
  }
};
