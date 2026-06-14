import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, ShoppingCart, Users, Package,
  Settings, LogOut, ChevronRight, LayoutDashboard, 
  AlertCircle, TrendingUp, Wallet, ArrowUpRight, 
  ArrowDownRight, Trash2, Edit3, Save, X, UserPlus, 
  Menu, Bell, FileText, Download, Building2, PlusCircle, CheckCircle2,
  User as UserIcon, Phone, DollarSign, Filter, ShoppingBag,
  History as HistoryIcon, Calendar, Printer, FileCheck, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { 
  initializeApp 
} from 'firebase/app';
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, 
  signOut, User, signInAnonymously 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, query, 
  orderBy, doc, updateDoc, deleteDoc, serverTimestamp, 
  where, getDoc, getDocs, increment, runTransaction, setDoc
} from 'firebase/firestore';
import { translations, Language } from './translations';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// --- Types ---
interface Product {
  id: string;
  name: string;
  categoryId: string;
  supplierId?: string;
  buyPrice: number;
  price: number;
  qty: number;
  minQty: number;
  createdAt: any;
}

interface Category {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  debt: number;
  createdAt: any;
}

interface Supplier {
  id: string;
  name: string;
  phone?: string;
  debt: number;
  createdAt: any;
}

interface Sale {
  id: string;
  invoiceNo: string;
  customerId?: string;
  customerName?: string;
  total: number;
  items: SaleItem[];
  createdAt: any;
  staffId: string;
}

interface SaleItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
}

interface Purchase {
  id: string;
  supplierId: string;
  items: PurchaseItem[];
  total: number;
  date: string;
  createdAt: any;
}

