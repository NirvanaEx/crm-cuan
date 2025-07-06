const db = require('../../config/db');

exports.listPhotos = async () => {
  const [rows] = await db.execute(
    `SELECT p.id, p.hotel_room_id, r.num AS room_num,
            p.path, p.date_creation, p.data_status
       FROM hotel_photo p
  LEFT JOIN hotel_room r ON p.hotel_room_id = r.id`
  );
  return rows;
};

exports.getPhotoById = async (id) => {
  const [rows] = await db.execute(
    'SELECT * FROM hotel_photo WHERE id = ?',
    [id]
  );
  return rows[0];
};

exports.createPhoto = async ({ hotel_room_id, path }) => {
  const [result] = await db.execute(
    `INSERT INTO hotel_photo
       (hotel_room_id, path, date_creation, data_status)
     VALUES (?, ?, NOW(), 'active')`,
    [hotel_room_id, path]
  );
  return { id: result.insertId, hotel_room_id, path };
};

exports.updatePhotoStatus = async (id, data_status) => {
  await db.execute(
    'UPDATE hotel_photo SET data_status = ? WHERE id = ?',
    [data_status, id]
  );
  return true;
};

exports.deletePhoto = async (id) => {
  // физически удаляем запись
  await db.execute('DELETE FROM hotel_photo WHERE id = ?', [id]);
  return true;
};
