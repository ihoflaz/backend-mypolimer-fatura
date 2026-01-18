const axios = require('axios');

async function debugSettings() {
    try {
        // 1. Login
        console.log('Attempting login...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Login successful.');

        // 2. Fetch Settings
        console.log('Fetching settings...');
        const res = await axios.get('http://localhost:3000/api/settings', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Settings:', JSON.stringify(res.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

debugSettings();
