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
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
    },
    unit: {
        type: DataTypes.STRING, // KG, MT, ADET
        defaultValue: 'KG',
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
    },
    vat_rate: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
    },
    line_total: {
        type: DataTypes.DECIMAL(15, 3),
    },
    delivery_location: {
        type: DataTypes.STRING,
    },
}, {
    timestamps: true,
});

// Override toJSON to preserve decimal precision (prevent 0.915 -> 0.92 rounding)
InvoiceItem.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());

    // Preserve 3 decimal places for quantity, unit_price, line_total
    if (values.quantity !== undefined && values.quantity !== null) {
        values.quantity = parseFloat(Number(values.quantity).toFixed(3));
    }
    if (values.unit_price !== undefined && values.unit_price !== null) {
        values.unit_price = parseFloat(Number(values.unit_price).toFixed(3));
    }
    if (values.line_total !== undefined && values.line_total !== null) {
        values.line_total = parseFloat(Number(values.line_total).toFixed(3));
    }

    return values;
};

module.exports = InvoiceItem;
