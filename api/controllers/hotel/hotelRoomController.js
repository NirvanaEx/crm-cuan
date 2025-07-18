// controllers/hotel/hotelRoomController.js
const service = require('../../services/hotel/hotelRoomService');

/**
 * GET /api/hotel/rooms/available
 * Возвращает список свободных номеров в указанный период
 */
exports.listAvailable = async (req, res, next) => {
  try {
    const { date_start, date_end } = req.query;
    if (!date_start || !date_end) {
      return res.status(400).json({ error: 'Missing date_start or date_end' });
    }
    const rooms = await service.listAvailableRooms({ date_start, date_end });
    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/hotel/rooms
 * Пагинированный список всех комнат (с фильтрацией)
 */
exports.list = async (req, res, next) => {
  try {
    const {
      search,
      searchField,
      dateFrom,
      dateTo,
      page  = 1,
      limit = 10
    } = req.query;

    const result = await service.listRooms({
      search,
      searchField,
      dateFrom,
      dateTo,
      page:  Number(page),
      limit: Number(limit)
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/hotel/rooms/:id
 * Детальная информация по комнате
 */
exports.getById = async (req, res, next) => {
  try {
    const room = await service.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/hotel/rooms
 * Создаёт новую комнату
 */
exports.create = async (req, res, next) => {
  try {
    const { num } = req.body;
    if (!num) {
      return res.status(400).json({ error: 'Field num is required' });
    }
    const created = await service.createRoom({ num });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/hotel/rooms/:id
 * Обновляет номер (num или data_status)
 */
exports.update = async (req, res, next) => {
  try {
    const { num, data_status } = req.body;
    await service.updateRoom(req.params.id, { num, data_status });
    res.json({ message: 'Room updated' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/hotel/rooms/:id
 * Помечает комнату как deleted
 */
exports.delete = async (req, res, next) => {
  try {
    await service.deleteRoom(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    next(err);
  }
};
