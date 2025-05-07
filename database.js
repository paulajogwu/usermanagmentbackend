require('dotenv').config();
const mongoose = require('mongoose');

const mongodb = mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected!'));