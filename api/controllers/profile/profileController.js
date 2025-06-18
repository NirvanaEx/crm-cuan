const profileService = require('../../services/profile/profileService');

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    res.json({ user: profile });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { surname, name, patronym, phone } = req.body;
    const updated = await profileService.updateProfile(req.user.id, { surname, name, patronym, phone });
    if (!updated) {
      return res.status(404).json({ error: 'Профиль не найден или не обновлён' });
    }
    res.json({ message: 'Профиль обновлён' });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const updated = await profileService.changePassword(req.user.id, oldPassword, newPassword);
      if (!updated) {
        return res.status(500).json({ error: 'Не удалось изменить пароль' });
      }
      res.json({ message: 'Пароль успешно изменён' });
    } catch (error) {
      next(error);
    }
  };