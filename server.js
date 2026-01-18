const sequelize = require('./src/config/database');
require('./src/models'); // Register associations
const app = require('./src/app');
const cron = require('node-cron');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        await sequelize.sync({ alter: true }); // Sync models

        // Schedule cron job for 09:00 AM
        cron.schedule('0 9 * * *', async () => {
            console.log('Fetching daily exchange rates...');
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

startServer();
