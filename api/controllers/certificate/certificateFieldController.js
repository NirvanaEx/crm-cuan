const service = require('../../services/certificate/certificateFieldService');

exports.list = async (req, res, next) => {
  try {
    const { search, searchField, dateFrom, dateTo, page, limit } = req.query;
    const result = await service.list({ search, searchField, dateFrom, dateTo, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const fld = await service.getById(req.params.id);
    if (!fld) return res.status(404).json({ error: 'Field not found' });
    res.json(fld);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { certificate_id, field_name, field_type } = req.body;
    if (!certificate_id || !field_name || !field_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const created = await service.create({ certificate_id, field_name, field_type });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { certificate_id, field_name, field_type, data_status } = req.body;
    await service.update(req.params.id, { certificate_id, field_name, field_type, data_status });
    res.json({ message: 'Field updated' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await service.delete(req.params.id);
    res.json({ message: 'Field deleted' });
  } catch (err) {
    next(err);
  }
};
