const service = require('../../services/coworking/coworkingRoomService');

function parseQuery(req) {
  return {
    search:      req.query.search,
    searchField: req.query.searchField || 'room',
    dateFrom:    req.query.dateFrom,
    dateTo:      req.query.dateTo,
    page:        parseInt(req.query.page, 10) || 1,
    limit:       parseInt(req.query.limit, 10) || 10
  };
}

exports.list = async (req, res, next) => {
  try { res.json(await service.listRooms(parseQuery(req))); }
  catch (err) { next(err); }
};

exports.listAvailable = async (req, res, next) => {
  try {
    const { date_start, date_end } = req.query;
    if (!date_start || !date_end) {
      return res.status(400).json({ error: 'date_start and date_end are required' });
    }
    const rows = await service.listAvailableCoworkings({ date_start, date_end });
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const row = await service.getRoomById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { room } = req.body;
    if (!room) return res.status(400).json({ error: 'room is required' });
    const created = await service.createRoom({ room });
    res.status(201).json(created);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { room, data_status } = req.body;
    await service.updateRoom(req.params.id, { room, data_status });
    res.json({ message: 'Updated' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteRoom(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
