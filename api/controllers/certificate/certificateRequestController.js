// api/controllers/certificate/certificateRequestController.js
const service     = require('../../services/certificate/certificateRequestService');
const dataService = require('../../services/certificate/certificateDataService');

exports.list = async (req, res, next) => {
  try {
    const params = {
      status: req.query.status,
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      search: req.query.search,
      searchField: req.query.searchField,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };
    const result = await service.list(params);
    res.json(result);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const reqst = await service.getById(req.params.id);
    if (!reqst) return res.status(404).json({ error: 'Request not found' });
    res.json(reqst);
  } catch (err) { next(err); }
};

// новый метод — вернуть все сохранённые значения полей для заявки
exports.getData = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const rows = await dataService.listByRequest(requestId);
    res.json(rows);
  } catch (err) { next(err); }
};

// новый метод — сохранить/обновить все данные полей (upsert batch)
exports.saveData = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const entries = req.body.data;
    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'Field "data" must be an array' });
    }
    // entries = [{ certificate_field_id, value }, ...]
    // адаптируем под сервис
    const formatted = entries.map(e => ({
      field_id: e.certificate_field_id,
      value: e.value
    }));
    await dataService.upsertBatch(requestId, formatted);
    res.json({ message: 'Data saved' });
  } catch (err) { next(err); }
};


exports.create = async (req, res, next) => {
  try {
    // берём user_id из токена (authMiddleware)
    const user_id = req.user.id;
    const { certificate_id } = req.body;
    if (!certificate_id) {
      return res.status(400).json({ error: 'Missing certificate_id' });
    }
    const created = await service.create({ user_id, certificate_id });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// изменить статус заявки — body = { status: 'approved' | 'rejected' | 'canceled' }
exports.update = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Missing status' });
    }
    await service.updateStatus(req.params.id, status);
    res.json({ message: 'Status updated' });
  } catch (err) { next(err); }
};

// (опционально) удалить заявку и все её данные
exports.delete = async (req, res, next) => {
  try {
    await service.deleteRequest(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (err) { next(err); }
};

// старые методы — можно оставить для прямого approve/reject, если нужны
exports.reject = async (req, res, next) => {
  try {
    await service.updateStatus(req.params.id, 'rejected');
    res.json({ message: 'Request rejected' });
  } catch (err) { next(err); }
};

exports.approve = async (req, res, next) => {
  try {
    const dataArray = req.body.data; // [{certificate_field_id, value},...]
    if (!Array.isArray(dataArray)) {
      return res.status(400).json({ error: 'Missing data array' });
    }
    await service.fillDataAndApprove(req.params.id, dataArray);
    res.json({ message: 'Request approved' });
  } catch (err) { next(err); }
};
