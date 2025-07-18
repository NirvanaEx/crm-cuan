// controllers/car/carBookController.js
const service = require('../../services/car/carBookService');

function parseQuery(req) {
  return {
    page:        parseInt(req.query.page, 10) || 1,
    limit:       parseInt(req.query.limit,10) || 10,
    search:      req.query.search      || '',
    searchField: req.query.searchField || '',
    dateFrom:    req.query.dateFrom    || null,
    dateTo:      req.query.dateTo      || null,
  };
}

// ===== Admin (ALL) =====

exports.getPendingAll = async (req, res, next) => {
  try {
    const data = await service.listPending(parseQuery(req));
    res.json(data);
  } catch (err) { next(err); }
};

exports.getActiveAll = async (req, res, next) => {
  try {
    const data = await service.listActive(parseQuery(req));
    res.json(data);
  } catch (err) { next(err); }
};

exports.getHistoryAll = async (req, res, next) => {
  try {
    const data = await service.listHistory(parseQuery(req));
    res.json(data);
  } catch (err) { next(err); }
};

exports.changeStatusAll = async (req, res, next) => {
  try {
    const ok = await service.updateStatusAll(req.params.id, req.body.status);
    if (!ok) return res.status(404).json({ error:'Booking not found' });
    res.json({ message:'Status updated' });
  } catch (err) { next(err); }
};

// ===== User (OWN) =====

exports.getPendingOwn = async (req, res, next) => {
  try {
    const opts = parseQuery(req);
    opts.userId = req.user.id;
    const data = await service.listPending(opts);
    res.json(data);
  } catch (err) { next(err); }
};

exports.getActiveOwn = async (req, res, next) => {
  try {
    const opts = parseQuery(req);
    opts.userId = req.user.id;
    const data = await service.listActive(opts);
    res.json(data);
  } catch (err) { next(err); }
};

exports.getHistoryOwn = async (req, res, next) => {
  try {
    const opts = parseQuery(req);
    opts.userId = req.user.id;
    const data = await service.listHistory(opts);
    res.json(data);
  } catch (err) { next(err); }
};

exports.changeStatusOwn = async (req, res, next) => {
  try {
    // проверяем, что пытаются отменить
    if (req.body.status !== 'canceled') {
      return res.status(403).json({ error: 'You can only cancel your own booking' });
    }
    const ok = await service.updateStatusOwn(req.params.id, req.user.id, 'canceled');
    if (!ok) return res.status(404).json({ error:'Not found or not yours' });
    res.json({ message:'Your booking updated' });
  } catch (err) {
    // если service выбросил ошибку «Forbidden: …», возвращаем 403
    if (err.message.startsWith('Forbidden')) {
      return res.status(403).json({ error: err.message });
    }
    next(err);    
  }
};

// ===== Create (shared) =====

exports.create = async (req, res, next) => {
  try {
    const { car_id, phone_number, purpose, route, date_start, date_expired } = req.body;
    const user_id = req.user.id;

    if (!car_id || isNaN(+car_id)) {
      return res.status(400).json({ error:'Field car_id is required and must be a number' });
    }
    if (!phone_number || !date_start || !date_expired) {
      return res.status(400).json({ error:'Fields phone_number, date_start and date_expired are required' });
    }

    const result = await service.createBooking({
      car_id: +car_id, user_id, phone_number, purpose, route, date_start, date_expired
    });
    res.status(201).json(result);
  } catch (err) { next(err); }
};
