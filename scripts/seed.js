const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
const { User } = require('../src/models'); // Load all models
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await sequelize.authenticate();
        // Sync all models to create tables if they don't exist
        await sequelize.sync({ alter: true });

        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash('admin123', salt);

            await User.create({
                username: 'admin',
                password_hash,
                role: 'admin',
            });
            console.log('Admin user created: admin / admin123');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
