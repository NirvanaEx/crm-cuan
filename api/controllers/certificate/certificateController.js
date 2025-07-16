// api/controllers/certificate/certificateController.js
const service = require('../../services/certificate/certificateService');

exports.list = async (req, res, next) => {
  try {
    const { search, searchField, dateFrom, dateTo, page, limit } = req.query;
    const result = await service.listCertificates({ search, searchField, dateFrom, dateTo, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const cert = await service.getCertificateById(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    res.json(cert);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const created = await service.createCertificate({ name });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, data_status } = req.body;
    await service.updateCertificate(req.params.id, { name, data_status });
    res.json({ message: 'Certificate updated' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await service.deleteCertificate(req.params.id);
    res.json({ message: 'Certificate deleted' });
  } catch (err) {
    next(err);
  }
};
