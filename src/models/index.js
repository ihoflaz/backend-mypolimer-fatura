const User = require('./User');
const CompanySettings = require('./CompanySettings');
const Customer = require('./Customer');
const Product = require('./Product');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');

// Associations
Customer.hasMany(Invoice, { foreignKey: 'customer_id' });
Invoice.belongsTo(Customer, { foreignKey: 'customer_id' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id' });

Product.hasMany(InvoiceItem, { foreignKey: 'product_id' });
InvoiceItem.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = {
    User,
    CompanySettings,
    Customer,
    Product,
    Invoice,
    InvoiceItem,
};
