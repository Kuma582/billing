const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    customer: { type: String, default: 'Walk-in Customer' },
    subtotal: { type: Number, required: true },
    gst: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Paid' },
    items: { type: Number, required: true },
    details: [
        {
            id: String,
            name: String,
            price: Number,
            qty: Number
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
