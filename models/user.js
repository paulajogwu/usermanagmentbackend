const mongoose =  require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    role: {
        type: String,
        required: true,
        enum: ['Admin', 'User'],
    },

    password: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: ['Active', 'Deactived'],
        default: 'Active'
    },
    picURL: {
        type: String,
        //required: true,
    },

    date: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('User', userSchema);