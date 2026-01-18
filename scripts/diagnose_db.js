const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    port: 5432,
    database: process.env.DB_NAME,
});

async function diagnose() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // List tables
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables found:', res.rows.map(r => r.table_name));

        // Try querying specific tables
        const tables = ['Users', 'Customers', 'Products', 'Invoices', 'InvoiceItems', 'CompanySettings'];
        for (const table of tables) {
            try {
                // Check if table exists (case sensitive if created with quotes, but usually lowercase in PG if not)
                // Sequelize usually creates tables with quotes if configured, or lowercase.
                // Let's try querying it.
                await client.query(`SELECT count(*) FROM "${table}"`);
                console.log(`Table "${table}" exists and is accessible.`);
            } catch (err) {
                console.error(`Error accessing table "${table}":`, err.message);
            }
        }

    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        await client.end();
    }
}

diagnose();
