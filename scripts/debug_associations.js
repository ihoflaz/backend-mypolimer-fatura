const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
require('../src/models'); // Register associations

const Invoice = require('../src/models/Invoice');
const Customer = require('../src/models/Customer');

console.log('Invoice associations:', Object.keys(Invoice.associations));
console.log('Customer associations:', Object.keys(Customer.associations));

if (Invoice.associations.Customer) {
    console.log('SUCCESS: Invoice belongsTo Customer association found.');
} else {
    console.error('FAILURE: Invoice belongsTo Customer association MISSING.');
}
