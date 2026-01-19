const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    trade_name: {
        type: DataTypes.STRING,
    },
    raw_material_type: {
        type: DataTypes.STRING, // PP, PE, PVC, etc.
    },
    mfi_value: {
        type: DataTypes.STRING,
    },
    origin: {
        type: DataTypes.STRING,
    },
    packaging: {
        type: DataTypes.STRING,
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
    },
    currency: {
        type: DataTypes.ENUM('USD', 'EUR'),
        defaultValue: 'USD',
    },
    default_vat_rate: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
    },
    description: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
});

module.exports = Product;
