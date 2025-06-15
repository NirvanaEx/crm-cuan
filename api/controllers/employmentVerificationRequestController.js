// controllers/employmentVerificationRequestController.js
const vrService = require('../services/employmentVerificationRequestService');

exports.list = async (req, res, next) => {
  try {
    const page    = Number(req.query.page)    || 1;
    const perPage = Number(req.query.perPage) || 20;
    // Он получает из сервиса полный список и общее число
    const data = await vrService.getRequests({ page, perPage });
    res.json(data);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Не указан userId' });
    }
    // Он создаёт новую заявку со статусом pending
    const newRequest = await vrService.createRequest({ userId });
    res.status(201).json(newRequest);
  } catch (e) {
    next(e);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const id     = Number(req.params.id);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Не указан статус' });
    }
    // Он обновляет статус и дату
    const updated = await vrService.updateStatus({ id, status });
    if (!updated) {
      return res.status(404).json({ error: 'Справка не найдена' });
    }
    res.json({ message: 'Статус обновлён' });
  } catch (e) {
    next(e);
  }
};

exports.getByUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    // Он возвращает все заявки заданного пользователя
    const items  = await vrService.getByUser({ userId });
    res.json(items);
  } catch (e) {
    next(e);
  }
};