interface PurchaseItem {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'staff';
  createdAt: any;
}

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const activeUser = user;
  const activeProfile = profile;

  function handleFirestoreError(error: any, operationType: any, path: string | null) {
    const isOffline = error?.message?.includes('offline') || error?.code === 'unavailable';
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: activeUser?.uid,
        email: activeUser?.email,
      },
      operationType,
      path
    };

    if (isOffline) {
      console.warn('Firestore is in offline mode:', path);
      // We don't throw for offline warnings to keep the app functional
      return;
    }

    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [language, setLanguage] = useState<Language>('fr');
  const [view, setView] = useState<'pos' | 'inventory' | 'customers' | 'suppliers' | 'history' | 'staff' | 'dashboard' | 'purchases'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [lastInvoiceNo, setLastInvoiceNo] = useState(0);

  const seedSampleData = async () => {
    if (products.length > 0 || suppliers.length > 0) {
      showMessage("Sample data already exists or data is present", "error");
      return;
    }

    const sampleSuppliers = [
      { name: "Agri-Maroc S.A.", phone: "0522001122", debt: 0, createdAt: serverTimestamp() },
      { name: "Fertilisants du Nord", phone: "0537334455", debt: 0, createdAt: serverTimestamp() },
      { name: "Pépinière Atlas", phone: "0661223344", debt: 0, createdAt: serverTimestamp() }
    ];

    const sampleProducts = [
      { name: "Engrais NPK 15-15-15 (25kg)", category: "Engrais", buyPrice: 120, price: 160, qty: 50, minQty: 10, createdAt: serverTimestamp() },
      { name: "Semences Tomate (100g)", category: "Semences", buyPrice: 45, price: 70, qty: 100, minQty: 20, createdAt: serverTimestamp() },
      { name: "Tuyau Goutte à Goutte 16mm (100m)", category: "Irrigation", buyPrice: 180, price: 250, qty: 30, minQty: 5, createdAt: serverTimestamp() },
      { name: "Pulvérisateur Manuel 16L", category: "Outillage", buyPrice: 320, price: 450, qty: 12, minQty: 3, createdAt: serverTimestamp() },
      { name: "Substrat Universel 50L", category: "Terreau", buyPrice: 85, price: 120, qty: 40, minQty: 10, createdAt: serverTimestamp() }
    ];

    try {
      for (const s of sampleSuppliers) await addDoc(collection(db, 'suppliers'), s);
      for (const p of sampleProducts) await addDoc(collection(db, 'products'), p);
      showMessage("Sample data seeded successfully!");
    } catch (err) {
      handleFirestoreError(err, 'write', 'seeding');
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (!activeUser) return;
    const unsubPOS = onSnapshot(doc(db, 'settings', 'pos'), (snap) => {
      if (snap.exists()) setLastInvoiceNo(snap.data().lastInvoiceNo || 0);
    });
    return unsubPOS;
  }, [activeUser]);

  const downloadBackup = async () => {
    const data: any = {
      products,
      categories,
      customers,
      suppliers,
      sales,
      purchases,
      users,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showMessage(t.downloadBackup);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap && userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
          } else {
            const newProfile = {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || 'User',
              photoURL: u.photoURL || '',
              role: 'staff',
              createdAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', u.uid), newProfile);
            setProfile(newProfile as any);
          }
        } catch (e: any) {
          console.warn("Auth sync failed (offline?):", e.message);
          // Fallback profile if offline
          setProfile({
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || 'User',
            photoURL: u.photoURL || '',
            role: 'staff',
            createdAt: new Date()
          } as any);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!activeUser) return;

    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('name')), 
      (snap) => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))),
      (err) => handleFirestoreError(err, 'list', 'products')
    );

    const unsubCategories = onSnapshot(collection(db, 'categories'), 
      (snap) => setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category))),
      (err) => handleFirestoreError(err, 'list', 'categories')
    );

    const unsubCustomers = onSnapshot(query(collection(db, 'customers'), orderBy('name')), 
      (snap) => setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer))),
      (err) => handleFirestoreError(err, 'list', 'customers')
    );

    const unsubSuppliers = onSnapshot(query(collection(db, 'suppliers'), orderBy('name')), 
      (snap) => setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Supplier))),
      (err) => handleFirestoreError(err, 'list', 'suppliers')
    );

    const unsubSales = onSnapshot(query(collection(db, 'sales'), orderBy('createdAt', 'desc')), 
      (snap) => setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as Sale))),
      (err) => handleFirestoreError(err, 'list', 'sales')
    );

    const unsubPurchases = onSnapshot(query(collection(db, 'purchases'), orderBy('createdAt', 'desc')), 
      (snap) => setPurchases(snap.docs.map(d => ({ id: d.id, ...d.data() } as Purchase))),
      (err) => handleFirestoreError(err, 'list', 'purchases')
    );

    const unsubUsers = onSnapshot(collection(db, 'users'), 
      (snap) => setUsers(snap.docs.map(d => ({ ...(d.data() as UserProfile), uid: d.id }))),
      (err) => handleFirestoreError(err, 'list', 'users')
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubCustomers();
      unsubSuppliers();
      unsubSales();
      unsubPurchases();
      unsubUsers();
    };
  }, [activeUser]);

  const handleLogin = () => signInWithPopup(auth, new GoogleAuthProvider());
  const handleLogout = () => {
    signOut(auth);
    setIsAdminUnlocked(false);
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const id = data.get('id');
    const pass = data.get('pass');

    if (id === 'admin' && pass === '1234') {
      try {
        const result = await signInAnonymously(auth);
        const uid = result.user.uid;
        // Create/Update Admin Profile for this session
        await setDoc(doc(db, 'users', uid), {
          uid,
          email: 'admin@system.local',
          displayName: 'System Admin',
          photoURL: '',
          role: 'admin',
          createdAt: serverTimestamp()
        });
        setIsAdminUnlocked(true);
        showMessage("Admin Login Success");
      } catch (err: any) {
        if (err.code === 'auth/admin-restricted-operation' || err.message?.includes('restricted')) {
          showMessage("Note: Auth restricted. Using offline mode.", "error");
          setProfile({
            uid: 'manual-admin',
            email: 'admin@system.local',
            displayName: 'System Admin',
            photoURL: '',
            role: 'admin',
            createdAt: new Date()
          } as any);
          setIsAdminUnlocked(true);
        } else {
          handleFirestoreError(err, 'auth', 'manual-login');
        }
      }
    } else {
      showMessage(t.incorrectPassword, 'error');
    }
  };

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  if (!activeUser) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <LayoutDashboard className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Agri Boutabssil</h1>
            <p className="text-gray-500 mt-2">Professional Agricultural POS & Inventory Management</p>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-3">
            <input name="id" placeholder={t.adminID} required className="w-full h-12 bg-gray-50 border rounded-xl px-4 font-bold outline-none focus:ring-2 focus:ring-primary" />
            <input name="pass" type="password" placeholder={t.password} required className="w-full h-12 bg-gray-50 border rounded-xl px-4 font-bold outline-none focus:ring-2 focus:ring-primary" />
            <button type="submit" className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
              {t.login}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">Or</span></div>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
          >
            Connect with Google
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-screen flex flex-col bg-gray-50 overflow-hidden", language === 'ar' ? 'rtl font-arabic' : '')} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={cn(
              "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold",
              message.type === 'error' ? 'bg-destructive text-white' : 'bg-green-600 text-white'
            )}
          >
            {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-20 bg-white border-b px-6 md:px-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter">Agri Boutabssil</span>
        </div>

        <div className="flex items-center gap-6">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-gray-100 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary h-10 px-3 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>

          <div className="flex items-center gap-3 pl-6 border-l">
            {activeProfile?.photoURL && (
              <img src={activeProfile.photoURL} className="w-10 h-10 rounded-full border-2 border-primary/20" alt="" />
            )}
            <div className="hidden md:block">
              <p className="text-sm font-black">{activeProfile?.displayName}</p>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{activeProfile?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b overflow-x-auto shrink-0 flex px-6 md:px-12 items-center">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
          { id: 'pos', icon: ShoppingCart, label: t.pos },
          { id: 'inventory', icon: Package, label: t.inventory },
          { id: 'customers', icon: Users, label: t.customers },
          { id: 'suppliers', icon: Building2, label: t.suppliers },
          { id: 'history', icon: HistoryIcon, label: t.history },
          { id: 'purchases', icon: FileText, label: t.purchases },
          { id: 'staff', icon: Settings, label: t.settings },
        ].filter(Boolean).map((item: any) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "h-16 flex items-center gap-2 px-6 font-bold border-b-2 transition-all whitespace-nowrap",
              view === item.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-gray-400 hover:text-gray-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto"
          >
            {view === 'dashboard' && <Dashboard products={products} sales={sales} customers={customers} suppliers={suppliers} t={t} />}
            {view === 'pos' && <POS products={products} categories={categories} customers={customers} showMessage={showMessage} t={t} lastInvoiceNo={lastInvoiceNo} handleFirestoreError={handleFirestoreError} activeUser={activeUser} />}
            {view === 'inventory' && <Inventory products={products} categories={categories} suppliers={suppliers} showMessage={showMessage} t={t} handleFirestoreError={handleFirestoreError} />}
            {view === 'customers' && <CRMView type="customers" items={customers} products={products} showMessage={showMessage} t={t} handleFirestoreError={handleFirestoreError} />}
            {view === 'suppliers' && <CRMView type="suppliers" items={suppliers} products={products} showMessage={showMessage} t={t} handleFirestoreError={handleFirestoreError} />}
            {view === 'history' && <HistoryView sales={sales} t={t} />}
            {view === 'purchases' && <PurchasesView products={products} suppliers={suppliers} purchases={purchases} showMessage={showMessage} t={t} handleFirestoreError={handleFirestoreError} />}
            {view === 'staff' && (
              <div className="space-y-12">
                <div className="bg-white rounded-3xl border p-8 shadow-sm space-y-6">
                  <h2 className="text-2xl font-black">{t.adminUnlock}</h2>
                  {!isAdminUnlocked ? (
                    <div className="max-w-sm space-y-4">
                      <p className="text-gray-500 font-medium">{t.enterAdminPassword}</p>
                      <input 
                        type="password" 
                        placeholder="****" 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (e.currentTarget.value === '1234') setIsAdminUnlocked(true);
                            else showMessage(t.incorrectPassword, 'error');
                          }
                        }}
                        className="w-full h-12 bg-gray-50 border rounded-xl px-4 font-bold" 
                      />
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="p-4 bg-green-50 text-green-700 rounded-2xl font-bold flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Admin Mode Active
                      </div>
                      <button onClick={() => setIsAdminUnlocked(false)} className="text-sm font-bold text-red-500 underline">Lock</button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl border p-8 shadow-sm space-y-6">
                  <h2 className="text-2xl font-black">{t.backup}</h2>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={downloadBackup} className="h-12 bg-primary text-white rounded-xl px-6 font-bold flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      {t.downloadBackup}
                    </button>
                    <button onClick={seedSampleData} className="h-12 border border-primary text-primary rounded-xl px-6 font-bold flex items-center gap-2 hover:bg-primary/5">
                      <PlusCircle className="w-5 h-5" />
                      Seed Sample Data
                    </button>
                  </div>
                </div>

                {isAdminUnlocked && <StaffManagement users={users} currentUser={activeProfile!} showMessage={showMessage} t={t} language={language} handleFirestoreError={handleFirestoreError} />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Sub-components ---

function Dashboard({ products, sales, customers, suppliers, t }: any) {
  const totalSales = sales.reduce((acc: number, s: any) => acc + s.total, 0);
  const totalCustomerDebt = customers.reduce((acc: number, c: any) => acc + c.debt, 0);
  const totalSupplierDebt = suppliers.reduce((acc: number, s: any) => acc + (s.debt || 0), 0);
  const lowStock = products.filter((p: any) => p.qty <= p.minQty).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={TrendingUp} label={t.totalSales} value={totalSales} color="text-green-600" bg="bg-green-100" currency={t.currency} />
        <StatCard icon={Wallet} label={t.totalDebt} value={totalCustomerDebt} color="text-red-600" bg="bg-red-100" currency={t.currency} />
        <StatCard icon={Building2} label={t.suppliersDebt} value={totalSupplierDebt} color="text-blue-600" bg="bg-blue-100" currency={t.currency} />
        <StatCard icon={AlertCircle} label={t.lowStock} value={lowStock} color="text-amber-600" bg="bg-amber-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border shadow-xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              {t.lowStock}
            </h3>
            <span className="bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-xl">
              {products.filter((p: any) => p.qty <= (p.minQty || 5)).length}
            </span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
            {products.filter((p: any) => p.qty <= (p.minQty || 5)).map((p: any) => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-red-50/30 rounded-2xl border border-red-50 group hover:border-red-200 transition-all">
                <div>
                  <p className="font-black text-gray-900">{p.name}</p>
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Stock: {p.qty} / Min: {p.minQty || 5}</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-red-500">
                  {p.qty}
                </div>
              </div>
            ))}
            {products.filter((p: any) => p.qty <= (p.minQty || 5)).length === 0 && (
              <div className="text-center py-12 text-gray-400 font-bold">
                كل شيء على ما يرام! لا يوجد نقص في المخزون.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border shadow-xl p-8 space-y-6" dir="rtl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Calendar className="w-6 h-6 text-orange-500" />
              {t.paymentAlert}
            </h3>
            <span className="bg-orange-100 text-orange-600 text-xs font-black px-3 py-1 rounded-xl">
              {customers.filter((c: any) => c.dueDate && new Date(c.dueDate) <= new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)).length}
            </span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-auto pl-2">
            {customers.filter((c: any) => c.dueDate && new Date(c.dueDate) <= new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)).map((c: any) => (
              <div key={c.id} className="flex justify-between items-center p-4 bg-orange-50/30 rounded-2xl border border-orange-50 group hover:border-orange-200 transition-all">
                <div className="text-right">
                  <p className="font-black text-gray-900">{c.name}</p>
                  <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">{t.dueDate}: {c.dueDate}</p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-orange-600">{c.debt.toFixed(2)} {t.currency}</p>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-lg border font-black text-gray-400">{c.phone}</span>
                </div>
              </div>
            ))}
            {customers.filter((c: any) => c.dueDate && new Date(c.dueDate) <= new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)).length === 0 && (
              <div className="text-center py-12 text-gray-400 font-bold">
                لا توجد ديون قريبة الاستحقاق حالياً.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border p-8 shadow-sm">
        <h2 className="text-xl font-black mb-6">{t.recentSales}</h2>
        <div className="space-y-4">
          {sales.slice(0, 5).map((sale: any) => (
            <div key={sale.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-primary">
                  {sale.customerName?.[0] || 'G'}
                </div>
                <div>
                  <p className="font-black truncate max-w-[150px]">{sale.customerName || 'Guest'}</p>
                  <p className="text-[10px] text-primary font-black uppercase">Inv #{sale.invoiceNo || sale.id.slice(-6).toUpperCase()}</p>
                  <p className="text-[10px] text-gray-400">
                    {sale.createdAt?.toDate().toLocaleDateString()} {sale.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <p className="text-lg font-black">{sale.total.toFixed(2)} {t.currency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, currency }: any) {
  return (
    <div className="bg-white rounded-3xl border p-6 shadow-sm flex items-center gap-5">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", bg)}>
        <Icon className={cn("w-7 h-7", color)} />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase font-black tracking-widest">{label}</p>
        <p className="text-2xl font-black tracking-tighter">
          {typeof value === 'number' ? value.toLocaleString() : value} {currency}
        </p>
      </div>
    </div>
  );
}

function POS({ products, categories, customers, showMessage, t, lastInvoiceNo, handleFirestoreError, activeUser }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [received, setReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'debt' | 'cheque'>('cash');
  const [chequeDetails, setChequeDetails] = useState({ name: '', number: '', date: '' });
  const [use10PercentMargin, setUse10PercentMargin] = useState(false);

  const formatInvoice = (no: number) => String(no).padStart(7, '0');

  const filteredItems = products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (!selectedCategoryId || p.categoryId === selectedCategoryId)
  );
  const subtotal = cart.reduce((acc, p) => acc + (p.qty * p.price), 0);
  const cartWithMargin = use10PercentMargin 
    ? cart.map(item => ({ ...item, price: item.price * 1.1 }))
    : cart;
  
  const displaySubtotal = cartWithMargin.reduce((acc, p) => acc + (p.qty * p.price), 0);
  const total = Math.max(0, displaySubtotal - discount);
  const change = Math.max(0, received - total);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      const basePrice = product.sellPrice || product.price || 0;

      if (existing) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...product, qty: 1, price: basePrice }];
    });
  };

  const submitSale = async () => {
    if (cart.length === 0) return;
    
    let finalCustomerId = selectedCustomerId;
    let finalCustomerName = customers.find((c: any) => c.id === selectedCustomerId)?.name || guestName || "زبون مجهول";

    try {
      const saleRef = doc(collection(db, 'sales'));
      await runTransaction(db, async (transaction) => {
        // 1. All Reads First
        const productSnaps = [];
        for (const item of cart) {
          const productRef = doc(db, 'products', item.id);
          const snap = await transaction.get(productRef);
          if (!snap.exists()) throw new Error(`Product not found: ${item.name}`);
          productSnaps.push({ ref: productRef, snap, item });
        }

        // If it's debt and No Customer ID but we have a guest name, create a new customer
        if (paymentMethod === 'debt' && !selectedCustomerId && guestName) {
           const newCustRef = doc(collection(db, 'customers'));
           transaction.set(newCustRef, {
             name: guestName,
             phone: "",
             debt: 0,
             createdAt: serverTimestamp()
           });
           finalCustomerId = newCustRef.id;
        }

        // 2. All Writes Second
        const itemsWithMargin = cart.map(c => ({ 
          productId: c.id, 
          productName: c.name, 
          qty: c.qty, 
          price: use10PercentMargin ? c.price * 1.1 : c.price 
        }));

        const nextInvoiceNo = (lastInvoiceNo || 0) + 1;
        const saleData = {
          invoiceNo: formatInvoice(nextInvoiceNo),
          customerId: finalCustomerId || null,
          customerName: finalCustomerName,
          items: itemsWithMargin,
          subtotal: displaySubtotal,
          discount,
          total,
          received,
          paymentMethod,
          chequeDetails: paymentMethod === 'cheque' ? chequeDetails : null,
          createdAt: serverTimestamp(),
          staffId: activeUser?.uid || 'manual-admin'
        };

        for (const { ref, snap, item } of productSnaps) {
          const newQty = snap.data().qty - item.qty;
          if (newQty < 0) throw new Error(`Insufficient stock for ${item.name}`);
          transaction.update(ref, { qty: newQty });
        }
        
        if (paymentMethod === 'debt' && finalCustomerId) {
          const customerRef = doc(db, 'customers', finalCustomerId);
          transaction.update(customerRef, { debt: increment(total) });
        }

        transaction.set(saleRef, saleData);
        
        const posSettingsRef = doc(db, 'settings', 'pos');
        transaction.set(posSettingsRef, { lastInvoiceNo: nextInvoiceNo }, { merge: true });
        
        setLastCompletedSale({ ...saleData, id: saleRef.id });
      });

      setCart([]);
      setDiscount(0);
      setReceived(0);
      setChequeDetails({ name: '', number: '', date: '' });
      setSelectedCustomerId('');
      setGuestName('');
      showMessage(t.success);
    } catch (e) {
      handleFirestoreError(e, 'transaction', 'sale_submit');
      showMessage("Error completing sale", "error");
    }
  };

  const [lastCompletedSale, setLastCompletedSale] = useState<any>(null);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-12rem)]">
      {/* ... existing layout ... */}
      <AnimatePresence>
        {lastCompletedSale && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:p-0">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden print:shadow-none print:max-h-none print:max-w-none print:w-full">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50 print:hidden">
                <h3 className="text-xl font-black">{t.invoice} #{lastCompletedSale.invoiceNo}</h3>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="h-10 px-4 bg-gray-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all">
                    <Printer className="w-4 h-4" /> {t.print}
                  </button>
                  <button onClick={() => setLastCompletedSale(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-12 space-y-10" dir="rtl">
                {/* Modern Invoice Content */}
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                      <LayoutDashboard className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black tracking-tighter text-gray-900">AGRI BOUTABSSIL</h1>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Agriculture & Supply Experts</p>
                    </div>
                  </div>
                  <div className="text-left space-y-2">
                    <h2 className="text-5xl font-black text-gray-100 uppercase tracking-tighter -mt-2">FACT</h2>
                    <div className="pt-4">
                      <p className="text-[10px] font-black uppercase text-gray-400">{t.date}</p>
                      <p className="font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 border-t border-b py-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-gray-400">{t.customerName}</p>
                    <p className="text-xl font-black text-gray-900">{lastCompletedSale.customerName || "زبون مجهول"}</p>
                    <p className="font-bold text-gray-500">{lastCompletedSale.customerPhone || "---"}</p>
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-[10px] font-black uppercase text-gray-400">{t.invoiceNo}</p>
                    <p className="text-xl font-black text-gray-900">#{lastCompletedSale.invoiceNo}</p>
                    <p className="font-bold text-gray-500 uppercase">{lastCompletedSale.paymentMethod}</p>
                  </div>
                </div>

                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b">
                      <th className="py-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-right">{t.productName}</th>
                      <th className="py-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-center">{t.qty}</th>
                      <th className="py-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-left">{t.price}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lastCompletedSale.items.map((it: any, idx: number) => (
                      <tr key={idx} className="group">
                        <td className="py-5 font-bold text-gray-800">{it.productName}</td>
                        <td className="py-5 text-center font-black">×{it.qty}</td>
                        <td className="py-5 text-left font-black text-gray-900">{it.price.toFixed(2)} {t.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end pt-8">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-400">{t.subtotal}</span>
                      <span className="font-black">{lastCompletedSale.subtotal.toFixed(2)} {t.currency}</span>
                    </div>
                    {lastCompletedSale.discount > 0 && (
                      <div className="flex justify-between items-center text-sm text-red-500">
                        <span className="font-bold">{t.discount}</span>
                        <span className="font-black">-{lastCompletedSale.discount.toFixed(2)} {t.currency}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t-2 border-primary/20">
                      <span className="text-xl font-black">{t.totalAmount}</span>
                      <span className="text-3xl font-black text-primary">{lastCompletedSale.total.toFixed(2)} {t.currency}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-12 text-center space-y-2 border-t-2 border-dashed">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">شكراً لثقتكم بنا</p>
                  <p className="text-[10px] font-bold text-gray-300">Agri Boutabssil | High Quality Supplies</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Products Column */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                placeholder={t.searchProducts || t.search} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border rounded-2xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary" 
              />
            </div>
            <button 
              onClick={() => setUse10PercentMargin(!use10PercentMargin)}
              className={cn(
                "h-14 px-6 rounded-2xl font-black transition-all flex items-center gap-2 shadow-sm whitespace-nowrap",
                use10PercentMargin ? "bg-orange-500 text-white" : "bg-white text-gray-500 border"
              )}
            >
              <TrendingUp className="w-5 h-5" />
              {t.increasePrices10}
              {use10PercentMargin && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-lg">+10%</span>}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             <button 
               onClick={() => setSelectedCategoryId('')}
               className={cn(
                 "px-6 py-2 rounded-xl font-bold whitespace-nowrap transition-all",
                 selectedCategoryId === '' ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white text-gray-500 border hover:bg-gray-50"
               )}
             >
               {t.allCategories}
             </button>
             {categories.map((cat: any) => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={cn(
                    "px-6 py-2 rounded-xl font-bold whitespace-nowrap transition-all",
                    selectedCategoryId === cat.id ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white text-gray-500 border hover:bg-gray-50"
                  )}
                >
                  {cat.name}
                </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-auto p-1 pb-10">
          {filteredItems.map((p: any) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.qty <= 0}
              className={cn(
                "group relative bg-white rounded-3xl border p-4 shadow-sm text-right flex flex-col justify-between h-52 hover:border-primary transition-all",
                p.qty <= (p.minQty || 5) && "border-red-100 bg-red-50/10",
                p.qty <= 0 && "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                   <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Package className="w-5 h-5" />
                   </div>
                   {p.qty <= (p.minQty || 5) && p.qty > 0 && (
                     <span className="bg-orange-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Low Stock</span>
                   )}
                   {p.qty <= 0 && (
                     <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full opacity-100">Out of Stock</span>
                   )}
                </div>
                <h3 className="font-black text-gray-800 line-clamp-2 leading-tight mt-3 text-lg">{p.name}</h3>
              </div>
              <div className="flex justify-between items-end mt-2 pt-3 border-t border-dashed">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.stock}: {p.qty}</p>
                </div>
                <p className="text-xl font-black text-primary tracking-tighter">
                  {(use10PercentMargin ? p.price * 1.1 : p.price).toFixed(2)}
                  <span className="text-[10px] ml-1">{t.currency}</span>
                </p>
              </div>
            </motion.button>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-block p-10 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-black">{t.noData}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="w-full lg:w-[420px] bg-white rounded-[40px] border shadow-2xl flex flex-col overflow-hidden">
        {/* Cart Header */}
        <div className="p-6 border-b bg-gray-50/50 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black">{t.cart}</h3>
            <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded-full">{cart.length} {t.items}</span>
          </div>
          
          <div className="space-y-2">
             <div className="relative">
                <select 
                  value={selectedCustomerId} 
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    if(e.target.value) setGuestName('');
                  }}
                  className="w-full h-10 bg-white border rounded-xl px-4 font-bold outline-none focus:ring-2 focus:ring-primary appearance-none shadow-sm text-sm"
                >
                  <option value="">-- إختر الزبون --</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Users className="w-3 h-3 text-gray-400" />
                </div>
             </div>
             
             {!selectedCustomerId && (
                <div className="relative">
                  <input 
                    placeholder="أو اكتب اسم الفلاح مباشرة..." 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full h-10 bg-white border rounded-xl pl-9 pr-4 font-bold outline-none focus:ring-2 focus:ring-primary shadow-inner text-sm"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <Edit3 className="w-3 h-3 text-gray-300" />
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {cart.map((item: any) => (
            <div key={item.id} className="bg-gray-50/50 p-6 rounded-[2.2rem] flex flex-col space-y-4 border border-transparent hover:border-gray-100 transition-all shadow-sm">
              <div className="flex justify-between items-start">
                <div className="font-black text-xl text-gray-900">
                  {(item.qty * (use10PercentMargin ? item.price * 1.1 : item.price)).toFixed(2)}
                </div>
                <div className="text-right flex-1 ml-4">
                  <p className="font-black text-lg text-gray-900 leading-tight truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    {(use10PercentMargin ? item.price * 1.1 : item.price).toFixed(2)} {t.currency} / UNIT
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <button 
                  onClick={() => setCart(prev => prev.filter(p => p.id !== item.id))}
                  className="w-10 h-10 rounded-xl bg-white text-gray-300 flex items-center justify-center hover:bg-red-50 hover:text-red-500 shadow-sm border border-gray-100 transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 bg-white p-1 rounded-2xl border shadow-sm h-12">
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50/50 rounded-lg font-black text-lg hover:bg-gray-100 transition-colors"
                  >+</button>
                  <span className="w-6 text-center font-black text-xl text-gray-800">{item.qty}</span>
                  <button 
                    onClick={() => setCart(cart.map(i => i.id === item.id ? { ...i, qty: Math.max(0, i.qty - 1) } : i).filter(i => i.qty > 0))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50/50 rounded-lg font-black text-lg hover:bg-gray-100 transition-colors"
                  >-</button>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4 py-20">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                 <ShoppingCart className="w-12 h-12 opacity-20" />
              </div>
              <p className="font-black uppercase tracking-widest text-[10px]">{t.emptyCartMessage || t.emptyCart}</p>
            </div>
          )}
        </div>

        {/* Payment Configuration (Based on Image) */}
        <div className="p-4 bg-gray-50 border-t space-y-4">
          {/* Payment Methods Toggle */}
          <div className="flex bg-white p-1 rounded-xl border shadow-sm h-12">
            {(['cash', 'card', 'debt', 'cheque'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={cn(
                  "flex-1 py-1 text-[10px] uppercase font-black rounded-lg transition-all",
                  paymentMethod === method ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                {t[method]}
              </button>
            ))}
          </div>

          {/* Cheque Details */}
          {paymentMethod === 'cheque' && (
            <div className="bg-white p-4 rounded-xl border border-dashed space-y-3">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">{t.cheque} Details</p>
              <div className="space-y-2">
                <input 
                  placeholder={t.chequeName}
                  value={chequeDetails.name}
                  onChange={(e) => setChequeDetails({ ...chequeDetails, name: e.target.value })}
                  className="w-full h-10 bg-gray-50 border rounded-lg px-3 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                />
                <input 
                  placeholder={t.chequeNumber}
                  value={chequeDetails.number}
                  onChange={(e) => setChequeDetails({ ...chequeDetails, number: e.target.value })}
                  className="w-full h-10 bg-gray-50 border rounded-lg px-3 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-gray-400 ml-2">{t.chequeDate}</label>
                  <input 
                    type="date"
                    value={chequeDetails.date}
                    onChange={(e) => setChequeDetails({ ...chequeDetails, date: e.target.value })}
                    className="w-full h-10 bg-gray-50 border rounded-lg px-3 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Received/Change Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 text-center">
              <label className="text-[10px] uppercase font-black text-gray-400">{t.received}</label>
              <input 
                type="number" 
                value={received || ''} 
                onChange={(e) => setReceived(Number(e.target.value))}
                className="w-full h-10 bg-white border focus:ring-1 focus:ring-primary rounded-xl text-center font-black text-lg outline-none shadow-sm transition-all"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1 text-center">
              <label className="text-[10px] uppercase font-black text-gray-400">{t.change}</label>
              <div className={cn(
                "w-full h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border",
                change > 0 ? "bg-green-50 text-green-700 border-green-100" : "bg-white text-gray-400"
              )}>
                {change.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Totals & Discounts */}
          <div className="space-y-2 py-3 border-y border-dashed">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t.subtotal}</span>
              <span className="font-black text-gray-600">{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t.discount}</span>
              <input 
                type="number" 
                value={discount || ''} 
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 h-6 bg-transparent border-b border-gray-200 text-right font-black text-gray-800 outline-none focus:border-primary transition-all"
                placeholder="0.00"
              />
            </div>
            
            <div className="pt-2 flex justify-between items-end">
              <span className="text-sm font-black uppercase tracking-tighter text-gray-400">{t.total}</span>
              <div className="text-right">
                <span className="text-[10px] font-black text-gray-300 ml-1">{t.currency}</span>
                <span className="text-3xl font-black tracking-tighter text-primary leading-none">{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => { setCart([]); setDiscount(0); setReceived(0); }}
              className="flex-1 h-12 bg-white border border-gray-200 text-gray-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
            >
               {t.emptyCart}
            </button>
            <button 
              disabled={cart.length === 0}
              onClick={submitSale}
              className="flex-[2] h-12 bg-gray-900 text-white rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-lg disabled:opacity-20 hover:bg-black transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t.completeTransaction}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inventory({ products, categories, suppliers, showMessage, t, handleFirestoreError }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const prod = {
      name: data.get('name'),
      buyPrice: Number(data.get('buyPrice')),
      price: Number(data.get('price')),
      qty: Number(data.get('qty')),
      minQty: Number(data.get('minQty')),
      categoryId: data.get('categoryId'),
      supplierId: data.get('supplierId'),
    };

    try {
      if (editing.id === 'new') {
        await addDoc(collection(db, 'products'), { ...prod, createdAt: serverTimestamp() });
      } else {
        await updateDoc(doc(db, 'products', editing.id), prod);
      }
      setEditing(null);
      showMessage(t.inventory);
    } catch (e) {
      handleFirestoreError(e, 'write', 'products');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-black tracking-tight">{t.inventory}</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              placeholder={t.search} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
          <button 
            onClick={() => setEditing({ id: 'new', name: '', buyPrice: 0, price: 0, qty: 0, minQty: 5, categoryId: '', supplierId: '' })} 
            className="h-12 px-6 bg-gray-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all whitespace-nowrap shadow-lg shadow-gray-200"
          >
            <PlusCircle className="w-5 h-5" />
            {t.addStock}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border shadow-xl overflow-hidden text-right">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-5 text-[10px] uppercase font-black text-gray-400 tracking-widest">{t.productName}</th>
                <th className="px-6 py-5 text-[10px] uppercase font-black text-gray-400 tracking-widest">{t.category}</th>
                <th className="px-6 py-5 text-[10px] uppercase font-black text-gray-400 tracking-widest">{t.selectSupplier}</th>
                <th className="px-6 py-5 text-[10px] uppercase font-black text-gray-400 tracking-widest">{t.buyPrice}</th>
                <th className="px-6 py-5 text-[10px] uppercase font-black text-gray-400 tracking-widest">{t.sellPrice}</th>
                <th className="px-6 py-5 text-[10px] uppercase font-black text-gray-400 tracking-widest">{t.stock}</th>
                <th className="px-6 py-5 text-[10px] uppercase font-black text-gray-400 tracking-widest text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-5 font-black text-gray-900">{p.name}</td>
                  <td className="px-6 py-5">
                    <span className="bg-gray-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-wider">
                      {categories.find((c: any) => c.id === p.categoryId)?.name || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-blue-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-wider">
                      {suppliers.find((s: any) => s.id === p.supplierId)?.name || '---'}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-400">{p.buyPrice} {t.currency}</td>
                  <td className="px-6 py-5 font-black text-primary">{p.price} {t.currency}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-start">
                      <span className={cn(
                        "px-4 py-1 rounded-full text-xs font-black",
                        p.qty <= (p.minQty || 0) ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      )}>
                        {p.qty}
                      </span>
                      {p.qty <= (p.minQty || 0) && (
                        <div className="flex items-center gap-1 text-red-400 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-[10px] font-black">{t.lowStock}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 flex items-center justify-center gap-2 pt-8">
                    <button onClick={() => setEditing(p)} className="p-2 hover:bg-primary/10 text-primary rounded-lg">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteDoc(doc(db, 'products', p.id)).catch(e => handleFirestoreError(e, 'delete', `products/${p.id}`))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-black">{editing.id === 'new' ? t.addStock : t.edit}</h3>
                <button onClick={() => setEditing(null)}><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-4">{t.productName}</label>
                  <input name="name" defaultValue={editing.name} required className="w-full h-14 bg-gray-50 border-none rounded-xl px-6 font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-4">{t.buyPrice}</label>
                    <input name="buyPrice" type="number" step="0.01" defaultValue={editing.buyPrice} required className="w-full h-14 bg-gray-50 border-none rounded-xl px-6 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-4">{t.sellPrice}</label>
                    <input name="price" type="number" step="0.01" defaultValue={editing.price} required className="w-full h-14 bg-gray-50 border-none rounded-xl px-6 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-4">{t.qty}</label>
                    <input name="qty" type="number" defaultValue={editing.qty} required className="w-full h-14 bg-gray-50 border-none rounded-xl px-6 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-4">Min Stock Alert</label>
                    <input name="minQty" type="number" defaultValue={editing.minQty} required className="w-full h-14 bg-gray-50 border-none rounded-xl px-6 font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-4">{t.category}</label>
                    <select name="categoryId" defaultValue={editing.categoryId} className="w-full h-14 bg-gray-50 border-none rounded-xl px-6 font-bold">
                      <option value="">General</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-4">{t.selectSupplier}</label>
                    <select name="supplierId" defaultValue={editing.supplierId} className="w-full h-14 bg-gray-50 border-none rounded-xl px-6 font-bold">
                      <option value="">-- {t.selectSupplier} --</option>
                      {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setEditing(null)} className="flex-1 h-14 border rounded-2xl font-black uppercase tracking-widest text-xs">{t.cancel}</button>
                  <button type="submit" className="flex-1 h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">{t.save}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CRMView({ type, items, products, showMessage, t, handleFirestoreError }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [paying, setPaying] = useState<any>(null);
  const [restocking, setRestocking] = useState<any>(null);
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'cheque'>('cash');
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [tab, setTab] = useState<'statement' | 'products'>('statement');
  const [combinedHistory, setCombinedHistory] = useState<any[]>([]);

  const filteredItems = items.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()));

  const suppliedProducts = useMemo(() => {
    if (type !== 'suppliers' || !selectedEntity) return [];
    return products.filter((p: any) => p.supplierId === selectedEntity.id);
  }, [type, selectedEntity, products]);

  useEffect(() => {
    if (selectedEntity) {
      const collectionName = type === 'customers' ? 'sales' : 'purchases';
      const entityIdField = type === 'customers' ? 'customerId' : 'supplierId';
      
      const qSales = query(collection(db, collectionName), where(entityIdField, '==', selectedEntity.id), orderBy('createdAt', 'desc'));
      const qPayments = query(collection(db, 'payments'), where('entityId', '==', selectedEntity.id), orderBy('createdAt', 'desc'));
      
      const unsubSales = onSnapshot(qSales, (saleSnap) => {
        const salesData = saleSnap.docs.map(d => ({ id: d.id, type: 'invoice', ...d.data() }));
        const unsubPayments = onSnapshot(qPayments, (paySnap) => {
          const paymentsData = paySnap.docs.map(d => ({ id: d.id, type: 'payment', ...d.data() }));
          const combined = [...salesData, ...paymentsData].sort((a: any, b: any) => 
            (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
          );
          setCombinedHistory(combined);
        });
        return unsubPayments;
      }, (err) => handleFirestoreError(err, 'get', collectionName));

      return () => {
        unsubSales();
      };
    }
  }, [selectedEntity, type, handleFirestoreError]);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const item = {
      name: data.get('name'),
      phone: data.get('phone'),
      debt: Number(data.get('debt') || 0),
      dueDate: data.get('dueDate') || null
    };

    try {
      if (editing.id === 'new') {
        await addDoc(collection(db, type), { ...item, createdAt: serverTimestamp() });
      } else {
        await updateDoc(doc(db, type, editing.id), item);
      }
      setEditing(null);
      showMessage(t[type]);
    } catch (err) {
      handleFirestoreError(err, 'write', type);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const amount = Number(data.get('amount'));
    const description = data.get('description');
    const chequeName = data.get('chequeName');
    const chequeNumber = data.get('chequeNumber');
    const chequeDate = data.get('chequeDate');

    if (!amount || amount <= 0 || isNaN(amount)) return;

    try {
      await runTransaction(db, async (transaction) => {
        const entityRef = doc(db, type, paying.id);
        const entitySnap = await transaction.get(entityRef);
        if (!entitySnap.exists()) throw new Error("Entity not found");
        
        // Use increment for atomic safety
        transaction.update(entityRef, { debt: increment(-amount) });
        
        const paymentRef = doc(collection(db, 'payments'));
        transaction.set(paymentRef, {
          entityId: paying.id,
          entityType: type,
          amount,
          description,
          paymentMethod: payMethod,
          chequeDetails: payMethod === 'cheque' ? {
            name: chequeName,
            number: chequeNumber,
            date: chequeDate
          } : null,
          createdAt: serverTimestamp()
        });
      });
      setPaying(null);
      setPayMethod('cash');
      showMessage(t.paymentPosted);
    } catch (err) {
      handleFirestoreError(err, 'transaction', 'payment');
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const qty = Number(data.get('qty'));
    const cost = Number(data.get('cost'));
    
    if (isNaN(qty) || isNaN(cost) || qty <= 0 || cost <= 0) {
      showMessage("الرجاء إدخال كمية وثمن صحيحين", "error");
      return;
    }

    const totalCost = qty * cost;

    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'products', restocking.id);
        const productSnap = await transaction.get(productRef);
        if (!productSnap.exists()) throw new Error("Product not found");

        const supplierRef = doc(db, 'suppliers', selectedEntity.id);
        const supplierSnap = await transaction.get(supplierRef);
        if (!supplierSnap.exists()) throw new Error("Supplier not found");

        transaction.update(productRef, { 
          qty: increment(qty),
          buyPrice: cost,
          supplierId: selectedEntity.id 
        });

        transaction.update(supplierRef, { debt: increment(totalCost) });

        const purchaseRef = doc(collection(db, 'purchases'));
        transaction.set(purchaseRef, {
          supplierId: selectedEntity.id,
          supplierName: selectedEntity.name,
          items: [{
            productId: restocking.id,
            productName: restocking.name,
            qty,
            unitPrice: cost
          }],
          total: totalCost,
          createdAt: serverTimestamp()
        });
      });
      setRestocking(null);
      showMessage("Stock Updated");
    } catch (err) {
      handleFirestoreError(err, 'transaction', 'restock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-black tracking-tight">{t[type]}</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              placeholder={t.search} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
          <button 
            onClick={() => setEditing({ id: 'new', name: '', phone: '', debt: 0, dueDate: '' })}
            className="shrink-0 h-12 bg-gray-900 text-white rounded-xl px-6 font-bold flex items-center gap-2 whitespace-nowrap shadow-lg shadow-gray-200 hover:bg-black transition-all"
          >
            <UserPlus className="w-5 h-5" />
            {type === 'customers' ? t.addCustomer : t.addSupplier}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item: any) => (
          <motion.div 
            layout
            key={item.id} 
            className="group bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => setSelectedEntity(item)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  {type === 'customers' ? <Users className="w-6 h-6 border-none" /> : <Package className="w-6 h-6 border-none" />}
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{item.name}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">{item.phone || '---'}</p>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-end bg-gray-50/50 p-4 rounded-2xl border border-transparent group-hover:border-gray-100 transition-all">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 text-right">{t.balance}</p>
                    <p className={cn(
                      "text-2xl font-black tracking-tighter",
                      item.debt > 0 ? "text-red-500" : (item.debt < 0 ? "text-orange-500" : "text-green-600")
                    )}>
                      {Math.abs(item.debt || 0).toLocaleString()} <span className="text-xs ml-1">{t.currency}</span>
                    </p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                    item.debt > 0 ? "bg-red-50 text-red-500" : (item.debt < 0 ? "bg-orange-50 text-orange-500" : "bg-green-50 text-green-600")
                  )}>
                    {item.debt > 0 ? t.debitBalance : (item.debt < 0 ? t.credit : t.balance)}
                  </div>
                </div>

                {type === 'suppliers' && (
                  <div className="flex items-center gap-2 px-2">
                     <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {products.filter((p: any) => p.supplierId === item.id).length} {t.items} {t.suppliedProducts}
                     </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-dashed flex flex-wrap gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setPaying(item); }}
                  className="flex-1 min-w-[80px] h-12 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-3 h-3" />
                  {t.addPayment}
                </button>
                
                {type === 'suppliers' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedEntity(item); setTab('products'); }}
                    className="flex-1 min-w-[80px] h-12 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-3 h-3" />
                    {t.restock}
                  </button>
                )}

                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditing(item); }}
                    className="w-12 h-12 bg-white border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm(t.deleteConfirm || "Are you sure?")) deleteDoc(doc(db, type, item.id)).catch(e => handleFirestoreError(e, 'delete', `${type}/${item.id}`)) }}
                    className="w-12 h-12 bg-white border border-red-50 text-red-200 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-24 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed w-full">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">{t.noData}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEntity && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:p-0">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden print:shadow-none print:max-h-none print:max-w-none print:w-full">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50 print:hidden">
                <div className="text-right">
                  <h3 className="text-xl font-black">{selectedEntity.name}</h3>
                  <div className="flex gap-4 mt-2">
                    <button 
                      onClick={() => setTab('statement')}
                      className={cn("text-[10px] uppercase font-black tracking-widest pb-1 border-b-2 transition-all", tab === 'statement' ? "border-primary text-primary" : "border-transparent text-gray-400")}
                    >
                      {t.statement}
                    </button>
                    {type === 'suppliers' && (
                      <button 
                        onClick={() => setTab('products')}
                        className={cn("text-[10px] uppercase font-black tracking-widest pb-1 border-b-2 transition-all", tab === 'products' ? "border-primary text-primary" : "border-transparent text-gray-400")}
                      >
                        {t.suppliedProducts}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="h-10 px-4 bg-gray-900 text-white rounded-xl font-bold flex items-center gap-2"><Printer className="w-4 h-4" /> {t.print}</button>
                  <button onClick={() => setSelectedEntity(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all"><X className="w-6 h-6" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-12 space-y-8" dir="rtl">
                {tab === 'statement' ? (
                  <>
                    <div className="flex justify-between items-start border-b-2 border-primary/10 pb-8">
                      <div className="space-y-4">
                         <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center">
                            <LayoutDashboard className="w-12 h-12 text-white" />
                         </div>
                        <div>
                          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">AGRI BOUTABSSIL</h1>
                          <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Relevé de Compte Officiel</p>
                        </div>
                      </div>
                      <div className="text-left space-y-1">
                        <p className="text-2xl font-black">{selectedEntity.name}</p>
                        <p className="text-gray-500 font-bold">{selectedEntity.phone}</p>
                        <div className="pt-6">
                          <p className="text-[10px] font-black uppercase text-gray-400">{t.balance}</p>
                          <p className={cn("text-4xl font-black", selectedEntity.debt !== 0 ? "text-red-500" : "text-green-600")}>
                            {Math.abs(selectedEntity.debt).toFixed(2)} {t.currency}
                          </p>
                          <p className="text-[10px] font-black uppercase mt-1">
                            {selectedEntity.debt > 0 ? t.debitBalance : (selectedEntity.debt < 0 ? t.credit : t.balance)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <table className="w-full text-right bg-white rounded-3xl overflow-hidden border shadow-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-5 font-black uppercase text-[10px] text-gray-400 tracking-widest">{t.date}</th>
                          <th className="px-6 py-5 font-black uppercase text-[10px] text-gray-400 tracking-widest">{t.description}</th>
                          <th className="px-6 py-5 font-black uppercase text-[10px] text-gray-400 tracking-widest text-left">{t.amount}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {combinedHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <p className="text-xs font-bold text-gray-900">
                                 {item.createdAt?.toDate?.() ? new Date(item.createdAt.toDate()).toLocaleDateString() : '---'}
                              </p>
                              <p className="text-[10px] text-gray-400 font-bold">
                                 {item.createdAt?.toDate?.() ? new Date(item.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </p>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  item.type === 'invoice' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                                )}>
                                  {item.type === 'invoice' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                </div>
                                <div>
                                   <p className="font-bold text-gray-800">
                                     {item.invoiceNo ? `${t.invoice} #${item.invoiceNo}` : (item.description || t.paymentPosted)}
                                   </p>
                                   <p className="text-[10px] text-gray-400 font-bold">{item.type === 'invoice' ? t.completeTransaction : t.paymentPosted}</p>
                                   <div className="flex gap-2">
                                     {item.paymentMethod && (
                                       <p className="text-[10px] bg-gray-100 px-2 rounded font-black uppercase text-gray-500">{t[item.paymentMethod] || item.paymentMethod}</p>
                                     )}
                                     {item.chequeDetails && (
                                       <p className="text-[10px] bg-blue-50 text-blue-500 px-2 rounded font-bold">
                                         {item.chequeDetails.number} | {item.chequeDetails.date}
                                       </p>
                                     )}
                                   </div>
                                </div>
                              </div>
                            </td>
                            <td className={cn(
                              "px-6 py-5 font-black text-left text-lg",
                              item.type === 'invoice' ? "text-red-500" : "text-green-600"
                            )}>
                              {item.type === 'invoice' ? (type === 'suppliers' ? '-' : '+') : (type === 'suppliers' ? '+' : '-')}{item.total?.toFixed(2) || item.amount?.toFixed(2)} {t.currency}
                            </td>
                          </tr>
                        ))}
                        {combinedHistory.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-6 py-16 text-center text-gray-400 font-bold">{t.noData}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-black">{t.suppliedProducts}</h4>
                      <div className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">
                        {suppliedProducts.length} منتجات مربوطة
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {suppliedProducts.map((p: any) => (
                        <div key={p.id} className="bg-gray-50 p-6 rounded-[2rem] border flex justify-between items-center group hover:bg-white transition-all shadow-sm">
                          <div>
                            <p className="font-black text-gray-900 text-lg">{p.name}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase">
                              {t.stock}: <span className={cn(p.qty <= (p.minQty || 0) ? "text-red-500" : "text-green-600")}>{p.qty}</span> | {t.buyPrice}: {p.buyPrice} {t.currency}
                            </p>
                          </div>
                          <button 
                            onClick={() => setRestocking(p)}
                            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-primary hover:bg-primary hover:text-white transition-all transform active:scale-95"
                            title={t.restock}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Quick Link Unassigned Products */}
                      {products.filter((p: any) => !p.supplierId).length > 0 && (
                        <div className="col-span-full mt-8 p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50">
                           <h5 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 mr-2">منتجات غير مربوطة بمورد - اضغط للربط</h5>
                           <div className="flex flex-wrap gap-2">
                              {products.filter((p: any) => !p.supplierId).map((p: any) => (
                                <button 
                                  key={p.id}
                                  onClick={() => updateDoc(doc(db, 'products', p.id), { supplierId: selectedEntity.id })}
                                  className="px-4 py-2 bg-white border border-blue-100 rounded-xl text-xs font-bold text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                >
                                  + {p.name}
                                </button>
                              ))}
                           </div>
                        </div>
                      )}

                      {suppliedProducts.length === 0 && products.filter((p: any) => !p.supplierId).length === 0 && (
                         <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">لا توجد منتجات مربوطة بهذا المورد حالياً.</p>
                         </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center pt-12 border-t-2 border-dashed">
                   <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">Agri Boutabssil | Business Statement</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {restocking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                  <div className="text-right">
                    <h3 className="text-xl font-black">{t.restock}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase">{restocking.name}</p>
                  </div>
                  <button onClick={() => setRestocking(null)}><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleRestock} className="p-8 space-y-6" dir="rtl">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 mr-4">{t.qty}</label>
                        <input name="qty" type="number" required defaultValue="1" className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 mr-4">{t.unitCost}</label>
                        <input name="cost" type="number" step="0.01" required defaultValue={restocking.buyPrice} className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-xl" />
                      </div>
                   </div>
                   <div className="pt-4 flex gap-4">
                      <button type="button" onClick={() => setRestocking(null)} className="flex-1 h-14 border rounded-2xl font-black uppercase tracking-widest text-xs">{t.cancel}</button>
                      <button type="submit" className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">{t.save}</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}

        {paying && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="text-xl font-black">{t.addPayment}</h3>
                  <button onClick={() => setPaying(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handlePayment} className="p-8 space-y-6 text-right" dir="rtl">
                   <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{paying.name}</p>
                      <p className="text-2xl font-black text-primary">{paying.debt.toFixed(2)} {t.currency}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">{t.totalDue}</p>
                   </div>
                   <div className="flex bg-white p-1 rounded-xl border shadow-sm h-12">
                      {(['cash', 'card', 'cheque'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPayMethod(method)}
                          className={cn(
                            "flex-1 py-1 text-[10px] uppercase font-black rounded-lg transition-all",
                            payMethod === method ? "bg-gray-900 text-white shadow-lg" : "text-gray-400"
                          )}
                        >
                          {t[method]}
                        </button>
                      ))}
                   </div>
                   {payMethod === 'cheque' && (
                     <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-blue-500 mr-2">{t.chequeName}</label>
                          <input name="chequeName" required className="w-full h-10 bg-white border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase text-blue-500 mr-2">{t.chequeNumber}</label>
                             <input name="chequeNumber" required className="w-full h-10 bg-white border-none rounded-xl px-4 text-sm font-black" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase text-blue-500 mr-2">{t.chequeDate}</label>
                             <input name="chequeDate" type="date" required className="w-full h-10 bg-white border-none rounded-xl px-4 text-sm font-bold" />
                           </div>
                        </div>
                     </div>
                   )}
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mr-2">{t.amount}</label>
                     <input name="amount" type="number" step="0.01" required className="w-full h-16 bg-gray-100 border-none rounded-2xl px-6 font-black text-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300" placeholder="0.00" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mr-2">{t.description}</label>
                     <input name="description" className="w-full h-14 bg-gray-100 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-primary outline-none" placeholder={t.description} />
                   </div>
                   <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setPaying(null)} className="flex-1 h-14 border-2 rounded-2xl font-black uppercase text-[10px] tracking-widest">{t.cancel}</button>
                      <button type="submit" className="flex-[2] h-14 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all transform active:scale-95">{t.save}</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-black">{editing.id === 'new' ? t.add : t.edit}</h3>
                <button onClick={() => setEditing(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6 text-right" dir="rtl">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mr-2">{t.name}</label>
                  <input name="name" defaultValue={editing.name} required className="w-full h-14 bg-gray-100 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mr-2">{t.phone}</label>
                  <input name="phone" defaultValue={editing.phone} className="w-full h-14 bg-gray-100 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mr-2">{t.debt}</label>
                    <input name="debt" type="number" step="0.01" defaultValue={editing.debt} className="w-full h-14 bg-gray-100 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mr-2">{t.dueDate}</label>
                    <input name="dueDate" type="date" defaultValue={editing.dueDate} className="w-full h-14 bg-gray-100 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setEditing(null)} className="flex-1 h-14 border-2 border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all">{t.cancel}</button>
                  <button type="submit" className="flex-1 h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all">{t.save}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HistoryView({ sales, t }: any) {
  return (
    <div className="bg-white rounded-3xl border shadow-sm p-8">
      <h2 className="text-2xl font-black tracking-tight mb-8">{t.history}</h2>
      <div className="space-y-6">
        {sales.map((sale: any) => (
          <div key={sale.id} className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-black text-primary uppercase tracking-widest mb-1">Inv #{sale.invoiceNo || sale.id.slice(-6).toUpperCase()}</p>
                <p className="text-lg font-black">{sale.customerName || 'Guest'}</p>
                <p className="text-xs text-gray-400">
                  {sale.createdAt?.toDate().toLocaleDateString()} {sale.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p className="text-2xl font-black">{sale.total.toFixed(2)} {t.currency}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {sale.items.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-xl border-dashed border shadow-sm">
                  <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{item.productName}</p>
                  <p className="text-sm font-black">{item.qty} x {item.price} {t.currency}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PurchasesView({ products, suppliers, purchases, showMessage, t, handleFirestoreError }: any) {
  const [adding, setAdding] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const submitPurchase = async () => {
    if (cart.length === 0 || !selectedSupplierId) return;
    const total = cart.reduce((acc, i) => acc + (i.qty * i.buyPrice), 0);
    const purchaseData = {
      supplierId: selectedSupplierId,
      supplierName: suppliers.find((s: any) => s.id === selectedSupplierId)?.name,
      items: cart.map(c => ({ productId: c.id, productName: c.name, qty: c.qty, price: c.buyPrice })),
      total,
      createdAt: serverTimestamp(),
    };

    try {
      await runTransaction(db, async (transaction) => {
        // Update Inventory
        for (const item of cart) {
          const productRef = doc(db, 'products', item.id);
          const snap = await transaction.get(productRef);
          if (!snap.exists()) throw new Error("Product not found");
          const newQty = snap.data().qty + item.qty;
          transaction.update(productRef, { qty: newQty });
        }
        // Update Supplier Debt
        const supplierRef = doc(db, 'suppliers', selectedSupplierId);
        transaction.update(supplierRef, { debt: increment(total) });
        // Save Purchase
        const purchaseRef = doc(collection(db, 'purchases'));
        transaction.set(purchaseRef, purchaseData);
      });
      setCart([]);
      setAdding(false);
      showMessage(t.addPurchase);
    } catch (e) {
      handleFirestoreError(e, 'transaction', 'purchase_submit');
      showMessage("Error completing purchase", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight">{t.purchases}</h2>
        <button onClick={() => setAdding(true)} className="h-12 bg-primary text-white rounded-xl px-6 font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t.addPurchase}
        </button>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm p-8">
        <h2 className="text-xl font-black mb-8">{t.purchasesHistory}</h2>
        <div className="space-y-6">
          {purchases.map((p: any) => (
            <div key={p.id} className="p-6 rounded-2xl bg-gray-50 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-black text-primary uppercase tracking-widest mb-1">Invoice #{p.id.slice(-6).toUpperCase()}</p>
                  <p className="text-lg font-black">{p.supplierName}</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt?.toDate()).toLocaleString()}</p>
                </div>
                <p className="text-2xl font-black">{p.total.toFixed(2)} {t.currency}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.items.map((item: any, idx: number) => (
                  <span key={idx} className="bg-white px-3 py-1 rounded-lg border text-xs font-bold">
                    {item.productName} (x{item.qty})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {adding && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-black">{t.addPurchase}</h3>
                <button onClick={() => setAdding(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                <div className="flex-1 p-6 overflow-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {products.map((p: any) => (
                      <button key={p.id} onClick={() => addToCart(p)} className="p-4 border rounded-2xl hover:bg-gray-50 text-left">
                        <p className="font-bold">{p.name}</p>
                        <p className="text-xs text-primary font-black">{p.buyPrice} {t.currency}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-full lg:w-80 bg-gray-50 p-6 border-l flex flex-col">
                  <div className="space-y-4 flex-1 overflow-auto">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t.supplierName}</label>
                    <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} className="w-full h-12 bg-white border rounded-xl px-4 font-bold">
                      <option value="">Select Supplier</option>
                      {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <div className="space-y-2">
                      {cart.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-lg border">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400">{item.buyPrice} x {item.qty}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setCart(cart.map(i => i.id === item.id ? { ...i, qty: Math.max(0, i.qty - 1) } : i).filter(i => i.qty > 0))} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md">-</button>
                            <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                            <button onClick={() => setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 border-t space-y-4">
                    <div className="flex justify-between font-black">
                      <span>Total:</span>
                      <span>{cart.reduce((acc, i) => acc + (i.qty * i.buyPrice), 0).toFixed(2)} {t.currency}</span>
                    </div>
                    <button disabled={cart.length === 0 || !selectedSupplierId} onClick={submitPurchase} className="w-full h-12 bg-primary text-white rounded-xl font-bold disabled:opacity-50 tracking-widest uppercase">
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StaffManagement({ users, currentUser, showMessage, t, language, handleFirestoreError }: { users: UserProfile[], currentUser: UserProfile, showMessage: any, t: any, language: Language, handleFirestoreError: any }) {
  const toggleRole = async (user: UserProfile) => {
    if (user.uid === currentUser.uid) return;
    const newRole = user.role === 'admin' ? 'staff' : 'admin';
    await updateDoc(doc(db, 'users', user.uid), { role: newRole })
      .then(() => showMessage("Role updated"))
      .catch(e => handleFirestoreError(e, 'update', `users/${user.uid}`));
  };

  return (
    <div className="bg-white rounded-3xl border shadow-sm p-8">
      <h2 className="text-2xl font-black tracking-tight mb-8">{t.staff}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-[10px] text-gray-400 uppercase font-black tracking-widest">
              <th className="p-4">Staff Member</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {u.photoURL ? (
                      <img src={u.photoURL} className="w-10 h-10 rounded-full border-2 border-primary/10" alt="" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400">
                        {u.displayName[0]}
                      </div>
                    )}
                    <p className="font-bold">{u.displayName}</p>
                  </div>
                </td>
                <td className="p-4 text-gray-500 font-medium">{u.email}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                    u.role === 'admin' ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {currentUser.role === 'admin' && u.uid !== currentUser.uid && (
                    <button 
                      onClick={() => toggleRole(u)}
                      className={cn(
                        "h-10 px-6 rounded-xl font-bold text-xs transition-all",
                        u.role === 'admin' ? "border text-red-500 hover:bg-red-50" : "bg-primary text-white hover:bg-primary/90"
                      )}
                    >
                      {u.role === 'admin' 
                        ? (language === 'ar' ? 'تغيير إلى موظف' : 'Demote to Staff') 
                        : (language === 'ar' ? 'ترقية إلى مسؤول' : 'Promote to Admin')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
