const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceItem = sequelize.define('InvoiceItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    invoice_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
    },
    unit: {
        type: DataTypes.STRING, // KG, MT, ADET
        defaultValue: 'KG',
    },
    unit_price: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
    },
    vat_rate: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
    },
    line_total: {
        type: DataTypes.DECIMAL(15, 4),
    },
    delivery_location: {
        type: DataTypes.STRING,
    },
}, {
    timestamps: true,
});

module.exports = InvoiceItem;
