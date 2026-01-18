const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const CompanySettings = require('../models/CompanySettings');
const pdfService = require('../services/pdfService');

exports.createInvoice = async (req, res) => {
    try {
        const { items, ...invoiceData } = req.body;

        // Generate Invoice No if not provided (Simple logic for now)
        if (!invoiceData.invoice_no) {
            const count = await Invoice.count();
            invoiceData.invoice_no = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
        }

        const invoice = await Invoice.create(invoiceData);

        if (items && items.length > 0) {
            const invoiceItems = items.map(item => ({
                ...item,
                invoice_id: invoice.id,
            }));
            await InvoiceItem.bulkCreate(invoiceItems);
        }

        const createdInvoice = await Invoice.findByPk(invoice.id, {
            include: [InvoiceItem]
        });

        res.status(201).json(createdInvoice);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: [Customer],
            order: [['createdAt', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getInvoicePdf = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id, {
            include: [
                Customer,
                {
                    model: InvoiceItem,
                    include: [Product]
                }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const companySettings = await CompanySettings.findOne();
        const pdfBuffer = await pdfService.generateInvoicePDF(invoice, companySettings);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${invoice.invoice_no}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.markAsInvoiced = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id);

        if (!invoice) {
            return res.status(404).json({ message: 'Fatura bulunamadı' });
        }

        if (invoice.is_invoiced) {
            return res.status(400).json({ message: 'Bu fatura zaten faturalaştırılmış' });
        }

        await invoice.update({
            is_invoiced: true,
            invoiced_at: new Date()
        });

        res.json({ message: 'Fatura başarıyla faturalaştırıldı', invoice });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id, {
            include: [
                Customer,
                {
                    model: InvoiceItem,
                    include: [Product]
                }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { items, ...invoiceData } = req.body;

        const invoice = await Invoice.findByPk(id);

        if (!invoice) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }

        await invoice.update(invoiceData);

        // Delete old items and create new ones
        if (items && items.length > 0) {
            await InvoiceItem.destroy({ where: { invoice_id: id } });
            const invoiceItems = items.map(item => ({
                ...item,
                invoice_id: id,
            }));
            await InvoiceItem.bulkCreate(invoiceItems);
        }

        const updatedInvoice = await Invoice.findByPk(id, {
            include: [
                Customer,
                {
                    model: InvoiceItem,
                    include: [Product]
                }
            ]
        });

        res.json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id);

        if (!invoice) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }

        await InvoiceItem.destroy({ where: { invoice_id: id } });
        await invoice.destroy();

        res.json({ message: 'Sipariş başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
