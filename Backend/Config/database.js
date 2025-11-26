const mysql = require('mysql2/promise');
// o para PostgreSQL:
// const { Pool } = require('pg');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'plataforma_denuncias',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Para MySQL
const pool = mysql.createPool(dbConfig);

// Para PostgreSQL
// const pool = new Pool(dbConfig);

module.exports = pool;