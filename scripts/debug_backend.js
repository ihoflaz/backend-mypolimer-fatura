const axios = require('axios');

async function debugBackend() {
    try {
        // 1. Login
        console.log('Attempting login...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Login successful.');

        // 2. Fetch Products
        console.log('Fetching products...');
        try {
            await axios.get('http://localhost:3000/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Products fetched successfully.');
        } catch (err) {
            console.error('Error fetching products:');
            if (err.response) {
                console.error('Status:', err.response.status);
                console.error('Data:', JSON.stringify(err.response.data, null, 2));
            } else {
                console.error(err.message);
            }
        }

        // 3. Fetch Invoices
        console.log('Fetching invoices...');
        try {
            await axios.get('http://localhost:3000/api/invoices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Invoices fetched successfully.');
        } catch (err) {
            console.error('Error fetching invoices:');
            if (err.response) {
                console.error('Status:', err.response.status);
                console.error('Data:', JSON.stringify(err.response.data, null, 2));
            } else {
                console.error(err.message);
            }
        }

    } catch (error) {
        console.error('Login failed:', error.message);
    }
}

debugBackend();
