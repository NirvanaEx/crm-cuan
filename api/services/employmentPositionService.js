// Подключает конфиг для работы с БД
const db = require('../config/db');

// Получает все активные должности
exports.getPositions = async () => {
    const [rows] = await db.execute(
        "SELECT id, name, date_creation FROM employment_position WHERE data_status = 'active'"
    );
    return rows;
};

// Получает одну активную должность по ID
exports.getPositionById = async (id) => {
    const [rows] = await db.execute(
        "SELECT id, name, date_creation FROM employment_position WHERE id = ? AND data_status = 'active'",
        [id]
    );
    return rows[0];
};

// Создаёт новую должность
exports.createPosition = async (name) => {
    const [result] = await db.execute(
        "INSERT INTO employment_position (name, date_creation, data_status) VALUES (?, NOW(), 'active')",
        [name]
    );
    return { id: result.insertId, name };
};

// Обновляет название существующей должности
exports.updatePosition = async (id, name) => {
    const [result] = await db.execute(
        "UPDATE employment_position SET name = ? WHERE id = ? AND data_status = 'active'",
        [name, id]
    );
    return result.affectedRows > 0;
};

// Мягко удаляет должность (soft delete)
exports.deletePosition = async (id) => {
    const [result] = await db.execute(
        "UPDATE employment_position SET data_status = 'deleted' WHERE id = ? AND data_status = 'active'",
        [id]
    );
    return result.affectedRows > 0;
};
