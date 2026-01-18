const { Sequelize } = require('sequelize');
const pg = require('pg');
require('dotenv').config();

let sequelize;

// Heroku DATABASE_URL varsa onu kullan, yoksa ayrı parametreleri kullan
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg, // Vercel için gerekli
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 2, // Serverless için minimum bağlantı
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  });
}

module.exports = sequelize;
