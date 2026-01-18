const sequelize = require('./src/config/database');
require('./src/models'); // Register associations
const app = require('./src/app');
const cron = require('node-cron');

const PORT = process.env.PORT || 3000;

// vercel.json'da src olarak bu dosya gösterildiği için,
// Vercel ortamında app'i export etmemiz gerekiyor.
// Yerel ortamda ise listen ile sunucuyu başlatıyoruz.

if (process.env.VERCEL) {
    // Vercel Serverless Function
    // Veritabanı senkronizasyonu için bir kerelik sync çalıştır
    sequelize.sync({ alter: true }).then(() => {
        console.log('Database synced on Vercel');
    }).catch(err => {
        console.error('Database sync error:', err);
    });
    module.exports = app;
} else {
    // Local Server
    async function startServer() {
        try {
            await sequelize.authenticate();
            console.log('Database connection established successfully.');
            await sequelize.sync({ alter: true }); // Sync models

            // Schedule cron job for 09:00 AM (only runs on persistent server)
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
}
