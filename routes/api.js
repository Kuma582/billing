const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Owner (Only allowed once or for new setups)
router.post('/register-owner', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const ownerExists = await Member.findOne({ role: 'Owner' });
        if (ownerExists) return res.status(403).json({ message: 'Owner already registered. Please Login.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newOwner = new Member({ name, email, password: hashedPassword, role: 'Owner' });
        await newOwner.save();

        const token = jwt.sign({ id: newOwner._id, role: 'Owner' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ token, user: { name: newOwner.name, email: newOwner.email, role: 'Owner' } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const member = await Member.findOne({ email });
        if (!member) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: member._id, role: member.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ token, user: { name: member.name, email: member.email, role: member.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register Staff (Admin only feature in a real app, but simplified here)
router.post('/members', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newMember = new Member({ name, email, password: hashedPassword, role });
        await newMember.save();
        res.json({ message: 'Member added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/members', async (req, res) => {
    const members = await Member.find().select('-password');
    res.json(members);
});

router.delete('/members/:id', async (req, res) => {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member removed' });
});

// --- PRODUCT ROUTES ---

router.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

router.post('/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
});

router.put('/products/:id', async (req, res) => {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

router.delete('/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
});

// --- INVOICE ROUTES ---

router.get('/invoices', async (req, res) => {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
});

router.post('/invoices', async (req, res) => {
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();

    // Deduct stock for each item
    for (const item of req.body.details) {
        await Product.findOneAndUpdate(
            { id: item.id }, // Match by our custom ID or barcode
            { $inc: { quantity: -item.qty } }
        );
    }
    
    res.json(newInvoice);
});

module.exports = router;
