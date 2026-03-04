const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const updateEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected successfully.');

        const result = await User.updateOne(
            { email: 'faiz@gmail.com' },
            { $set: { email: 'alam.faiz3@gmail.com' } }
        );

        console.log('Update Result:', result);
    } catch (error) {
        console.error('Error updating email:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
    }
};

updateEmail();
