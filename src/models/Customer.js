const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tax_id: {
        type: DataTypes.STRING,
    },
    tax_office: {
        type: DataTypes.STRING,
    },
    address: {
        type: DataTypes.TEXT,
    },
    phone: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    contact_person: {
        type: DataTypes.STRING,
    },
    company_title: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    tax_number: {
        type: DataTypes.STRING,
    },
}, {
    timestamps: true,
});

module.exports = Customer;
