const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanySettings = sequelize.define('CompanySettings', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.TEXT,
    },
    tax_office: {
        type: DataTypes.STRING,
    },
    tax_id: {
        type: DataTypes.STRING,
    },
    mersis_no: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    logo_path: {
        type: DataTypes.STRING,
    },
    watermark_path: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    trade_registry_no: {
        type: DataTypes.STRING,
    },
    bank_accounts: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
}, {
    timestamps: true,
});

module.exports = CompanySettings;
