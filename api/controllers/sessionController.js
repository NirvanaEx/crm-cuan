const sessionService = require('../services/sessionService');
const userTokenService = require('../services/userTokenService');

exports.getAllSessions = async (req, res, next) => {
  try {
    const { page, limit, search, searchField, dateFrom, dateTo } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const result = await sessionService.getSessionsWithPaginationAndSearch({
      page: pageNumber,
      limit: limitNumber,
      search: search || '',
      searchField: searchField || 'login',
      dateFrom: dateFrom || '',
      dateTo: dateTo || ''
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const { token, device, ipAddress } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Токен обязателен' });
    }
    const userToken = await userTokenService.getTokenByValue(token);
    if (!userToken) {
      return res.status(404).json({ error: 'Токен не найден' });
    }
    const newSession = await sessionService.createSession(userToken.id, device, ipAddress);
    return res.status(201).json(newSession);
  } catch (error) {
    next(error);
  }
};

exports.updateSessionLastActive = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const updated = await sessionService.updateSessionLastActive(sessionId);
    if (!updated) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }
    return res.json({ message: 'Сессия обновлена (date_last_active)' });
  } catch (error) {
    next(error);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const deleted = await sessionService.deleteSession(sessionId);
    if (!deleted) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }
    return res.json({ message: 'Сессия удалена' });
  } catch (error) {
    next(error);
  }
};
