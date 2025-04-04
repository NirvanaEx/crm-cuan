const userSettingService = require('../services/userSettingService');

exports.getSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const settings = await userSettingService.getUserSettings(userId);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updated = await userSettingService.updateUserSettings(userId, req.body);
    if (!updated) return res.status(404).json({ error: 'Настройки не найдены' });
    res.json({ message: 'Настройки обновлены' });
  } catch (error) {
    next(error);
  }
};
