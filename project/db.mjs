import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Salamandra21.',
  database: 'company_db'
}).promise();

export default db;
