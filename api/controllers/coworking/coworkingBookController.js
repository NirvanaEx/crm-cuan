const service = require('../../services/coworking/coworkingBookService');

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
    const { coworking_id, purpose, date_start, date_end } = req.body;
    if (!coworking_id || !date_start || !date_end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const created = await service.createBooking({ coworking_id, user_id, purpose, date_start, date_end });
    res.status(201).json(created);
  } catch (err) { next(err); }
};

// Admin (all)
exports.getPendingAll = async (req, res, next) => {
  try { res.json(await service.listPendingAll(parseQuery(req))); }
  catch (err) { next(err); }
};
exports.getActiveAll = async (req, res, next) => {
  try { res.json(await service.listActiveAll(parseQuery(req))); }
  catch (err) { next(err); }
};
exports.getHistoryAll = async (req, res, next) => {
  try { res.json(await service.listHistoryAll(parseQuery(req))); }
  catch (err) { next(err); }
};
exports.changeStatusAll = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ok = await service.updateStatusAll(req.params.id, status);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Status updated' });
  } catch (err) {
    if (err.message === 'Invalid status') return res.status(400).json({ error: err.message });
    next(err);
  }
};

// User (own)
exports.getPendingOwn = async (req, res, next) => {
  try {
    const opts = { ...parseQuery(req), userId: req.user.id };
    res.json(await service.listPendingOwn(opts));
  } catch (err) { next(err); }
};
exports.getActiveOwn = async (req, res, next) => {
  try {
    const opts = { ...parseQuery(req), userId: req.user.id };
    res.json(await service.listActiveOwn(opts));
  } catch (err) { next(err); }
};
exports.getHistoryOwn = async (req, res, next) => {
  try {
    const opts = { ...parseQuery(req), userId: req.user.id };
    res.json(await service.listHistoryOwn(opts));
  } catch (err) { next(err); }
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
  } catch (err) { next(err); }
};
