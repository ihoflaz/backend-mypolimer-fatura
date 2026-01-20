const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    invoice_no: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    exchange_rate_usd: {
        type: DataTypes.DECIMAL(10, 4),
    },
    exchange_rate_eur: {
        type: DataTypes.DECIMAL(10, 4),
    },
    total_amount_currency: {
        type: DataTypes.DECIMAL(15, 3),
    },
    total_amount_try: {
        type: DataTypes.DECIMAL(15, 3),
    },
    notes: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('Draft', 'Sent', 'Cancelled'),
        defaultValue: 'Draft',
    },
    delivery_terms: {
        type: DataTypes.STRING, // EXW, CIF, FOB
    },
    payment_terms: {
        type: DataTypes.STRING,
    },
    is_invoiced: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    invoiced_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    cancellation_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    is_bonded_warehouse: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_vat_included: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    currency: {
        type: DataTypes.ENUM('USD', 'EUR', 'TRY'),
        defaultValue: 'USD',
    },
}, {
    timestamps: true,
});

module.exports = Invoice;
