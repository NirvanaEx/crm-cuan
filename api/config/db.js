const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
    host: 'localhost',         // Можно изменить настройки подключения
    user: 'root',
    password: '',
    database: 'guide'
});
