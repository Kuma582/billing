import { useState, useEffect, useContext, createContext, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── CONTEXT ────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

const initialProducts = [
  { id: 1, name: "Basmati Rice 5kg", price: 320, quantity: 45, barcode: "8901234567890", category: "Groceries", sku: "GRC001" },
  { id: 2, name: "Sunflower Oil 1L", price: 145, quantity: 8, barcode: "8902345678901", category: "Groceries", sku: "GRC002" },
  { id: 3, name: "Colgate Toothpaste", price: 89, quantity: 3, barcode: "8903456789012", category: "Personal Care", sku: "PC001" },
  { id: 4, name: "Parle-G Biscuits", price: 30, quantity: 120, barcode: "8904567890123", category: "Snacks", sku: "SNK001" },
  { id: 5, name: "Tata Salt 1kg", price: 25, quantity: 60, barcode: "8905678901234", category: "Groceries", sku: "GRC003" },
  { id: 6, name: "Dettol Soap", price: 55, quantity: 5, barcode: "8906789012345", category: "Personal Care", sku: "PC002" },
];

const initialCustomers = [
  { id: 1, name: "Rajesh Kumar", phone: "9876543210", purchases: 12, totalSpent: 4520 },
  { id: 2, name: "Priya Sharma", phone: "9765432109", purchases: 7, totalSpent: 2340 },
  { id: 3, name: "Amit Singh", phone: "9654321098", purchases: 3, totalSpent: 890 },
];

const generateInvoices = () => {
  const today = new Date();
  return Array.from({ length: 15 }, (_, i) => ({
    id: `INV-${1000 + i}`,
    date: new Date(today - i * 86400000 * Math.floor(Math.random() * 3)).toLocaleDateString(),
    customer: ["Rajesh Kumar", "Priya Sharma", "Walk-in"][i % 3],
    total: Math.floor(Math.random() * 2000) + 200,
    items: Math.floor(Math.random() * 8) + 1,
  }));
};

function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [cart, setCart] = useState([]);
  const [gstEnabled, setGstEnabled] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [invoices] = useState(generateInvoices());

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const addToCart = useCallback((product) => {
    setCart(c => {
      const existing = c.find(i => i.id === product.id);
      if (existing) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, qty: 1 }];
    });
    addToast(`${product.name} added to cart`, "success");
  }, [addToast]);

  const removeFromCart = useCallback((id) => setCart(c => c.filter(i => i.id !== id)), []);
  const updateCartQty = useCallback((id, delta) => {
    setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = gstEnabled ? subtotal * 0.18 : 0;
  const grandTotal = subtotal + gst;

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode, user, setUser,
      products, setProducts, customers, setCustomers,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      gstEnabled, setGstEnabled, subtotal, gst, grandTotal,
      toasts, addToast, invoices
    }}>
      {children}
    </AppContext.Provider>
  );
}

const useApp = () => useContext(AppContext);

