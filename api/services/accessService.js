const db = require('../config/db');

exports.getAccessList = async () => {
    // Получаем только активные записи
    const [rows] = await db.execute("SELECT * FROM access WHERE data_status = 'active'");
    return rows;
};

exports.getAccessById = async (id) => {
    // Получаем запись, только если она активна
    const [rows] = await db.execute("SELECT * FROM access WHERE id = ? AND data_status = 'active'", [id]);
    return rows[0];
};

exports.createAccess = async (name) => {
    // При создании устанавливаем data_status = 'active'
    const [result] = await db.execute(
        "INSERT INTO access (name, date_creation, data_status) VALUES (?, NOW(), 'active')",
        [name]
    );
    return { id: result.insertId, name };
};

exports.updateAccess = async (id, name) => {
    // Обновляем только активную запись
    const [result] = await db.execute(
        "UPDATE access SET name = ? WHERE id = ? AND data_status = 'active'",
        [name, id]
    );
    return result.affectedRows > 0;
};

exports.deleteAccess = async (id) => {
    // Мягкое удаление: обновляем data_status на 'deleted'
    const [result] = await db.execute(
        "UPDATE access SET data_status = 'deleted' WHERE id = ? AND data_status = 'active'",
        [id]
    );
    return result.affectedRows > 0;
};
