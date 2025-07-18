// controllers/hotel/hotelBookController.js
const service = require('../../services/hotel/hotelBookService');

function parseQuery(req) {
  return {
    search:      req.query.search,
    searchField: req.query.searchField,
    dateFrom:    req.query.dateFrom,
    dateTo:      req.query.dateTo,
    page:        parseInt(req.query.page, 10) || 1,
    limit:       parseInt(req.query.limit, 10) || 10
  };
}

// Create (shared)
exports.create = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { room_id, phone, purpose, date_start, date_end } = req.body;
    if (!room_id || !phone || !date_start || !date_end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const created = await service.createBooking({ room_id, user_id, phone, purpose, date_start, date_end });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// Admin (all)
exports.getPendingAll = async (req, res, next) => {
  try {
    const data = await service.listPendingAll(parseQuery(req));
    res.json(data);
  } catch (err) {
    next(err);
  }
};
exports.getActiveAll = async (req, res, next) => {
  try {
    const data = await service.listActiveAll(parseQuery(req));
    res.json(data);
  } catch (err) {
    next(err);
  }
};
exports.getHistoryAll = async (req, res, next) => {
  try {
    const data = await service.listHistoryAll(parseQuery(req));
    res.json(data);
  } catch (err) {
    next(err);
  }
};
exports.changeStatusAll = async (req, res, next) => {
  try {
    const { status, door_code } = req.body;
    const ok = await service.updateStatusAll(req.params.id, status, door_code);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Status and code updated' });
  } catch (err) {
    if (err.message === 'Invalid status') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// User (own)
exports.getPendingOwn = async (req, res, next) => {
  try {
    const opts = parseQuery(req);
    opts.userId = req.user.id;
    const data = await service.listPendingOwn(opts);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
exports.getActiveOwn = async (req, res, next) => {
  try {
    const opts = parseQuery(req);
    opts.userId = req.user.id;
    const data = await service.listActiveOwn(opts);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
exports.getHistoryOwn = async (req, res, next) => {
  try {
    const opts = parseQuery(req);
    opts.userId = req.user.id;
    const data = await service.listHistoryOwn(opts);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
exports.changeStatusOwn = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (status !== 'canceled') {
      return res.status(403).json({ error: 'You can only cancel your own booking' });
    }
    const ok = await service.updateStatusOwn(req.params.id, req.user.id, status);
    if (!ok) return res.status(404).json({ error: 'Not found or not yours' });
    res.json({ message: 'Booking canceled' });
  } catch (err) {
    next(err);
  }
};