// ─── ICONS (inline SVG) ─────────────────────────────────────────────────────
const Icon = ({ name, size = 20, className = "" }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" w="7" h="7" rx="1"/><rect x="14" y="3" w="7" h="7" rx="1"/><rect x="3" y="14" w="7" h="7" rx="1"/><rect x="14" y="14" w="7" h="7" rx="1"/></>,
    barcode: <><path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M5 5v14M9 5v14M13 5v14M17 5v14M21 5v14"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    package: <><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    invoice: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    minus: <><line x1="5" y1="12" x2="19" y2="12"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    print: <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    alert: <><triangle points="10.29 3.86 1.82 18 22.18 18"><polygon points="10.29 3.86 1.82 18 22.18 18"/></triangle><path d="M10.29 3.86 1.82 18h20.36L10.29 3.86zM12 9v4M12 17h.01"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || null}
    </svg>
  );
};

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const darkTokens = {
  bg: "bg-[#0a0e1a]",
  bgCard: "bg-[#111827]",
  bgSidebar: "bg-[#0d1117]",
  bgInput: "bg-[#1a2332]",
  border: "border-[#1e2d42]",
  text: "text-[#e2e8f0]",
  textMuted: "text-[#64748b]",
  accent: "text-[#22d3ee]",
  accentBg: "bg-[#22d3ee]",
};
const lightTokens = {
  bg: "bg-[#f0f4f8]",
  bgCard: "bg-white",
  bgSidebar: "bg-[#1a2332]",
  bgInput: "bg-[#f8fafc]",
  border: "border-[#e2e8f0]",
  text: "text-[#1e293b]",
  textMuted: "text-[#64748b]",
  accent: "text-[#0891b2]",
  accentBg: "bg-[#0891b2]",
};

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────────────────

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium text-white ${t.type === "success" ? "bg-emerald-600" : t.type === "error" ? "bg-red-600" : "bg-blue-600"}`}>
            <Icon name={t.type === "success" ? "check" : t.type === "error" ? "x" : "alert"} size={16} />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  const { darkMode } = useApp();
  const T = darkMode ? darkTokens : lightTokens;
  if (!open) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className={`${T.bgCard} ${T.border} border rounded-2xl p-6 w-full max-w-sm shadow-2xl`}>
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <Icon name="trash" size={22} className="text-red-500" />
        </div>
        <h3 className={`text-lg font-bold ${T.text} mb-1`}>{title}</h3>
        <p className={`${T.textMuted} text-sm mb-6`}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className={`flex-1 py-2.5 rounded-xl border ${T.border} ${T.text} text-sm font-medium hover:bg-white/5 transition-colors`}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">Delete</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

function Badge({ children, color = "blue" }) {
  const colors = { blue: "bg-blue-500/10 text-blue-400 border-blue-500/20", green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", red: "bg-red-500/10 text-red-400 border-red-500/20", orange: "bg-orange-500/10 text-orange-400 border-orange-500/20", cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors[color] || colors.blue}`}>{children}</span>;
}

function StatCard({ icon, label, value, sub, color = "cyan", loading = false }) {
  const { darkMode } = useApp();
  const T = darkMode ? darkTokens : lightTokens;
  const colors = { cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400", emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400", violet: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400", orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400" };
  return (
    <motion.div whileHover={{ y: -2 }} className={`${T.bgCard} border ${colors[color]} bg-gradient-to-br rounded-2xl p-5 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: `radial-gradient(circle, currentColor, transparent)` }} />
      {loading ? <><Skeleton className="h-8 w-24 mb-2" /><Skeleton className="h-4 w-16" /></> : (
        <>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`} style={{ background: "rgba(255,255,255,0.05)" }}>
            <Icon name={icon} size={20} />
          </div>
          <div className={`text-2xl font-bold ${T.text} mb-0.5`}>{value}</div>
          <div className={`text-sm ${T.textMuted}`}>{label}</div>
          {sub && <div className={`text-xs mt-1 ${colors[color]}`}>{sub}</div>}
        </>
      )}
    </motion.div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "billing", label: "Billing POS", icon: "barcode" },
  { id: "products", label: "Products", icon: "package" },
  { id: "customers", label: "Customers", icon: "users" },
  { id: "invoices", label: "Invoices", icon: "invoice" },
  { id: "reports", label: "Reports", icon: "chart" },
];

