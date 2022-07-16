const mariadb = require("mariadb");
require("dotenv").config();

// create db connection pool
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: process.env.DB_CONNECTIONLIMIT,
});

module.exports = {
  pool,
};
