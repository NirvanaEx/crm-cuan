const service = require('../../services/certificate/certificateDataService');

exports.listByRequest = async (req, res, next) => {
  try {
    const request_id = req.query.request_id;
    if (!request_id) {
      return res.status(400).json({ error: 'Missing request_id' });
    }
    const rows = await service.listByRequest({ request_id });
    res.json({ rows });
  } catch (err) {
    next(err);
  }
};

exports.deleteByRequest = async (req, res, next) => {
  try {
    const request_id = req.query.request_id;
    if (!request_id) {
      return res.status(400).json({ error: 'Missing request_id' });
    }
    await service.deleteByRequest(request_id);
    res.json({ message: 'Deleted certificate data for request ' + request_id });
  } catch (err) {
    next(err);
  }
};

exports.createBulk = async (req, res, next) => {
  try {
    const entries = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Payload must be a non-empty array' });
    }
    const result = await service.createBulk(entries);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
