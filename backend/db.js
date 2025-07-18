const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'db',
    user: 'root',
    password: '1234', // atau 'password' jika ada
    database: 'chatbot_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

module.exports = connection;
