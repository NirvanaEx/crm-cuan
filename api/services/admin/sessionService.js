const db = require('../../config/db');

exports.getSessionsWithPaginationAndSearch = async ({
  page = 1,
  limit = 10,
  search = '',
  searchField = 'login',
  dateFrom = '',
  dateTo = ''
}) => {
  const offset = (page - 1) * limit;

  // Формируем условия для поиска и фильтрации по дате
  let conditions = [];
  let params = [];

  // Допустимые поля для поиска
  const allowedFields = ['login', 'device', 'ip_address', 'date_last_active'];

  if (search && search.trim() !== '') {
    if (allowedFields.includes(searchField)) {
      // Если ищем по полю, относящемуся к таблице `user` (например, login) или по полю сессии (например, device, ip_address, date_last_active)
      // Если поле date_last_active — лучше его преобразовать к строке, но здесь просто применим поиск как текстовое значение
      // Для полей из таблицы user используем префикс u., для сессии — us.
      const prefix = (searchField === 'login') ? 'u' : 'us';
      conditions.push(`${prefix}.${searchField} LIKE CONCAT('%', ?, '%')`);
      params.push(search);
    } else {
      // Если передано неверное поле — ищем по login по умолчанию
      conditions.push(`u.login LIKE CONCAT('%', ?, '%')`);
      params.push(search);
    }
  }

  // Фильтрация по диапазону дат по дате создания сессии
  if (dateFrom && dateFrom.trim() !== '') {
    conditions.push(`DATE(us.date_creation) >= ?`);
    params.push(dateFrom);
  }
  if (dateTo && dateTo.trim() !== '') {
    conditions.push(`DATE(us.date_creation) <= ?`);
    params.push(dateTo);
  }

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  // Получаем общее количество записей
  const countQuery = `
    SELECT COUNT(*) as total
    FROM user_session us
    INNER JOIN user_token ut ON ut.id = us.user_token_id
    INNER JOIN \`user\` u ON u.id = ut.user_id
    ${whereClause}
  `;
  const [countRows] = await db.execute(countQuery, params);
  const total = countRows[0].total;

  // Получаем сами записи с лимитом и смещением
  const queryParams = [...params, limit, offset];
  const dataQuery = `
    SELECT us.*, u.login 
    FROM user_session us
    INNER JOIN user_token ut ON ut.id = us.user_token_id
    INNER JOIN \`user\` u ON u.id = ut.user_id
    ${whereClause}
    ORDER BY us.date_creation DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.execute(dataQuery, queryParams);

  return {
    sessions: rows,
    total,
    page,
    limit
  };
};

exports.createSession = async (userTokenId, device, ipAddress) => {
  const [result] = await db.execute(
    `INSERT INTO user_session (user_token_id, device, ip_address, date_last_active, date_creation)
     VALUES (?, ?, ?, NOW(), NOW())`,
    [userTokenId, device || null, ipAddress || null]
  );
  return {
    id: result.insertId,
    user_token_id: userTokenId,
    device,
    ip_address: ipAddress
  };
};

exports.updateSessionLastActive = async (sessionId) => {
  const [result] = await db.execute(
    `UPDATE user_session
     SET date_last_active = NOW()
     WHERE id = ?`,
    [sessionId]
  );
  return result.affectedRows > 0;
};

exports.deleteSession = async (sessionId) => {
  const [result] = await db.execute(
    `DELETE FROM user_session
     WHERE id = ?`,
    [sessionId]
  );
  return result.affectedRows > 0;
};
