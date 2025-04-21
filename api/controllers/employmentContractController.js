const contractService = require('../services/employmentContractService');

/* — сводный/чанк энд‑пойнт — */
exports.getChunk = async (req, res, next) => {
  try {
    const page    = +req.query.page    || 1;
    const perPage = +req.query.perPage || 20;
    const data = await contractService.getContractsChunk({ page, perPage });
    res.json(data);
  } catch (e) { next(e); }
};

// Список контрактов выбранного пользователя
exports.getContractsByUserId = async (req, res, next) => {
  try {
    const data = await contractService.getContractsByUserId(req.params.userId);
    res.json(data);
  } catch (e) { next(e); }
};

// Создание контракта
exports.createContract = async (req, res, next) => {
  try {
    const { userId, positionId, workRatio, dateStart, dateEnd } = req.body;
    if (!userId || !positionId || !workRatio || !dateStart)
      return res.status(400).json({ error: 'Обязательные поля: userId, positionId, workRatio, dateStart' });
    const created = await contractService.createContract(userId, positionId, workRatio, dateStart, dateEnd);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

// Обновление контракта
exports.updateContract = async (req, res, next) => {
  try {
    const updated = await contractService.updateContract(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Контракт не найден' });
    res.json({ message: 'Контракт обновлён' });
  } catch (e) { next(e); }
};

// Удаление (soft) контракта
exports.deleteContract = async (req, res, next) => {
  try {
    const deleted = await contractService.deleteContract(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Контракт не найден' });
    res.json({ message: 'Контракт удалён' });
  } catch (e) { next(e); }
};
