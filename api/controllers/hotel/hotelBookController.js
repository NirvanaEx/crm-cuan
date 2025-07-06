const service = require('../../services/hotel/hotelBookService');

exports.list = async (req, res, next) => {
  try {
    const { search, searchField, dateFrom, dateTo, page, limit } = req.query;
    const result = await service.listBookings({ search, searchField, dateFrom, dateTo, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const booking = await service.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    // берём user_id из req.user
    const user_id = req.user.id;

    const { room_id, phone, purpose, date_start, date_end } = req.body;

    // проверяем, что есть всё необходимое
    if (!room_id || !phone || !date_start || !date_end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const created = await service.createBooking({
      room_id,
      user_id,
      phone,
      purpose,
      date_start,
      date_end
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { phone, purpose, date_start, date_end, status } = req.body;
    await service.updateBooking(req.params.id, {
      phone,
      purpose,
      date_start,
      date_end,
      status
    });
    res.json({ message: 'Booking updated' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await service.deleteBooking(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    next(err);
  }
};
