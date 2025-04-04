const accessService = require('../services/accessService');

exports.getAccessList = async (req, res, next) => {
  try {
    // Если нужно возвращать все переводы, можно не передавать languageId
    const accessList = await accessService.getAccessList();
    res.json(accessList);
  } catch (error) {
    next(error);
  }
};

exports.getAccessById = async (req, res, next) => {
  try {
    const access = await accessService.getAccessById(req.params.id);
    if (!access) return res.status(404).json({ error: 'Доступ не найден' });
    res.json(access);
  } catch (error) {
    next(error);
  }
};

exports.createAccess = async (req, res, next) => {
  try {
    const { name, translations } = req.body;
    if (!name || !translations || translations.length === 0) {
      return res.status(400).json({ error: 'Название доступа и переводы обязательны' });
    }
    const access = await accessService.createAccess(name, translations);
    res.status(201).json(access);
  } catch (error) {
    next(error);
  }
};

exports.updateAccess = async (req, res, next) => {
  try {
    const { name, translations } = req.body;
    if (!name || !translations || translations.length === 0) {
      return res.status(400).json({ error: 'Название доступа и переводы обязательны' });
    }
    const updated = await accessService.updateAccess(req.params.id, name, translations);
    if (!updated) return res.status(404).json({ error: 'Доступ не найден' });
    res.json({ message: 'Доступ обновлен' });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccess = async (req, res, next) => {
  try {
    const deleted = await accessService.deleteAccess(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Доступ не найден' });
    res.json({ message: 'Доступ удален' });
  } catch (error) {
    next(error);
  }
};
