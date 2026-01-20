/**
 * Migration script to update decimal precision from 2 to 3 decimal places
 * Run this script to fix the rounding issue (0.915 -> 0.92)
 *
 * Usage: node scripts/migrate_decimal_precision.js
 */

const sequelize = require('../src/config/database');

async function migrateDecimalPrecision() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected successfully.\n');

        console.log('Starting decimal precision migration...\n');

        // Update InvoiceItems table
        console.log('1. Updating InvoiceItems table...');
        await sequelize.query(`
            ALTER TABLE "InvoiceItems"
            ALTER COLUMN "quantity" TYPE DECIMAL(10, 3),
            ALTER COLUMN "unit_price" TYPE DECIMAL(10, 3),
            ALTER COLUMN "line_total" TYPE DECIMAL(15, 3);
        `);
        console.log('   - quantity: DECIMAL(10, 3) ✓');
        console.log('   - unit_price: DECIMAL(10, 3) ✓');
        console.log('   - line_total: DECIMAL(15, 3) ✓\n');

        // Update Invoices table
        console.log('2. Updating Invoices table...');
        await sequelize.query(`
            ALTER TABLE "Invoices"
            ALTER COLUMN "total_amount_currency" TYPE DECIMAL(15, 3),
            ALTER COLUMN "total_amount_try" TYPE DECIMAL(15, 3);
        `);
        console.log('   - total_amount_currency: DECIMAL(15, 3) ✓');
        console.log('   - total_amount_try: DECIMAL(15, 3) ✓\n');

        // Update Products table
        console.log('3. Updating Products table...');
        await sequelize.query(`
            ALTER TABLE "Products"
            ALTER COLUMN "unit_price" TYPE DECIMAL(10, 3);
        `);
        console.log('   - unit_price: DECIMAL(10, 3) ✓\n');

        console.log('Migration completed successfully!');
        console.log('You can now use 3 decimal places (e.g., 0.915) without rounding.');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

migrateDecimalPrecision();
