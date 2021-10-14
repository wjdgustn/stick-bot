const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    channel: {
        type: String,
        required: true,
        unique: true
    },
    cooldown: {
        type: Number,
        required: true,
        default: 3000
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    color: {
        type: String
    },
    image: {
        type: String
    },
    message: {
        type: String
    },
    lastMessage: {
        type: String
    }
});

module.exports = mongoose.model('Stick', newSchema);