// controllers/carBookController.js
const service = require('../services/carBookService');

/**
 * Parses pagination, search and date filters from query string.
 */
function parseQuery(req) {
  const page        = parseInt(req.query.page, 10)        || 1;
  const limit       = parseInt(req.query.limit, 10)       || 10;
  const search      = req.query.search      || '';
  const searchField = req.query.searchField || '';
  const dateFrom    = req.query.dateFrom    || null;
  const dateTo      = req.query.dateTo      || null;
  return { page, limit, search, searchField, dateFrom, dateTo };
}

/**
 * GET /api/car-bookings/pending
 */
exports.getPending = async (req, res, next) => {
  try {
    const opts = parseQuery(req);
    const data = await service.listPending(opts);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/car-bookings/active
 */
exports.getActive = async (req, res, next) => {
  try {
    const opts = parseQuery(req);
    const data = await service.listActive(opts);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/car-bookings/history
 */
exports.getHistory = async (req, res, next) => {
  try {
    const opts = parseQuery(req);
    const data = await service.listHistory(opts);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/car-bookings
 */
exports.create = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      user_id: req.user.id
    };
    const { id } = await service.createBooking(payload);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/car-bookings/:id/status
 */
exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ok = await service.updateStatus(req.params.id, status);
    if (!ok) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Status updated' });
  } catch (err) {
    next(err);
  }
};
