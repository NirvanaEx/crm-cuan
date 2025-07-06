const service = require('../../services/hotel/hotelPhotoService');

exports.list = async (req, res, next) => {
  try {
    const photos = await service.listPhotos();
    res.json(photos);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const photo = await service.getPhotoById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    res.json(photo);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { hotel_room_id, path } = req.body;
    const created = await service.createPhoto({ hotel_room_id, path });
    res.status(201).json(created);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    await service.updatePhotoStatus(req.params.id, req.body.data_status);
    res.json({ message: 'Photo status updated' });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    await service.deletePhoto(req.params.id);
    res.json({ message: 'Photo deleted' });
  } catch (err) { next(err); }
};
