require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB Atlas successfully'); mongoose.connection.close();
}).catch((err) => {
    console.error('Connection failed:', err.message);
});