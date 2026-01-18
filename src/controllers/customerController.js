const Customer = require('../models/Customer');
const { Op } = require('sequelize');

exports.getCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        const where = {};
        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }
        const customers = await Customer.findAll({ where });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        await customer.update(req.body);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: 'Müşteri bulunamadı' });
        }
        await customer.destroy();
        res.json({ message: 'Müşteri başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
