// controllers/certificate/certificateRequestController.js
const service = require('../../services/certificate/certificateRequestService');

exports.list = async (req, res, next) => {
  try {
    const { status, search, searchField, dateFrom, dateTo, page, limit } = req.query;
    const result = await service.listRequests({ status, search, searchField, dateFrom, dateTo, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const reqst = await service.getRequestById(req.params.id);
    if (!reqst) return res.status(404).json({ error: 'Request not found' });
    res.json(reqst);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const user_id = req.user.id; // берем из токена
    const { certificate_id } = req.body;
    if (!certificate_id) return res.status(400).json({ error: 'Missing certificate_id' });
    const created = await service.createRequest({ user_id, certificate_id });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Missing status' });
    await service.updateRequestStatus(req.params.id, status);
    res.json({ message: 'Request updated' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await service.deleteRequest(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (err) {
    next(err);
  }
};
