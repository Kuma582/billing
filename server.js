const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database Connection (Dynamic for Local/Render)
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_billing';
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to Database! ✅'))
  .catch(err => console.log('Database connection error. Check MONGODB_URI.'));

// Models
const ProductSchema = new mongoose.Schema({
    name: String, price: Number, quantity: Number, barcode: String, category: String
});
const Product = mongoose.model('Product', ProductSchema);

const InvoiceSchema = new mongoose.Schema({
    id: String, date: String, customer: String, total: Number, status: String, items: Number, details: Array
});
const Invoice = mongoose.model('Invoice', InvoiceSchema);

const StaffSchema = new mongoose.Schema({
    name: String, email: String, pass: String, role: String
});
const Staff = mongoose.model('Staff', StaffSchema);

// Real-time Events
io.on('connection', (socket) => {
    socket.on('bill:request', (data) => io.emit('bill:received', data));
    socket.on('product:request', (data) => io.emit('product:received', data));
    socket.on('staff:login', (data) => io.emit('staff:alert', data));
});

// API Routes (Directly in server.js to avoid missing file errors)
app.get('/api/products', async (req, res) => {
    try { const p = await Product.find(); res.json(p); } catch(e) { res.json([]); }
});

app.post('/api/products', async (req, res) => {
    try { const p = new Product(req.body); await p.save(); res.json(p); } catch(e) { res.status(500).json(e); }
});

app.get('/api/invoices', async (req, res) => {
    try { const i = await Invoice.find(); res.json(i); } catch(e) { res.json([]); }
});

app.post('/api/invoices', async (req, res) => {
    try { const i = new Invoice(req.body); await i.save(); res.json(i); } catch(e) { res.status(500).json(e); }
});

app.get('/api/members', async (req, res) => {
    try { const m = await Staff.find(); res.json(m); } catch(e) { res.json([]); }
});

app.post('/api/register-staff', async (req, res) => {
    try { const s = new Staff(req.body); await s.save(); res.json(s); } catch(e) { res.status(500).json(e); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@shop.com' && password === 'admin123') {
        return res.json({ token: 'admin-token', user: { name: 'Admin', role: 'Owner' } });
    }
    try {
        const s = await Staff.findOne({ email, pass: password });
        if (s) res.json({ token: 'staff-token', user: s });
        else res.status(401).json({ message: 'Invalid credentials' });
    } catch(e) { res.status(500).json(e); }
});

app.get('/staff-app', (req, res) => res.sendFile(path.join(__dirname, 'public', 'staff-portal.html')));
app.get('/api/status', (req, res) => res.json({ status: 'Online' }));

const PORT = 4000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 QUICKBILL SERVER IS LIVE!`);
    console.log(`----------------------------------`);
    console.log(`Admin Panel: http://localhost:${PORT}`);
    console.log(`Staff App:   http://localhost:${PORT}/staff-app`);
    console.log(`----------------------------------\n`);
});
