const axios = require('axios');

async function test() {
    try {
        // 1. Login to get token
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'alam.faiz3@gmail.com', // Using the admin email seen in terminal output
            password: 'password123' // Or whatever default is. Wait, I don't know the password.
        });

    } catch (e) {
        console.log('Error:', e.response ? e.response.data : e.message);
    }
}
test();
