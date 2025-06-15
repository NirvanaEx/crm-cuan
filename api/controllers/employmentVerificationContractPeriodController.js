const periodService = require('../services/employmentVerificationContractPeriodService');

exports.listPeriods = async (req, res, next) => {
  const requestId = Number(req.params.requestId);
  try {
    const items = await periodService.getPeriods({ requestId });
    res.json(items);
  } catch (e) {
    next(e);
  }
};

exports.createPeriods = async (req, res, next) => {
  const requestId  = Number(req.params.requestId);
  const { contractIds } = req.body;
  if (!Array.isArray(contractIds) || !contractIds.length) {
    return res.status(400).json({ error: 'Нужен массив contractIds' });
  }
  try {
    const created = await periodService.createPeriods({ requestId, contractIds });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};
