const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Heroku DATABASE_URL varsa onu kullan, yoksa ayrı parametreleri kullan
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
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
