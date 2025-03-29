// services/userTokenService.js
const db = require('../config/db');

exports.getTokenByValue = async (tokenValue) => {
    // Поиск записи по полю token в таблице user_token
    const [rows] = await db.execute(
        "SELECT * FROM user_token WHERE token = ? LIMIT 1",
        [tokenValue]
    );
    return rows[0];
};
