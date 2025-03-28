const db = require('../config/db');

exports.getRoles = async () => {
    // Получаем только активные роли
    const [rows] = await db.execute("SELECT * FROM role WHERE data_status = 'active'");
    return rows;
};

exports.getRoleById = async (id) => {
    // Получаем роль, если она активна
    const [rows] = await db.execute("SELECT * FROM role WHERE id = ? AND data_status = 'active'", [id]);
    return rows[0];
};

exports.createRole = async (name) => {
    // При создании устанавливаем data_status = 'active'
    const [result] = await db.execute(
        "INSERT INTO role (name, date_creation, data_status) VALUES (?, NOW(), 'active')",
        [name]
    );
    return { id: result.insertId, name };
};

exports.updateRole = async (id, name) => {
    // Обновляем только активную роль
    const [result] = await db.execute(
        "UPDATE role SET name = ? WHERE id = ? AND data_status = 'active'",
        [name, id]
    );
    return result.affectedRows > 0;
};

exports.deleteRole = async (id) => {
    // Мягкое удаление: обновляем data_status на 'deleted'
    const [result] = await db.execute(
        "UPDATE role SET data_status = 'deleted' WHERE id = ? AND data_status = 'active'",
        [id]
    );
    return result.affectedRows > 0;
};