function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) {
  const { darkMode, setDarkMode, setUser, addToast } = useApp();
  const T = darkMode ? darkTokens : lightTokens;

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className={`fixed left-0 top-0 h-full w-64 ${T.bgSidebar} z-30 flex flex-col border-r ${T.border} lg:translate-x-0 lg:static lg:z-auto`}
        style={{ transform: undefined }}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Icon name="barcode" size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-wide">QuickBill POS</div>
              <div className="text-[10px] text-cyan-400/70 tracking-widest uppercase">Shop Manager</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                  ${active ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                <Icon name={item.icon} size={18} className={`transition-colors ${active ? "text-cyan-400" : "group-hover:text-white"}`} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Icon name={darkMode ? "sun" : "moon"} size={18} />
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={() => { setUser(null); addToast("Logged out", "success"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all">
            <Icon name="logout" size={18} />
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────
function Header({ currentPage, setSidebarOpen }) {
  const { darkMode } = useApp();
  const T = darkMode ? darkTokens : lightTokens;
  const titles = { dashboard: "Dashboard", billing: "Billing POS", products: "Product Management", customers: "Customers", invoices: "Invoices", reports: "Reports" };
  return (
    <header className={`h-14 ${T.bgCard} border-b ${T.border} flex items-center px-4 gap-4 sticky top-0 z-10`}>
      <button onClick={() => setSidebarOpen(s => !s)} className={`lg:hidden ${T.textMuted} hover:${T.text}`}>
        <Icon name="menu" size={22} />
      </button>
      <h1 className={`font-bold text-base ${T.text}`}>{titles[currentPage] || "QuickBill"}</h1>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">A</div>
          <span className={`text-sm font-medium ${T.text} hidden sm:block`}>Admin</span>
        </div>
      </div>
    </header>
  );
}
function LoginPage() {
  const { setUser, darkMode, addToast } = useApp();
  const T = darkMode ? darkTokens : lightTokens;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill all fields."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    if (email === "admin@shop.com" && password === "admin123") {
      setUser({ name: "Admin", email });
      addToast("Welcome back, Admin!", "success");
    } else setError("Invalid email or password. Try admin@shop.com / admin123");
  };

  return (
    <div className={`min-h-screen ${T.bg} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* BG effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.08), transparent 70%)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className={`w-full max-w-sm ${T.bgCard} border ${T.border} rounded-3xl p-8 shadow-2xl relative`}>
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/30 mx-auto mb-4">
            <Icon name="barcode" size={28} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${T.text}`}>QuickBill POS</h1>
          <p className={`${T.textMuted} text-sm mt-1`}>Sign in to your shop dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold ${T.textMuted} mb-1.5 uppercase tracking-wider`}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@shop.com"
              className={`w-full ${T.bgInput} border ${T.border} rounded-xl px-4 py-3 text-sm ${T.text} outline-none focus:border-cyan-500 transition-colors placeholder:${T.textMuted}`} />
          </div>
          <div>
            <label className={`block text-xs font-semibold ${T.textMuted} mb-1.5 uppercase tracking-wider`}>Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className={`w-full ${T.bgInput} border ${T.border} rounded-xl px-4 py-3 pr-11 text-sm ${T.text} outline-none focus:border-cyan-500 transition-colors`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${T.textMuted} hover:text-cyan-400 transition-colors`}>
                <Icon name={showPass ? "eyeOff" : "eye"} size={17} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <Icon name="alert" size={15} className="text-red-400 shrink-0" />
                <span className="text-red-400 text-xs">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button type="submit" whileTap={{ scale: 0.98 }} disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : "Sign In"}
          </motion.button>
        </form>

        <p className={`text-center ${T.textMuted} text-xs mt-5`}>Demo: admin@shop.com / admin123</p>
      </motion.div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage({ setCurrentPage }) {
  const { darkMode, products, invoices } = useApp();
  const T = darkMode ? darkTokens : lightTokens;
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => setLoading(false), 900); }, []);

  const lowStock = products.filter(p => p.quantity < 10);
  const todaySales = invoices.slice(0, 5).reduce((s, i) => s + i.total, 0);

  return (
    <div className="p-5 space-y-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${T.text}`}>Good morning, Admin 👋</h2>
          <p className={`${T.textMuted} text-sm`}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCurrentPage("billing")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-opacity">
          <Icon name="plus" size={16} /> New Bill
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="chart" label="Today's Sales" value={`₹${todaySales.toLocaleString()}`} sub="+12% from yesterday" color="cyan" loading={loading} />
        <StatCard icon="invoice" label="Monthly Sales" value="₹1,24,580" sub="32 transactions" color="emerald" loading={loading} />
        <StatCard icon="package" label="Total Products" value={products.length} sub={`${products.length} active`} color="violet" loading={loading} />
        <StatCard icon="alert" label="Low Stock Alerts" value={lowStock.length} sub="Need restocking" color="orange" loading={loading} />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className={`text-sm font-semibold ${T.textMuted} uppercase tracking-wider mb-3`}>Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Add Product", icon: "plus", page: "products", color: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400" },
            { label: "Create Bill", icon: "barcode", page: "billing", color: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400" },
            { label: "View Reports", icon: "chart", page: "reports", color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400" },
          ].map(a => (
            <motion.button key={a.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setCurrentPage(a.page)}
              className={`${T.bgCard} border bg-gradient-to-br ${a.color} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all`}>
              <Icon name={a.icon} size={22} />
              <span className="text-xs font-medium">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Invoices */}
        <div className={`${T.bgCard} border ${T.border} rounded-2xl overflow-hidden`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className={`font-semibold ${T.text} text-sm`}>Recent Invoices</h3>
            <button onClick={() => setCurrentPage("invoices")} className="text-xs text-cyan-400 hover:text-cyan-300">View all</button>
          </div>
          <div className="divide-y divide-white/5">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-20" /></div></div>
            )) : invoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="p-4 flex items-center gap-3 hover:bg-white/2 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Icon name="invoice" size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${T.text} truncate`}>{inv.id}</div>
                  <div className={`text-xs ${T.textMuted}`}>{inv.customer} · {inv.date}</div>
                </div>
                <div className={`text-sm font-bold text-emerald-400`}>₹{inv.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className={`${T.bgCard} border ${T.border} rounded-2xl overflow-hidden`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className={`font-semibold ${T.text} text-sm`}>Low Stock Alerts</h3>
            <Badge color="orange">{lowStock.length} items</Badge>
          </div>
          <div className="divide-y divide-white/5">
            {lowStock.map(p => (
              <div key={p.id} className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Icon name="alert" size={15} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${T.text}`}>{p.name}</div>
                  <div className={`text-xs ${T.textMuted}`}>{p.category}</div>
                </div>
                <Badge color="orange">{p.quantity} left</Badge>
              </div>
            ))}
            {lowStock.length === 0 && (
              <div className="p-8 text-center">
                <Icon name="check" size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className={`${T.textMuted} text-sm`}>All products well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT MANAGEMENT ───────────────────────────────────────────────────────
function ProductsPage() {
  const { darkMode, products, setProducts, addToast } = useApp();
  const T = darkMode ? darkTokens : lightTokens;
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", price: "", quantity: "", barcode: "", category: "Groceries" });
  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const categories = ["Groceries", "Snacks", "Personal Care", "Beverages", "Dairy", "Electronics"];

  const generateBarcode = () => {
    setForm(f => ({ ...f, barcode: "89" + Math.floor(Math.random() * 10000000000).toString().padStart(11, "0") }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.quantity || !form.barcode) { addToast("Fill all fields", "error"); return; }
    if (editId) {
      setProducts(p => p.map(i => i.id === editId ? { ...i, ...form, price: +form.price, quantity: +form.quantity } : i));
      addToast("Product updated", "success");
    } else {
      setProducts(p => [...p, { ...form, id: Date.now(), price: +form.price, quantity: +form.quantity, sku: "SKU" + Date.now() }]);
      addToast("Product added", "success");
    }
    setForm({ name: "", price: "", quantity: "", barcode: "", category: "Groceries" });
    setEditId(null); setShowForm(false);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search));

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className={`text-lg font-bold ${T.text}`}>Product Management</h2>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", price: "", quantity: "", barcode: "", category: "Groceries" }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl">
          <Icon name={showForm ? "x" : "plus"} size={16} /> {showForm ? "Cancel" : "Add Product"}
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className={`${T.bgCard} border ${T.border} rounded-2xl p-5`}>
            <h3 className={`font-semibold ${T.text} mb-4 text-sm`}>{editId ? "Edit Product" : "Add New Product"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[["name", "Product Name", "text"], ["price", "Price (₹)", "number"], ["quantity", "Quantity", "number"]].map(([k, l, t]) => (
                <div key={k}>
                  <label className={`block text-xs font-medium ${T.textMuted} mb-1.5`}>{l}</label>
                  <input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className={`w-full ${T.bgInput} border ${T.border} rounded-xl px-3 py-2.5 text-sm ${T.text} outline-none focus:border-cyan-500 transition-colors`} />
                </div>
              ))}
              <div>
                <label className={`block text-xs font-medium ${T.textMuted} mb-1.5`}>Barcode</label>
                <div className="flex gap-2">
                  <input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                    className={`flex-1 ${T.bgInput} border ${T.border} rounded-xl px-3 py-2.5 text-sm ${T.text} outline-none focus:border-cyan-500 transition-colors`} />
                  <button onClick={generateBarcode} className={`px-3 py-2.5 ${T.bgInput} border ${T.border} rounded-xl text-cyan-400 hover:text-cyan-300 transition-colors text-xs`}>
                    <Icon name="refresh" size={15} />
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium ${T.textMuted} mb-1.5`}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className={`w-full ${T.bgInput} border ${T.border} rounded-xl px-3 py-2.5 text-sm ${T.text} outline-none focus:border-cyan-500 transition-colors`}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl">
                {editId ? "Update Product" : "Add Product"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Icon name="search" size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${T.textMuted}`} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or barcode..."
          className={`w-full ${T.bgCard} border ${T.border} rounded-xl pl-9 pr-4 py-2.5 text-sm ${T.text} outline-none focus:border-cyan-500 transition-colors`} />
      </div>

      {/* Table */}
      <div className={`${T.bgCard} border ${T.border} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Product", "Barcode", "Category", "Price", "Stock", "Actions"].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${T.textMuted} uppercase tracking-wider`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(p => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className={`font-medium ${T.text}`}>{p.name}</div>
                    <div className={`text-xs ${T.textMuted}`}>{p.sku}</div>
                  </td>
                  <td className={`px-4 py-3 ${T.textMuted} font-mono text-xs`}>{p.barcode}</td>
                  <td className="px-4 py-3"><Badge color="blue">{p.category}</Badge></td>
                  <td className={`px-4 py-3 font-semibold ${T.text}`}>₹{p.price}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${p.quantity < 10 ? "bg-orange-500/15 text-orange-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                      {p.quantity < 10 ? "⚠ " : ""}{p.quantity} units
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setForm({ name: p.name, price: String(p.price), quantity: String(p.quantity), barcode: p.barcode, category: p.category }); setEditId(p.id); setShowForm(true); }}
                        className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:text-blue-300 flex items-center justify-center transition-colors">
                        <Icon name="edit" size={14} />
                      </button>
                      <button onClick={() => setDeleteModal(p.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center transition-colors">
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Icon name="package" size={40} className={`${T.textMuted} mx-auto mb-3 opacity-40`} />
              <p className={`${T.textMuted} text-sm`}>No products found</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal open={!!deleteModal} title="Delete Product" message="This action cannot be undone."
        onConfirm={() => { setProducts(p => p.filter(x => x.id !== deleteModal)); setDeleteModal(null); addToast("Product deleted", "success"); }}
        onCancel={() => setDeleteModal(null)} />
    </div>
    // ─── INVOICES PAGE ─────────────────────────────────────────────────────────────
function InvoicesPage() {
  const { darkMode, invoices } = useApp();
  const T = darkMode ? darkTokens : lightTokens;
  return (
    <div className="p-5 space-y-5 max-w-5xl mx-auto">
      <h2 className={`text-lg font-bold ${T.text}`}>All Invoices</h2>
      <div className={`${T.bgCard} border ${T.border} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Invoice #", "Date", "Customer", "Items", "Total", "Status"].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${T.textMuted} uppercase tracking-wider`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                  <td className={`px-4 py-3 font-mono text-xs font-semibold text-cyan-400`}>{inv.id}</td>
                  <td className={`px-4 py-3 ${T.textMuted}`}>{inv.date}</td>
                  <td className={`px-4 py-3 font-medium ${T.text}`}>{inv.customer}</td>
                  <td className={`px-4 py-3 ${T.textMuted}`}>{inv.items} items</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">₹{inv.total}</td>
                  <td className="px-4 py-3"><Badge color="green">Paid</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage() {
  const { darkMode, products, invoices, addToast } = useApp();
  const T = darkMode ? darkTokens : lightTokens;
  const [tab, setTab] = useState("daily");
  const tabs = [{ id: "daily", label: "Daily" }, { id: "monthly", label: "Monthly" }, { id: "products", label: "Product Sales" }];

  const dailyData = invoices.slice(0, 7).map(inv => ({ date: inv.date, sales: inv.total, transactions: inv.items }));
  const monthlyData = [
    { month: "Jan", sales: 84200, transactions: 142 },
    { month: "Feb", sales: 91400, transactions: 156 },
    { month: "Mar", sales: 78900, transactions: 134 },
    { month: "Apr", sales: 124580, transactions: 178 },
  ];

  return (
    <div className="p-5 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-bold ${T.text}`}>Reports</h2>
        <button onClick={() => addToast("Exporting CSV...", "success")}
          className={`flex items-center gap-2 px-4 py-2 ${T.bgCard} border ${T.border} rounded-xl text-sm ${T.text} hover:border-cyan-500/40 transition-colors`}>
          <Icon name="download" size={15} className="text-cyan-400" /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 ${T.bgCard} border ${T.border} p-1 rounded-xl w-fit`}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg" : `${T.textMuted} hover:${T.text}`}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={`${T.bgCard} border ${T.border} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {tab === "daily" && ["Date", "Transactions", "Sales", "Avg Order"].map(h => <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${T.textMuted} uppercase tracking-wider`}>{h}</th>)}
                {tab === "monthly" && ["Month", "Transactions", "Total Sales", "Growth"].map(h => <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${T.textMuted} uppercase tracking-wider`}>{h}</th>)}
                {tab === "products" && ["Product", "Category", "Qty Sold", "Revenue"].map(h => <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${T.textMuted} uppercase tracking-wider`}>{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tab === "daily" && dailyData.map((d, i) => (
                <tr key={i} className="hover:bg-white/2">
                  <td className={`px-4 py-3 ${T.text}`}>{d.date}</td>
                  <td className={`px-4 py-3 ${T.textMuted}`}>{d.transactions}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">₹{d.sales}</td>
                  <td className={`px-4 py-3 ${T.textMuted}`}>₹{Math.floor(d.sales / Math.max(d.transactions, 1))}</td>
                </tr>
              ))}
              {tab === "monthly" && monthlyData.map((d, i) => (
                <tr key={i} className="hover:bg-white/2">
                  <td className={`px-4 py-3 font-medium ${T.text}`}>{d.month} 2026</td>
                  <td className={`px-4 py-3 ${T.textMuted}`}>{d.transactions}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">₹{d.sales.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge color="green">+{(5 + i * 3)}%</Badge></td>
                </tr>
              ))}
              {tab === "products" && products.slice(0, 8).map((p, i) => (
                <tr key={p.id} className="hover:bg-white/2">
                  <td className={`px-4 py-3 font-medium ${T.text}`}>{p.name}</td>
                  <td className="px-4 py-3"><Badge color="blue">{p.category}</Badge></td>
                  <td className={`px-4 py-3 ${T.textMuted}`}>{20 + i * 7}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">₹{(p.price * (20 + i * 7)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
function AppShell() {
  const { user, darkMode, toasts } = useApp();
  const T = darkMode ? darkTokens : lightTokens;
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <LoginPage />;

  const pages = {
    dashboard: <DashboardPage setCurrentPage={setCurrentPage} />,
    billing: <BillingPage setCurrentPage={setCurrentPage} />,
    products: <ProductsPage />,
    customers: <CustomersPage />,
    invoices: <InvoicesPage />,
    reports: <ReportsPage />,
    invoice: <InvoicePage setCurrentPage={setCurrentPage} />,
  };

  return (
    <div className={`flex h-screen overflow-hidden ${T.bg} ${T.text}`}>
      {currentPage !== "invoice" && (
        <div className="hidden lg:block lg:w-64 shrink-0">
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={true} setSidebarOpen={setSidebarOpen} />
        </div>
      )}
      {currentPage !== "invoice" && (
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {currentPage !== "invoice" && <Header currentPage={currentPage} setSidebarOpen={setSidebarOpen} />}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {pages[currentPage] || pages.dashboard}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        select option { background: #111827; color: #e2e8f0; }
      `}</style>
      <AppShell />
    </AppProvider>
  );
}
