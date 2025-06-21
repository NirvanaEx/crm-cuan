// controllers/admin/registrationAdminController.js

const registrationAdminService = require('../../services/admin/registrationAdminService');

exports.listRequests = async (req, res, next) => {
  try {
    // Parses pagination and filter parameters from query
    const page        = parseInt(req.query.page, 10) || 1;
    const limit       = parseInt(req.query.limit, 10) || 10;
    const search      = req.query.search || '';
    const searchField = req.query.searchField || '';
    const dateFrom    = req.query.dateFrom || '';
    const dateTo      = req.query.dateTo || '';

    // Delegates list+count to service
    const { rows, total } = await registrationAdminService.listRequests({
      page, limit, search, searchField, dateFrom, dateTo
    });

    // Returns paginated result
    res.json({ total, rows });
  } catch (err) {
    next(err);
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const request = await registrationAdminService.findById(reqId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (err) {
    next(err);
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const { status } = req.body; // 'approved' or 'rejected'
    
    // Validates status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await registrationAdminService.processRequest(reqId, status);
    if (!result) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    res.json({ message: `Request ${status}` });
  } catch (err) {
    next(err);
  }
};
