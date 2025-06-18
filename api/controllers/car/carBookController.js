// controllers/car/carBookController.js
const service = require('../../services/car/carBookService');

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
    const {
      car_id,
      phone_number,
      purpose,
      route,
      date_start,
      date_expired
    } = req.body;
    const user_id = req.user.id;

    // Валидация: car_id должно быть числом
    if (!car_id || isNaN(parseInt(car_id, 10))) {
      return res.status(400).json({ error: 'Field car_id is required and must be a number' });
    }
    if (!phone_number || !date_start || !date_expired) {
      return res.status(400).json({ error: 'Fields phone_number, date_start and date_expired are required' });
    }

    const result = await service.createBooking({
      car_id: parseInt(car_id, 10),
      user_id,
      phone_number,
      purpose,
      route,
      date_start,
      date_expired
    });

    res.status(201).json(result);
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
