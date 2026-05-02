const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Owner', 'Staff'], default: 'Staff' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', memberSchema);
