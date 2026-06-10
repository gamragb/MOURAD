/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import GamraStockView from './views/GamraStockView';
import GamraSupplierView from './views/GamraSupplierView';
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ShoppingCart,
  Package,
  BarChart3,
  LogOut,
  Plus,
  Minus,
  Trash2,
  Search,
  Edit,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Menu,
  X,
  Bell,
  User,
  Users,
  UserPlus,
  ShoppingBag,
  Banknote,
  Wallet,
  Printer,
  Clock,
  ChevronRight,
  Boxes,
  History,
  TrendingDown,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Bot,
  BrainCircuit,
  Settings,
  ShieldCheck,
  Globe,
  Palette,
  MapPin,
  CalendarDays,
  ListFilter,
  Layers,
  Archive,
  Download,
  Key,
  Phone,
  Upload,
  Zap,
  Paintbrush,
  Lightbulb,
  Wrench,
  Droplet,
  Hammer,
  Mail,
  CheckCircle,
 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { storage } from "./storage";
import type {
  Client,
  Product,
  Category,
  Sale,
  PaymentRecord,
  AppData,
  Cheque,
  Supplier,
} from "./storage";
import { analyzeStoreData, AIAnalysis } from "./geminiService";
import {
  saveBackupToCloud, 
  loadBackupFromCloud, 
} from "./driveSync";
// Dummy implementations for auth until fully integrated
const signInWithGoogle = async () => {};
const logoutFromFirebase = async () => {};
const registerAuthListener = (cb: any) => { cb({ uid: "local-user" }); return () => {}; };
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// --- Components ---
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { StaffManagementView } from "./views/StaffManagementView";
import { ActivityLogView } from "./views/ActivityLogView";
import { NotificationsView } from "./views/NotificationsView";

// --- Constants & Translations ---

const translations: any = {
  ar: {
    dashboard: "التقارير والتحليلات",
    pos: "نقطة البيع",
    stock: "إدارة المخزون",
    customers: "إدارة الزبناء",
    settings: "الإعدادات",
    logout: "إغلاق البرنامج",
    active_engine: "محرك_نشط",
    local_data: "البيانات مؤمنة محلياً",
    search: "بحث...",
    cart: "السلة النشطة",
    pay: "إتمام البيع",
    subtotal: "المجموع الفرعي",
    discount: "التخفيض",
    total: "المجموع الإجمالي",
    payment_method: "طريقة الدفع",
    cash: "نقداً",
    card: "بطاقة",
    wallet: "محفظة",
    credit: "كريدي",
    add_product: "إضافة منتج",
    categories_btn: "الفئات",
    stock_header: "المخزن والتصنيفات",
    password_change: "تغيير كلمة المرور",
    current_pass: "كلمة المرور الحالية",
    new_pass: "كلمة المرور الجديدة",
    save_pass: "حفظ كلمة المرور",
    language: "اللغة",
    appearance: "المظهر والألوان",
    shop_info: "معلومات المتجر",
    shop_name: "اسم المحل",
    shop_address: "العنوان / المدينة",
    shop_phone: "رقم هاتف المحل",
    currency: "العملة",
    backup: "الأمان والبيانات",
    export: "تصدير نسخة احتياطية",
    clear: "مسح جميع البيانات",
    low_stock: "تنبيهات نقص المخزون",
    reorder: "قائمة إعادة الطلب",
    welcome: "مرحباً بك في نظام التسيير المتكامل",
    login: "دخول النظام",
    access_restricted: "الوصول مقيد • النظام المحلي",
    admin_pass: "كلمة مرور المدير",
    archive: "أرشيف الفواتير",
    reports: "التقارير الشهرية",
  },
  fr: {
    dashboard: "Analyses & Rapports",
    pos: "Point de Vente",
    stock: "Stock & Catégories",
    customers: "Clients",
    settings: "Paramètres",
    logout: "Déconnexion",
    active_engine: "Moteur_actif",
    local_data: "Données localement sécurisées",
    search: "Rechercher...",
    cart: "Panier Actif",
    pay: "Payer Maintenant",
    subtotal: "Sous-total",
    discount: "Remise",
    total: "Total Général",
    payment_method: "Mode de paiement",
    cash: "Espèces",
    card: "Carte",
    wallet: "Web",
    credit: "Crédit",
    add_product: "Ajouter Produit",
    categories_btn: "Catégories",
    stock_header: "Gestion de Stock",
    password_change: "Changer Mot de Passe",
    current_pass: "Mot de passe actuel",
    new_pass: "Nouveau mot de passe",
    save_pass: "Enregistrer",
    language: "Langue",
    appearance: "Apparence & Couleurs",
    shop_info: "Infos Boutique",
    shop_name: "Nom de la Boutique",
    shop_address: "Adresse de la Boutique",
    shop_phone: "Numéro de Téléphone",
    currency: "Devise",
    backup: "Sécurité & Données",
    export: "Exporter Backup",
    clear: "Effacer Tout",
    low_stock: "Rupture de Stock",
    reorder: "Liste de Réappro",
    welcome: "Bienvenue sur BOUTABSSIL",
    login: "Se Connecter",
    access_restricted: "Accès Restreint • Système Local",
    admin_pass: "Mot de passe Administrateur",
    archive: "Archive des Factures",
    reports: "Rapports Mensuels",
  },
  en: {
    dashboard: "Analytics & Reports",
    pos: "Point of Sale",
    stock: "Inventory",
    customers: "Customers",
    settings: "Settings",
    logout: "Logout",
    active_engine: "Active_engine",
    local_data: "Data secured locally",
    search: "Search...",
    cart: "Active Cart",
    pay: "Checkout Now",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Grand Total",
    payment_method: "Payment Method",
    cash: "Cash",
    card: "Card",
    wallet: "Web",
    credit: "Credit",
    add_product: "Add Product",
    categories_btn: "Categories",
    stock_header: "Stock Management",
    password_change: "Change Password",
    current_pass: "Current Password",
    new_pass: "New Password",
    save_pass: "Save Password",
    language: "Language",
    appearance: "Appearance & Colors",
    shop_info: "Shop Info",
    shop_name: "Shop Name",
    shop_address: "Shop Location / Address",
    shop_phone: "Shop Phone Number",
    currency: "Currency",
    backup: "Security & Backup",
    export: "Export Data",
    clear: "Wipe All Data",
    low_stock: "Low Stock Alerts",
    reorder: "Reorder List",
    welcome: "Welcome to BOUTABSSIL",
    login: "Login",
    access_restricted: "Restricted Access • Local System",
    admin_pass: "Admin Password",
    archive: "Invoices Archive",
    reports: "Monthly Reports",
  },
};

// --- Debt Status & Alert Helper ---
export function getDebtStatus(client: any, isRtl: boolean) {
  if (!client.debt || client.debt <= 0 || !client.dueDate) return null;
  const due = new Date(client.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      status: "overdue" as const,
      days: diffDays,
      label: isRtl
        ? `متأخر بـ ${absDays} يوم !`
        : `En retard de ${absDays} j !`,
      colorClass: "text-rose-600 bg-rose-50 border border-rose-100",
      badgeClass: "bg-rose-500 text-white font-black",
    };
  } else if (diffDays === 0) {
    return {
      status: "due_today" as const,
      days: 0,
      label: isRtl ? "يستحق اليوم !" : "Échéance Aujourd'hui !",
      colorClass:
        "text-amber-600 bg-amber-50 border border-amber-200 animate-pulse",
      badgeClass: "bg-amber-500 text-white font-black animate-pulse",
    };
  } else if (diffDays <= 3) {
    return {
      status: "near" as const,
      days: diffDays,
      label: isRtl
        ? `يستحق بعد ${diffDays} أيام`
        : `Échéance dans ${diffDays} j`,
      colorClass: "text-amber-600 bg-amber-50/50 border border-amber-200",
      badgeClass: "bg-amber-500/80 text-white font-black",
    };
  }
  return {
    status: "future" as const,
    days: diffDays,
    label: isRtl ? `متبقي ${diffDays} يوم` : `Reste ${diffDays} j`,
    colorClass: "text-slate-500 bg-slate-50 border border-slate-100",
    badgeClass: "bg-slate-400 text-white font-bold",
  };
}

export default function App() {
  const [appData, setAppData] = useState<AppData>(storage.getData());

  const lang = appData.settings?.language || "ar";
  const t = (key: string) => translations[lang]?.[key] || key;
  const isRtl = lang === "ar";

  const getInvoiceNumber = (saleId: string) => {
    if (!saleId) return "000001";
    if (saleId.startsWith("DRAFT-")) return "000000";
    const sorted = [...appData.sales].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const index = sorted.findIndex((s) => s.id === saleId);
    if (index === -1) {
      return String(appData.sales.length + 1).padStart(6, "0");
    }
    return String(index + 1).padStart(6, "0");
  };
  const [activeTab, setActiveTab] = useState<
    | "pos"
    | "stock"
    | "dashboard"
    | "users"
    | "settings"
    | "customers"
    | "archive"
  >("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const currentUser = appData.users?.find((u: any) => u.id === activeUserId) || null;
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Firebase auth & cloud sync state integration
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{type: 'success' | 'error' | 'info'; text: string} | null>(null);

  useEffect(() => {
    const unsubscribe = registerAuthListener((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleCloudBackup = async () => {
    if (!firebaseUser) return;
    setIsFirebaseLoading(true);
    setSyncStatus(null);
    try {
      await saveBackupToCloud(firebaseUser.uid, appData);
      setSyncStatus({
        type: "success",
        text: isRtl 
          ? "تم رفع النسخة الاحتياطية بنجاح إلى السحاب لـ Firebase!" 
          : "Backup successfully secured on Firebase Cloud!"
      });
    } catch (err: any) {
      setSyncStatus({
        type: "error",
        text: isRtl 
          ? "فشلت المزامنة: " + err.message 
          : "Sync failed: " + err.message
      });
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  const handleCloudRestore = async () => {
    if (!firebaseUser) return;
    if (!confirm(isRtl 
      ? "هل أنت متأكد؟ هذا الإجراء سيقوم باستبدال كافة البيانات المحلية بالنسخة السحابية المحددة!" 
      : "Are you sure? This will replace all your local data with the cloud database!")) return;
    setIsFirebaseLoading(true);
    setSyncStatus(null);
    try {
      const restored = await loadBackupFromCloud(firebaseUser.uid);
      if (restored) {
        setAppData(restored);
        setSyncStatus({
          type: "success",
          text: isRtl 
            ? "تمت استعادة وتحديث قاعدة كافة البيانات من السحاب بنجاح!" 
            : "Database successfully restored from Cloud backup!"
        });
      } else {
        setSyncStatus({
          type: "info",
          text: isRtl 
            ? "لم يتم العثور على أي نسخة احتياطية سحابية سابقة لرفعها." 
            : "No previous cloud backup found for this account."
        });
      }
    } catch (err: any) {
      setSyncStatus({
        type: "error",
        text: isRtl 
          ? "فشلت استعادة البيانات: " + err.message 
          : "Restore failed: " + err.message
      });
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  const handleFirebaseLogin = async () => {
    setIsFirebaseLoading(true);
    setSyncStatus(null);
    try {
      await signInWithGoogle();
      setSyncStatus({
        type: "success",
        text: isRtl 
          ? "تم تسجيل الدخول وربط السحاب بنجاح!" 
          : "Signed in and secure cloud connected successfully!"
      });
    } catch (err: any) {
      setSyncStatus({
        type: "error",
        text: isRtl ? "تفاصيل الخطأ: " + err.message : "Error: " + err.message
      });
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  const handleFirebaseLogout = async () => {
    setIsFirebaseLoading(true);
    setSyncStatus(null);
    try {
      await logoutFromFirebase();
      setSyncStatus({
        type: "info",
        text: isRtl 
          ? "تم فصل السحاب السحابي بنجاح." 
          : "Cloud synchronized backup disconnected successfully."
      });
    } catch (err: any) {
      setSyncStatus({
        type: "error",
        text: isRtl ? "فشل فصل السحاب: " + err.message : "Logout failed: " + err.message
      });
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  const lowStockProducts = useMemo(() => {
    return appData.products.filter((p) => p.qty <= (p.minQty || 5));
  }, [appData.products]);

  // Sync with local storage
  useEffect(() => {
    storage.saveData(appData);
  }, [appData]);

  // Inject Theme Styles
  useEffect(() => {
    const root = document.documentElement;
    const primary = appData.settings?.primaryColor || "#2563eb";
    const accent = appData.settings?.accentColor || "#10b981";

    root.style.setProperty("--primary", primary);
    root.style.setProperty("--primary-hover", primary + "dd");
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--primary-glow", primary + "0d");
  }, [appData.settings?.primaryColor, appData.settings?.accentColor]);

  const handleLogin = (username: string, pass: string) => {
    if (!username || !pass) {
      setLoginError(isRtl ? "يرجى إدخال اسم المستخدم وكلمة المرور" : "Please enter username and password");
      return;
    }
    
    const users = appData.users || [];
    const validUser = users.find(u => u.username === username && u.password === pass);

    if (validUser) {
      setIsAuthenticated(true);
      setActiveUserId(validUser.id);
      setLoginError(null);
      
      // Log activity
      storage.logActivity('STAFF', 'login', isRtl ? `تسجيل دخول: ${username}` : `Logged in: ${username}`, validUser.id, username);
    } else {
      setLoginError(isRtl ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveUserId(null);
  };

  if (!isAuthenticated) {
    return (
      <Login onLogin={handleLogin} error={loginError} t={t} isRtl={isRtl} />
    );
  }

  return (
    <MainLayout
      appData={appData}
      setAppData={setAppData}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      handleLogout={handleLogout}
      t={t}
      isRtl={isRtl}
      firebaseUser={firebaseUser}
      isFirebaseLoading={isFirebaseLoading}
      syncStatus={syncStatus}
      onBackup={handleCloudBackup}
      onRestore={handleCloudRestore}
      onLogin={handleFirebaseLogin}
      onLogout={handleFirebaseLogout}
      setSyncStatus={setSyncStatus}
      currentUser={currentUser}
    />
  );
}

// --- Views ---

// --- Views ---


function MainLayout({
  appData,
  setAppData,
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
  t,
  isRtl,
  firebaseUser,
  isFirebaseLoading,
  syncStatus,
  onBackup,
  onRestore,
  onLogin,
  onLogout,
  setSyncStatus,
  currentUser,
}: {
  appData: AppData;
  setAppData: any;
  activeTab: any;
  setActiveTab: any;
  isSidebarOpen: boolean;
  setIsSidebarOpen: any;
  handleLogout: any;
  t: any;
  isRtl: boolean;
  firebaseUser: any;
  isFirebaseLoading: boolean;
  syncStatus: any;
  onBackup: () => void;
  onRestore: () => void;
  onLogin: () => void;
  onLogout: () => void;
  setSyncStatus: any;
  currentUser?: any;
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsIframe(window.self !== window.top);
    }
  }, []);

  const lowStockProducts = useMemo(() => {
    return appData.products.filter((p) => p.qty <= (p.minQty || 5));
  }, [appData.products]);

  const debtAlertClients = useMemo(() => {
    return appData.clients.filter((c) => {
      const status = getDebtStatus(c, isRtl);
      return (
        status &&
        (status.status === "overdue" ||
          status.status === "due_today" ||
          status.status === "near")
      );
    });
  }, [appData.clients, isRtl]);

  const totalAlerts = lowStockProducts.length + debtAlertClients.length;

  return (
    <div
      className="relative flex h-screen overflow-hidden bg-slate-50 text-slate-800 z-0"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Background glowing paint-splashes representing 'daw' (electricity/light) and 'sbagha' (paint/colors) */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-amber-400/10 blur-[130px] pointer-events-none animate-pulse"
        style={{ animationDuration: "12s" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-sky-400/15 blur-[130px] pointer-events-none animate-pulse"
        style={{ animationDuration: "15s" }}
      />
      <div
        className="absolute top-[30%] right-[10%] w-[45%] h-[45%] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDuration: "14s" }}
      />

      {/* Structural Hardware Grid layout (Blueprint pattern) representing droguerie & measures */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35 pointer-events-none" />

      {/* Flowing electric lines overlay representing wiring & electrical cables (les fils) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 0 120 Q 250 180 500 120 T 1000 220 T 1500 120 T 2000 320"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="12 6"
        />
        <path
          d="M 120 0 Q 350 450 550 220 T 950 650 T 1350 450"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />
        <path
          d="M 0 520 Q 420 320 820 620 T 1620 420"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
      </svg>

      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        t={t}
        isRtl={isRtl}
        currentUser={currentUser}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          {isIframe && (
            <div className="mb-6 p-4 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-900 text-[11px] font-black flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div
                className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <span className="text-xl shrink-0">⚠️</span>
                <p className="leading-relaxed">
                  {isRtl
                    ? "تنبيه لتفادي مشاكل الطباعة: لحماية الصفحات من الظهور بيضاء أو فارغة بسبب حماية البيئة التجريبية للمعاينة، يرجى فتح التطبيق في نافذة مستقلة عبر النقر على الرابط أسفله:"
                    : "Avis d'impression : pour éviter les pages blanches causées par la sécurité de la prévisualisation dans l'Iframe, veuillez ouvrir l'application dans un onglet indépendant en cliquant sur le bouton :"}
                </p>
              </div>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <span>
                  {isRtl ? "فتح في نافذة كاملة جديدة" : "Ouvrir en plein écran"}
                </span>
              </a>
            </div>
          )}

          <header className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="rounded-2xl bg-white p-3 text-slate-800 border-2 border-slate-200 hover:bg-slate-50 transition-colors lg:hidden shadow-sm"
              >
                <Menu size={24} />
              </button>
              <div className={isRtl ? "text-right" : "text-left"}>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic">
                  {t(activeTab)}
                </h1>
                <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {t("active_engine")}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-slate-200" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {new Date().toLocaleDateString(isRtl ? "ar-MA" : "en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative rounded-2xl bg-white p-3.5 text-slate-700 border-2 border-slate-200 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none flex items-center justify-center cursor-pointer"
                >
                  <Bell
                    size={18}
                    className={
                      totalAlerts > 0
                        ? "text-amber-500 animate-[pulse_1.5s_infinite]"
                        : "text-slate-500"
                    }
                  />
                  {totalAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center border border-white shadow-sm">
                      {totalAlerts}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotificationOpen && (
                    <>
                      {/* Invisible backdrop to dismiss notifications */}
                      <div
                        className="fixed inset-0 z-[140]"
                        onClick={() => setIsNotificationOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className={`absolute ${isRtl ? "left-0" : "right-0"} mt-3 w-80 rounded-[32px] bg-white border border-slate-200 p-6 shadow-2xl z-[150] space-y-4 max-h-[500px] overflow-y-auto`}
                      >
                        {/* Stock Alerts section */}
                        <h4
                          className={`text-xs font-black uppercase tracking-widest text-slate-800 italic border-b border-slate-100 pb-3 flex items-center justify-between ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}
                        >
                          <span>
                            {isRtl ? "تنبيهات المخزون" : "Stock Alerts"}
                          </span>
                          <span className="text-[10px] text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full font-black">
                            {lowStockProducts.length}
                          </span>
                        </h4>
                        <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1.5 custom-scrollbar">
                          {lowStockProducts.map((p) => (
                            <div
                              key={p.id}
                              className={`flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-[11px] font-bold ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}
                            >
                              <span className="text-slate-800 font-extrabold truncate max-w-[150px]">
                                {p.name}
                              </span>
                              <span className="text-amber-700 font-black shrink-0">
                                {isRtl
                                  ? `باقي: ${p.qty} وحدة`
                                  : `${p.qty} left`}
                              </span>
                            </div>
                          ))}
                          {lowStockProducts.length === 0 && (
                            <p className="text-[10px] text-slate-400 text-center py-2 font-black italic">
                              {isRtl ? "المستويات كافية" : "All stocks good"}
                            </p>
                          )}
                        </div>

                        {/* Debt expiry section */}
                        <h4
                          className={`text-xs font-black uppercase tracking-widest text-slate-800 italic border-b border-t border-slate-100 pt-3 pb-3 flex items-center justify-between ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}
                        >
                          <span>
                            {isRtl ? "آجال استحقاق الديون" : "Debt Deadlines"}
                          </span>
                          <span className="text-[10px] text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full font-black">
                            {debtAlertClients.length}
                          </span>
                        </h4>
                        <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1.5 custom-scrollbar">
                          {debtAlertClients.map((c) => {
                            const status = getDebtStatus(c, isRtl);
                            return (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setActiveTab("customers");
                                  setIsNotificationOpen(false);
                                }}
                                className={`flex flex-col p-3 rounded-2xl cursor-pointer hover:brightness-95 transition-all ${status?.colorClass || "bg-slate-50"} ${isRtl ? "text-right" : "text-left"}`}
                              >
                                <div
                                  className={`flex items-center justify-between text-[11px] font-black ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                                >
                                  <span className="truncate max-w-[124px] text-slate-800">
                                    {c.name}
                                  </span>
                                  <span className="shrink-0 text-red-600 font-extrabold">
                                    {c.debt.toFixed(2)} DH
                                  </span>
                                </div>
                                <div
                                  className={`flex items-center gap-1.5 mt-1 text-[9px] font-black uppercase tracking-wider ${isRtl ? "flex-row-reverse" : "flex-row"} text-slate-500`}
                                >
                                  <Clock
                                    size={10}
                                    className="shrink-0 text-slate-400"
                                  />
                                  <span>{status?.label}</span>
                                </div>
                              </div>
                            );
                          })}
                          {debtAlertClients.length === 0 && (
                            <p className="text-[10px] text-slate-400 text-center py-2 font-black italic">
                              {isRtl
                                ? "لا توجد ديون مستحقة قريباً"
                                : "No credit alerts"}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-primary/10 px-6 py-3 border-2 border-primary/20 shadow-sm text-primary">
                <ShieldCheck size={16} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {t("local_data")}
                </span>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === "pos" && (
              <POSView
                key="pos"
                appData={appData}
                setAppData={setAppData}
                t={t}
                isRtl={isRtl}
                currentUser={currentUser}
              />
            )}
            {activeTab === "stock" && (
              <GamraStockView
                key="stock"
                appData={appData}
                setAppData={setAppData}
                t={t}
                language={isRtl ? 'ar' : 'fr'}
                permissions={currentUser?.permissions || {}}
              />
            )}
            {activeTab === "customers" && (
              <ClientsView
                key="customers"
                appData={appData}
                setAppData={setAppData}
                t={t}
                isRtl={isRtl}
                currentUser={currentUser}
              />
            )}
            {activeTab === "dashboard" && (
              <DashboardView
                key="dashboard"
                appData={appData}
                setAppData={setAppData}
                t={t}
                isRtl={isRtl}
                currentUser={currentUser}
              />
            )}
            {activeTab === "archive" && (
              <ArchiveView
                key="archive"
                appData={appData}
                setAppData={setAppData}
                t={t}
                isRtl={isRtl}
                currentUser={currentUser}
              />
            )}
            {activeTab === "staff" && currentUser && (
              <StaffManagementView
                key="staff"
                currentUser={currentUser}
                onRefresh={() => setAppData(storage.getData())}
                isRtl={isRtl}
                t={t}
              />
            )}
            {activeTab === "logs" && currentUser && (
              <ActivityLogView
                key="logs"
                isRtl={isRtl}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationsView
                key="notifications"
                isRtl={isRtl}
              />
            )}
            {activeTab === "settings" && (
              <SettingsView
                key="settings"
                appData={appData}
                setAppData={setAppData}
                t={t}
                isRtl={isRtl}
                firebaseUser={firebaseUser}
                isFirebaseLoading={isFirebaseLoading}
                syncStatus={syncStatus}
                onBackup={onBackup}
                onRestore={onRestore}
                onLogin={onLogin}
                onLogout={onLogout}
                setSyncStatus={setSyncStatus}
                currentUser={currentUser}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export function POSView({
  appData,
  setAppData,
  t,
  isRtl,
  currentUser,
}: {
  appData: AppData;
  setAppData: any;
  t: any;
  isRtl: boolean;
  currentUser?: any;
}) {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t("all") || "الكل");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "wallet" | "credit"
  >("cash");
  const [discount, setDiscount] = useState(0);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [printingCart, setPrintingCart] = useState<Sale | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Sale | null>(null);

  // States for linking client/customer to checkout and quick-add customer modal
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [showQuickAddClientModal, setShowQuickAddClientModal] = useState(false);
  const [quickClient, setQuickClient] = useState({
    name: "",
    phone: "",
    address: "",
    dueDate: "",
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const product = appData.products.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setBarcode("");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = Math.max(0, total - discount);

  const handlePay = () => {
    if (cart.length === 0) return;
    if (paymentMethod === "credit" && !selectedClientId) return;
    setIsProcessing(true);

    setTimeout(() => {
      const sale: Sale = {
        id: Math.random().toString(36).substr(2, 9),
        total,
        discount,
        finalTotal,
        paymentMethod,
        clientId: selectedClientId || undefined,
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
          costPrice: item.costPrice || 0,
        })),
        date: new Date().toISOString(),
        userId: "admin",
      };

      setAppData((prev: AppData) => {
        const updatedProducts = prev.products.map((p) => {
          const cartItem = cart.find((item) => item.id === p.id);
          if (cartItem) {
            return { ...p, qty: p.qty - cartItem.quantity };
          }
          return p;
        });

        let updatedClients = prev.clients;
        if (paymentMethod === "credit" && selectedClientId) {
          updatedClients = prev.clients.map((c) => {
            if (c.id === selectedClientId) {
              const currentDebt = Number(c.debt) || 0;
              return {
                ...c,
                debt: currentDebt + finalTotal,
                paymentHistory: [
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    amount: -finalTotal,
                    date: new Date().toISOString(),
                    method: isRtl ? "شراء بالكريدي" : "Credit Purchase",
                  },
                  ...(c.paymentHistory || []),
                ],
              };
            }
            return c;
          });
        }

        return {
          ...prev,
          sales: [sale, ...prev.sales],
          products: updatedProducts,
          clients: updatedClients,
        };
      });

      setLastSale(sale);
      setCart([]);
      setDiscount(0);
      setSelectedClientId("");
      setIsInvoiceModalOpen(true);
      setIsProcessing(false);

      // Auto-trigger printing on successful sale confirmation!
      setPrintingInvoice(sale);
      setTimeout(() => {
        window.focus();
        window.print();
        // Clear after a generous 15 seconds to allow full compilation of pages in all browser devices
        setTimeout(() => {
          setPrintingInvoice((prev) => (prev?.id === sale.id ? null : prev));
        }, 15000);
      }, 600); // Give React 600ms to render the print portal fully to the DOM
    }, 500);
  };

  const handlePrint = () => {
    if (!lastSale) return;
    setPrintingInvoice(lastSale);
    setTimeout(() => {
      window.focus();
      window.print();
      setTimeout(() => {
        setPrintingInvoice((prev) => (prev?.id === lastSale.id ? null : prev));
      }, 15000);
    }, 500);
  };

  const handlePrintCart = () => {
    if (cart.length === 0) return;
    const draftSale: Sale = {
      id: "DRAFT-" + Math.random().toString(36).substr(2, 4),
      total,
      discount,
      finalTotal,
      paymentMethod,
      items: cart,
      date: new Date().toISOString(),
      userId: "admin",
    };
    setPrintingCart(draftSale);
    setTimeout(() => {
      window.focus();
      window.print();
      setTimeout(() => {
        setPrintingCart((prev) => (prev?.id === draftSale.id ? null : prev));
      }, 15000);
    }, 500);
  };

  const filteredProducts = appData.products.filter((p) => {
    const nameToSearch = p.name ? p.name.toLowerCase() : "";
    const barcodeToSearch = p.barcode ? p.barcode : "";
    const matchesSearch =
      nameToSearch.includes(searchTerm.toLowerCase()) ||
      barcodeToSearch.includes(searchTerm);
    if (
      selectedCategory === "الكل" ||
      selectedCategory === "All" ||
      selectedCategory === "Tous"
    )
      return matchesSearch;
    return matchesSearch && p.category === selectedCategory;
  });

  const categories = [
    appData.settings.language === "ar"
      ? "الكل"
      : appData.settings.language === "fr"
        ? "Tous"
        : "All",
    ...appData.categories.map((c) => c.name),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-180px)] overflow-hidden"
    >
      {/* Hidden Printable Invoice */}
      {(printingCart || printingInvoice) &&
        createPortal(
          <div className="printable-only">
            <PrintableInvoice
              sale={(printingCart || printingInvoice)!}
              t={t}
              isRtl={isRtl}
              clients={appData.clients}
              settings={appData.settings}
              salesList={appData.sales}
            />
          </div>,
          document.body,
        )}

      {/* Invoice Modal */}
      <AnimatePresence>
        {isInvoiceModalOpen && lastSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-[32px] bg-white p-10 shadow-2xl border border-slate-200"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <div
                    className={`flex items-center gap-2 mb-1 ${isRtl ? "flex-row" : "flex-row-reverse justify-end"}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">
                      {t("order_confirmed") ||
                        (isRtl ? "تم البيع بنجاح" : "Order Confirmed")}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="rounded-2xl bg-slate-100 p-3 text-slate-400 hover:bg-slate-200 transition-colors"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <div className="mb-10 rounded-[24px] bg-primary p-8 text-center text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
                <div className="relative z-10 text-center">
                  <h4 className="text-4xl font-black italic tracking-tighter mb-2">
                    {lastSale.finalTotal.toFixed(2)} DH
                  </h4>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                    {lastSale.paymentMethod === "cash"
                      ? t("cash")
                      : lastSale.paymentMethod === "card"
                        ? t("card")
                        : lastSale.paymentMethod === "credit"
                          ? isRtl
                            ? "كريدي (دين)"
                            : "Credit (Debt)"
                          : t("wallet")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="flex items-center justify-center gap-3 rounded-2xl bg-primary py-6 text-sm font-black text-white hover:brightness-110 shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] cursor-pointer"
                >
                  {isRtl ? "بدء جلسة جديدة" : "New Session"}
                  <ChevronRight
                    size={20}
                    strokeWidth={3}
                    className={isRtl ? "rotate-180" : ""}
                  />
                </button>

                {/* Subtle trigger in case they need to reprint */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer transition-colors"
                >
                  <Printer size={14} />
                  <span>
                    {isRtl ? "إعادة طباعة الفاتورة" : "Reprint Receipt"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Terminal Area */}
      <div className="lg:w-2/3 flex flex-col gap-6 overflow-hidden">
        {/* Navigation & Search Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <form
              onSubmit={handleBarcodeSearch}
              className="flex-1 relative group"
            >
              <div
                className={`absolute ${isRtl ? "right-5" : "left-5"} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors`}
              >
                <CreditCard size={20} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder={
                  isRtl ? "الماسح الضوئي نشط..." : "Barcode scanner ready..."
                }
                className={`w-full rounded-2xl bg-white border-2 border-slate-200 py-4 ${isRtl ? "pr-14 pl-6" : "pl-14 pr-6"} text-sm font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all placeholder-slate-400 text-slate-800 shadow-sm`}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                autoFocus
              />
            </form>
            <div className="hidden sm:flex items-center gap-2 bg-white px-5 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest whitespace-nowrap shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              {isRtl ? "الجهاز متصل" : "Scanner Engaged"}
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20 border-2 border-primary"
                    : "bg-white border-2 border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Selection Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-8 custom-scrollbar">
          {filteredProducts.map((p) => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(p)}
              className="group flex flex-col items-center justify-center aspect-square rounded-[32px] bg-white border border-slate-200 p-6 text-center transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 active:bg-primary/5 shadow-sm"
            >
              <div className="mb-4 h-16 w-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all group-hover:rotate-6 shadow-sm border border-slate-100">
                <Package size={32} strokeWidth={2.5} />
              </div>
              <h3 className="line-clamp-2 text-xs font-black text-slate-800 mb-2 px-1 uppercase leading-tight tracking-tight min-h-[32px]">
                {p.name}
              </h3>
              <div className="mt-auto px-4 py-1.5 rounded-full bg-primary text-white text-[11px] font-black shadow-lg">
                {p.price.toFixed(2)}{" "}
                <span className="text-[8px] opacity-60">DH</span>
              </div>
              {p.qty < 5 && (
                <div
                  className="absolute top-4 right-4 h-2 w-2 rounded-full bg-red-500 animate-ping"
                  title="Critical Stock"
                />
              )}
            </motion.button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="mb-4 flex justify-center opacity-20">
                <Search size={80} strokeWidth={1} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
                {isRtl ? "لم يتم العثور على منتجات" : "No products found"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Sidebar */}
      <div className="lg:w-1/3 flex flex-col h-full">
        <div className="flex-1 rounded-[40px] bg-white shadow-2xl overflow-hidden flex flex-col border border-slate-200 relative">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingCart size={22} strokeWidth={3} />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">
                  {isRtl ? "السلة النشطة" : "Active Cart"}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {cart.length} {isRtl ? "مواد" : "items"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintCart}
                disabled={cart.length === 0}
                className="text-slate-400 hover:text-primary transition-colors p-2 disabled:opacity-20"
                title="طباعة المسودة"
              >
                <Printer size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setCart([])}
                className="text-slate-400 hover:text-red-500 transition-colors p-2"
                title={isRtl ? "تفريغ السلة" : "Empty Cart"}
              >
                <Trash2 size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Ticket Items */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-300 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div
                  className={`flex-1 min-w-0 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate leading-tight mb-1">
                    {item.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400">
                    @{item.price.toFixed(2)} DH
                  </p>
                </div>
                <div
                  className={`flex flex-col ${isRtl ? "items-end" : "items-start"} gap-2 text-right`}
                >
                  <p className="text-sm font-black text-slate-900 tracking-widest">
                    {(item.price * item.quantity).toFixed(2)} DH
                  </p>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Minus size={14} strokeWidth={4} />
                    </button>
                    <span className="text-[11px] font-black text-slate-800 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110"
                    >
                      <Plus size={14} strokeWidth={4} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center py-12">
                <ShoppingBag
                  size={80}
                  strokeWidth={1}
                  className="mb-6 opacity-40 text-slate-400 animate-pulse"
                />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  {isRtl ? "لا توجد عمليات" : "Cart is Empty"}
                </p>
                <p className="text-[8px] font-bold mt-2 uppercase tracking-widest text-slate-400/80">
                  {isRtl
                    ? "في انتظار إدخال العميل"
                    : "Waiting for scanned items"}
                </p>
              </div>
            )}
          </div>

          {/* Checkout Footer */}
          <div className="p-8 bg-slate-50/50 border-t border-slate-200">
            {/* Customer Linker (Zaba2in relation) */}
            <div className="mb-6 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div
                className={`flex items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  {isRtl ? "ربط السلة بزبون" : "Assign Customer"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickAddClientModal(true)}
                  className="text-[10px] font-black uppercase text-primary hover:underline hover:brightness-110 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} strokeWidth={3} />
                  {isRtl ? "زبون جديد (+)" : "Quick New (+)"}
                </button>
              </div>

              <div className="relative">
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setSelectedClientId(cid);
                    if (cid) {
                      setPaymentMethod("credit");
                    } else {
                      setPaymentMethod("cash");
                    }
                  }}
                  className="w-full h-12 px-4 pr-10 rounded-2xl bg-slate-50/50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-primary/40 focus:bg-white tracking-wide transition-all appearance-none cursor-pointer"
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  <option value="">
                    {isRtl
                      ? "-- حساب زبون مكرر (اختياري) --"
                      : "-- Choose Customer (Optional) --"}
                  </option>
                  {appData.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.phone ? `(${client.phone})` : ""}{" "}
                      {client.debt > 0
                        ? ` [Kridi: ${client.debt.toFixed(1)} DH]`
                        : ""}
                    </option>
                  ))}
                </select>
                <div
                  className={`absolute ${isRtl ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 pointer-events-none text-slate-400`}
                >
                  <User size={14} />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 flex bg-slate-100/50 p-1 shadow-inner">
              {[
                { id: "cash", icon: Banknote, label: isRtl ? "نقداً" : "Cash" },
                {
                  id: "card",
                  icon: CreditCard,
                  label: isRtl ? "بطاقة" : "Card",
                },
                {
                  id: "credit",
                  icon: UserPlus,
                  label: isRtl ? "كريدي" : "Credit",
                },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex-1 flex flex-col items-center justify-center py-3.5 gap-1 transition-all rounded-xl cursor-pointer ${
                    paymentMethod === method.id
                      ? "bg-primary text-white shadow-xl shadow-primary/30 font-black scale-[1.02]"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <method.icon size={16} strokeWidth={3} />
                  <span className="text-[8px] font-black tracking-widest uppercase leading-none">
                    {method.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Credit Pre-Checkout confirmation */}
            {paymentMethod === "credit" &&
              selectedClientId &&
              (() => {
                const selectedClientObj = appData.clients.find(
                  (c) => c.id === selectedClientId,
                );
                if (!selectedClientObj) return null;
                return (
                  <div
                    className={`mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-700 text-[10px] font-black uppercase tracking-wider ${isRtl ? "flex-row-reverse text-right" : ""}`}
                  >
                    <User
                      size={16}
                      strokeWidth={3}
                      className="shrink-0 animate-pulse text-amber-600"
                    />
                    <span>
                      {isRtl
                        ? `سيتم تسجيل مبلغ +${finalTotal.toFixed(2)} DH ديونً على حساب الزبون ( ${selectedClientObj.name} )`
                        : `Will record +${finalTotal.toFixed(2)} DH credit debt on account for (${selectedClientObj.name})`}
                    </span>
                  </div>
                );
              })()}

            {/* Block Credit Checkouts that lack Customer Link */}
            {paymentMethod === "credit" && !selectedClientId && (
              <div
                className={`mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 animate-pulse text-[10px] font-black uppercase tracking-wider ${isRtl ? "flex-row-reverse text-right" : ""}`}
              >
                <AlertCircle size={16} strokeWidth={3} className="shrink-0" />
                <span>
                  {isRtl
                    ? "يجب اختيار زبون لتسجيل الكريدي في الحساب!"
                    : "Attach a customer to register credit debt!"}
                </span>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">
                <span>{t("subtotal")}</span>
                <span className="text-slate-800 font-extrabold">
                  {total.toFixed(2)} DH
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-black text-red-500 uppercase tracking-widest leading-none">
                <span>{t("discount")}</span>
                <div className="flex items-center gap-2">
                  <Minus size={10} strokeWidth={4} />
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    className="w-20 bg-transparent border-b-2 border-slate-200 text-slate-800 text-right outline-none font-black focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mb-2">
                    {t("discount") === "discount" ? "Grand Total" : t("total")}
                  </h3>
                  <p className="text-3xl font-black text-slate-950 tracking-tighter leading-none">
                    {finalTotal.toFixed(2)}{" "}
                    <span className="text-xs opacity-40">DH</span>
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                  <CreditCard size={24} strokeWidth={3} />
                </div>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={
                cart.length === 0 ||
                isProcessing ||
                (paymentMethod === "credit" && !selectedClientId)
              }
              className={`w-full py-6 rounded-[28px] text-sm font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group active:scale-95 cursor-pointer ${
                cart.length === 0 ||
                isProcessing ||
                (paymentMethod === "credit" && !selectedClientId)
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-primary text-white hover:brightness-110 shadow-2xl shadow-primary/30"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>...</span>
                </div>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {t("pay")}
                  <ChevronRight
                    size={18}
                    strokeWidth={3}
                    className={`group-hover:-translate-x-1 transition-transform ${isRtl ? "rotate-180" : ""}`}
                  />
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-slate-400 font-bold text-[9px] uppercase tracking-[0.4em]">
          <span>© BOUTABSSIL SYSTEM</span>
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <span>Secured Terminal</span>
        </div>
      </div>

      {/* Quick Add Client Modal (Zaba2in creation) */}
      <AnimatePresence>
        {showQuickAddClientModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!quickClient.name) return;
                const newId = Math.random().toString(36).substr(2, 9);
                const client: Client = {
                  id: newId,
                  name: quickClient.name,
                  phone: quickClient.phone,
                  address: quickClient.address,
                  debt: 0,
                  paymentHistory: [],
                  createdAt: new Date().toISOString(),
                  dueDate: quickClient.dueDate || undefined,
                };
                setAppData((prev: AppData) => ({
                  ...prev,
                  clients: [client, ...prev.clients],
                }));
                setSelectedClientId(newId);
                setShowQuickAddClientModal(false);
                setQuickClient({
                  name: "",
                  phone: "",
                  address: "",
                  dueDate: "",
                });
              }}
              className="w-full max-w-md bg-white rounded-[40px] p-10 border border-slate-200 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-800 italic tracking-tighter uppercase">
                  {isRtl ? "إضافة زبون سريع" : "Quick Add Customer"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowQuickAddClientModal(false)}
                  className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 mb-8">
                <div
                  className={`space-y-1 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">
                    {isRtl ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <input
                    required
                    placeholder={isRtl ? "مثال: أحمد الوجدي" : "e.g. John Doe"}
                    type="text"
                    value={quickClient.name}
                    onChange={(e) =>
                      setQuickClient({ ...quickClient, name: e.target.value })
                    }
                    className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-xs font-black text-slate-800 outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-1 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">
                    {isRtl ? "رقم الهاتف" : "Phone"}
                  </label>
                  <input
                    placeholder="06..."
                    type="text"
                    value={quickClient.phone}
                    onChange={(e) =>
                      setQuickClient({ ...quickClient, phone: e.target.value })
                    }
                    className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-xs font-black text-slate-800 outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-1 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">
                    {isRtl ? "العنوان" : "Address"}
                  </label>
                  <textarea
                    placeholder={isRtl ? "العنوان الاختياري..." : "Address..."}
                    value={quickClient.address}
                    onChange={(e) =>
                      setQuickClient({
                        ...quickClient,
                        address: e.target.value,
                      })
                    }
                    className="w-full h-16 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-black text-slate-800 outline-none focus:border-primary/50 resize-none"
                  />
                </div>
                <div
                  className={`space-y-1 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">
                    {isRtl
                      ? "أجل استحقاق المديونية (اختياري)"
                      : "Debt Due Date (Optional)"}
                  </label>
                  <input
                    type="date"
                    value={quickClient.dueDate}
                    onChange={(e) =>
                      setQuickClient({
                        ...quickClient,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-xs font-black text-slate-800 outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98]"
              >
                {isRtl ? "حفظ واختيار تلقائي" : "Save & Select"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SettingsView({
  appData,
  setAppData,
  t,
  isRtl,
  firebaseUser,
  isFirebaseLoading,
  syncStatus,
  onBackup,
  onRestore,
  onLogin,
  onLogout,
  setSyncStatus,
  currentUser,
}: {
  appData: AppData;
  setAppData: any;
  t: any;
  isRtl: boolean;
  firebaseUser: any;
  isFirebaseLoading: boolean;
  syncStatus: any;
  onBackup: () => void;
  onRestore: () => void;
  onLogin: () => void;
  onLogout: () => void;
  setSyncStatus: any;
  currentUser?: any;
}) {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passMsg, setPassMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const updateSettings = (key: string, value: any) => {
    setAppData((prev: AppData) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  };

  const handlePassChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPass !== appData.user.password) {
      setPassMsg({
        type: "error",
        text: isRtl
          ? "كلمة المرور الحالية خاطئة"
          : "Current password incorrect",
      });
      return;
    }
    if (newPass.length < 4) {
      setPassMsg({
        type: "error",
        text: isRtl ? "كلمة المرور قصيرة جداً" : "Password too short",
      });
      return;
    }
    setAppData((prev: AppData) => ({
      ...prev,
      user: { ...prev.user, password: newPass },
    }));
    setPassMsg({
      type: "success",
      text: isRtl ? "تم تغيير كلمة المرور" : "Password changed",
    });
    setCurrentPass("");
    setNewPass("");
  };

  const colors = [
    { name: "Default Blue", primary: "#2563eb", accent: "#10b981" },
    { name: "Royal Purple", primary: "#7c3aed", accent: "#f43f5e" },
    { name: "Emerald", primary: "#059669", accent: "#8b5cf6" },
    { name: "Sunset Orange", primary: "#ea580c", accent: "#3b82f6" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      {/* Shop Info & Language */}
      <div className="premium-card">
        <div
          className={`flex items-center gap-4 mb-10 ${isRtl ? "flex-row" : "flex-row"}`}
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Globe size={28} />
          </div>
          <div className={isRtl ? "text-right" : "text-left"}>
            <h3 className="text-2xl font-black text-slate-800 italic tracking-tight">
              {t("shop_info")}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
              General app settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 italic">
              {t("shop_name")}
            </label>
            <input
              type="text"
              value={appData.settings.shopName}
              onChange={(e) => updateSettings("shopName", e.target.value)}
              className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 italic">
              {t("language")}
            </label>
            <div className="flex gap-2">
              {["ar", "fr", "en"].map((l) => (
                <button
                  key={l}
                  onClick={() => updateSettings("language", l)}
                  className={`flex-1 h-16 rounded-[20px] font-black uppercase tracking-widest text-xs transition-all ${
                    appData.settings.language === l
                      ? "bg-primary text-white shadow-lg"
                      : "bg-slate-50 border border-slate-200 text-slate-400"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 italic">
              {t("shop_address")}
            </label>
            <input
              type="text"
              placeholder={isRtl ? "مثال: الدار البيضاء، المغرب" : "e.g. Casablanca, Morocco"}
              value={appData.settings.shopAddress || ""}
              onChange={(e) => updateSettings("shopAddress", e.target.value)}
              className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 italic">
              {t("shop_phone")}
            </label>
            <input
              type="text"
              placeholder={isRtl ? "مثال: 212600000000+" : "e.g. +212 600-000000"}
              value={appData.settings.shopPhone || ""}
              onChange={(e) => updateSettings("shopPhone", e.target.value)}
              className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="premium-card">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Key size={28} />
          </div>
          <div className={isRtl ? "text-right" : "text-left"}>
            <h3 className="text-2xl font-black text-slate-800 italic tracking-tight">
              {t("password_change")}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
              Admin protection
            </p>
          </div>
        </div>

        <form onSubmit={handlePassChange} className="space-y-6">
          {passMsg && (
            <div
              className={`p-4 rounded-xl text-xs font-black uppercase ${passMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
            >
              {passMsg.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="password"
              placeholder={t("current_pass")}
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary transition-all text-center"
            />
            <input
              type="password"
              placeholder={t("new_pass")}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary transition-all text-center"
            />
          </div>
          <button
            type="submit"
            className="w-full py-5 rounded-[20px] bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
          >
            {t("save_pass")}
          </button>
        </form>
      </div>

      {/* Backup & Recovery */}
      <div className="premium-card border-red-200">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 border border-red-200">
            <ShieldCheck size={28} />
          </div>
          <div className={isRtl ? "text-right" : "text-left"}>
            <h3 className="text-2xl font-black text-slate-800 italic tracking-tight">
              {t("backup")}
            </h3>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mt-1">
              Local database controls
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            className="px-8 py-5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm"
            onClick={() => {
              const blob = new Blob([JSON.stringify(appData, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `pos-backup-${new Date().toISOString().split("T")[0]}.json`;
              a.click();
            }}
          >
            <Download size={18} />
            {t("export")}
          </button>

          <button
            className="px-8 py-5 rounded-2xl bg-red-50 border border-red-200 text-red-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center gap-3 shadow-sm"
            onClick={() => {
              if (confirm("هل أنت متأكد؟ سيتم مسح جميع البيانات نهائياً!")) {
                localStorage.removeItem("POS_LOCAL_DATA");
                window.location.reload();
              }
            }}
          >
            <Trash2 size={18} />
            {t("clear")}
          </button>
        </div>
      </div>

      {/* Cloud Databases & Firebase Synchronization */}
      <div className="premium-card border-violet-200">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-14 w-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 border border-violet-200">
            <Zap size={28} />
          </div>
          <div className={isRtl ? "text-right" : "text-left"}>
            <h3 className="text-2xl font-black text-slate-800 italic tracking-tight">
              {isRtl ? "المزامنة والنسخ السحابي (Firebase Sync)" : "Cloud Databases Sync"}
            </h3>
            <p className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em] mt-1">
              {isRtl ? "حماية وتأمين كامل لبيانات المحل" : "Full permanent database safety"}
            </p>
          </div>
        </div>

        {syncStatus && (
          <div className={`p-5 rounded-2xl text-xs font-black mb-8 border transition-all ${
            syncStatus.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : syncStatus.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-current animate-ping" />
              {syncStatus.text}
            </div>
          </div>
        )}

        {isFirebaseLoading ? (
          <div className="py-8 text-center text-xs font-black uppercase tracking-widest text-violet-600 animate-pulse">
            {isRtl ? "جاري الاتصال بقاعدة البيانات السحابية..." : "Communicating with Firebase cloud..."}
          </div>
        ) : !firebaseUser ? (
          <div className="space-y-6">
            <p className={`text-xs font-bold text-slate-500 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
              {isRtl 
                ? "بيانات متجرك مخزنة حالياً في المتصفح فقط. في حال قمت بمسح ذاكرة التخزين المؤقت، ستفقد سلعك ومبيعاتك وديون زبنائك. قم بربط النظام بحسابك السحابي لحماية تامة ومزامنة مبيعاتك حياً!"
                : "Your shop is running offline. Clearing your browser cache will erase all items, client credits, and history. Connect to secure Firebase cloud to sync and safeguard your business in real-time."}
            </p>
            <button
              onClick={onLogin}
              className="w-full px-8 py-5 rounded-2xl bg-violet-600 text-white font-black text-xs uppercase tracking-widest hover:bg-violet-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-violet-600/10 cursor-pointer"
            >
              <Users size={18} />
              {isRtl ? "تفعيل المزامنة وربط حساب Google" : "Activate cloud sync & Google login"}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className={`flex items-center gap-4 p-5 rounded-[24px] bg-violet-50/50 border border-violet-100 ${isRtl ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
              {firebaseUser.photoURL ? (
                <img referrerPolicy="no-referrer" src={firebaseUser.photoURL} alt="User" className="h-14 w-14 rounded-full border-2 border-violet-500" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-violet-200 border-2 border-violet-500 flex items-center justify-center text-violet-800 font-black">
                  {firebaseUser.displayName?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-black text-slate-800">{firebaseUser.displayName}</p>
                <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">{firebaseUser.email}</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 mt-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isRtl ? "نسخ احتياطي نشط وآمن" : "Secure Cloud Active"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={onBackup}
                className="px-6 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Upload size={18} />
                {isRtl ? "رفع وحفظ البيانات سحابياً" : "Sync & Upload to Cloud"}
              </button>

              <button
                onClick={onRestore}
                className="px-6 py-5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Download size={18} />
                {isRtl ? "استرجاع البيانات من السحاب" : "Restore from Cloud"}
              </button>
            </div>

            <div className="border-t border-slate-100 pt-6 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <span>{isRtl ? "محمي بواسطة تكنولوجيا Firebase" : "Secured by Firebase cloud engine"}</span>
              <button onClick={onLogout} className="text-red-500 hover:underline cursor-pointer">
                {isRtl ? "فصل الحساب" : "Disconnect Cloud"}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- Printable Invoice Component ---
export function PrintableInvoice({
  sale,
  t,
  isRtl,
  clients,
  settings,
  salesList = [],
}: {
  sale: Sale;
  t: any;
  isRtl: boolean;
  clients: Client[];
  settings: any;
  salesList?: any[];
}) {
  const client = sale.clientId
    ? clients.find((c) => c.id === sale.clientId)
    : null;

  const getInvoiceNumber = (saleId: string) => {
    if (!saleId) return "000001";
    if (saleId.startsWith("DRAFT-")) return "000000";
    const sorted = [...salesList].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const index = sorted.findIndex((s) => s.id === saleId);
    if (index === -1) {
      return String(salesList.length + 1).padStart(6, "0");
    }
    return String(index + 1).padStart(6, "0");
  };

  let paymentStr = "";
  if (sale.paymentMethod === "cash") {
    paymentStr = isRtl ? "نقداً (كاش)" : "Cash";
  } else if (sale.paymentMethod === "card") {
    paymentStr = isRtl ? "بطاقة بنكية" : "Bank Card";
  } else if (sale.paymentMethod === "wallet") {
    paymentStr = isRtl ? "محفظة مادية" : "Digital Wallet";
  } else if (sale.paymentMethod === "credit") {
    paymentStr = isRtl ? "كريدي (ديون)" : "Credit (Debt)";
  } else {
    paymentStr = String(sale.paymentMethod || "");
  }

  return (
    <div
      className="p-4 sm:p-6 font-sans text-xs max-w-[380px] mx-auto bg-white text-black border border-dashed border-slate-300 print:border-none print:p-2 print:max-w-full print:w-full print:mx-0 print:shadow-none"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-2xl font-black tracking-tighter uppercase italic">
          {settings?.shopName || "BOUTABSSIL"}
        </h1>
        <p className="text-[11px] font-bold">
          {settings?.shopAddress || "Casablanca, Morocco"}
        </p>
        {settings?.shopPhone && (
          <p className="text-[11px] font-bold">
            {isRtl ? "الهاتف: " : "Phone: "}{settings.shopPhone}
          </p>
        )}
      </div>

      <div
        className={`border-y border-black py-4 mb-8 space-y-2 text-[11px] font-bold ${isRtl ? "text-right" : "text-left"}`}
      >
        <div className="flex justify-between">
          <span>{isRtl ? "رقم العملية:" : "Order ID:"}</span>
          <span className="font-black font-mono">
            {getInvoiceNumber(sale.id)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{isRtl ? "التاريخ:" : "Date:"}</span>
          <span>
            {new Date(sale.date).toLocaleString(isRtl ? "ar-MA" : "en-US")}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{isRtl ? "طريقة الدفع:" : "Payment:"}</span>
          <span className="font-black underline">{paymentStr}</span>
        </div>
        {client && (
          <div className="flex justify-between border-t border-dashed border-slate-300 pt-2 mt-2">
            <span>{isRtl ? "الزبون:" : "Customer:"}</span>
            <span className="font-black">{client.name}</span>
          </div>
        )}
        {client && client.phone && (
          <div className="flex justify-between">
            <span>{isRtl ? "الهاتف:" : "Phone:"}</span>
            <span>{client.phone}</span>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-10">
        <div
          className={`grid grid-cols-5 font-black border-b border-black pb-2 text-[10px] ${isRtl ? "text-right" : "text-left"}`}
        >
          <span className="col-span-2">{isRtl ? "المنتج" : "Product"}</span>
          <span className="text-center">{isRtl ? "الكمية" : "Qty"}</span>
          <span className={`${isRtl ? "text-left" : "text-right"} col-span-2`}>
            {isRtl ? "الثمن" : "Price"}
          </span>
        </div>
        {sale.items.map((item, idx) => (
          <div
            key={item.productId || idx}
            className={`grid grid-cols-5 text-[11px] font-bold ${isRtl ? "text-right" : "text-left"}`}
          >
            <span className="col-span-2 truncate">{item.name}</span>
            <span className="text-center">x{item.qty}</span>
            <span
              className={`${isRtl ? "text-left" : "text-right"} col-span-2`}
            >
              {(item.price * (item.qty || 0)).toFixed(2)} DH
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-black pt-6 space-y-3">
        <div className="flex justify-between text-xs font-bold">
          <span>{t("subtotal")}</span>
          <span>{sale.total.toFixed(2)} DH</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-xs font-bold text-red-600">
            <span>{t("discount")}</span>
            <span>-{sale.discount.toFixed(2)} DH</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-black border-t border-black pt-3">
          <span>{t("total")}</span>
          <span>{sale.finalTotal.toFixed(2)} DH</span>
        </div>
        {sale.paymentMethod === "credit" && client && (
          <div className="flex justify-between text-xs font-black border-t border-dashed border-red-200 text-red-600 pt-2 mt-2">
            <span>
              {isRtl ? "مجموع الكريدي الحالي:" : "Current Client Debt:"}
            </span>
            <span>{client.debt.toFixed(2)} DH</span>
          </div>
        )}
      </div>

      <div className="mt-16 text-center space-y-6">
        <p className="text-[10px] font-bold italic opacity-60">
          {isRtl ? "شكراً لزيارتكم" : "Thank you for your visit"}
        </p>
      </div>
    </div>
  );
}

export function StockView({
  appData,
  setAppData,
  t,
  isRtl,
  currentUser,
}: {
  appData: AppData;
  setAppData: any;
  t: any;
  isRtl: boolean;
  currentUser?: any;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    barcode: "",
    name: "",
    price: "",
    costPrice: "",
    qty: "",
    category: "عام",
    supplier: "",
  });
  const [newCatName, setNewCatName] = useState("");

  // --- Suppliers Management States ---
  const [stockTab, setStockTab] = useState<"products" | "suppliers">("products");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [orderingSupplier, setOrderingSupplier] = useState<Supplier | null>(null);
  
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [orderNotes, setOrderNotes] = useState("");
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [activePrintPO, setActivePrintPO] = useState<any | null>(null);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return;
    const supplier: Supplier = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSupplier.name.trim(),
      phone: newSupplier.phone.trim(),
      email: newSupplier.email.trim(),
      address: newSupplier.address.trim(),
      notes: newSupplier.notes.trim(),
      createdAt: new Date().toISOString(),
    };
    setAppData((prev: AppData) => ({
      ...prev,
      suppliers: [supplier, ...(prev.suppliers || [])],
    }));
    setShowAddSupplierModal(false);
    setNewSupplier({
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
  };

  const handleEditSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setAppData((prev: AppData) => ({
      ...prev,
      suppliers: (prev.suppliers || []).map((s) =>
         s.id === editingSupplier.id ? editingSupplier : s
      ),
    }));
    setEditingSupplier(null);
  };

  const deleteSupplier = (id: string) => {
    if (confirm(isRtl ? "هل أنت متأكد من حذف هذا المورد؟" : "Are you sure you want to delete this supplier?")) {
      setAppData((prev: AppData) => ({
        ...prev,
        suppliers: (prev.suppliers || []).filter((s) => s.id !== id),
      }));
    }
  };

  const handleCompleteSuppliedPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingSupplier) return;
    
    // Compile items
    const poItems = Object.entries(orderQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([prodId, qty]) => {
        const p = appData.products.find(prod => prod.id === prodId);
        return {
          id: prodId,
          name: p ? p.name : (isRtl ? "سلعة مجهولة" : "Unknown item"),
          qty: qty,
          costPrice: p ? p.costPrice : 0,
        };
      });

    if (poItems.length === 0) {
      alert(isRtl ? "الرجاء تحديد كميات للطلب أولاً!" : "Please specify quantities to order first!");
      return;
    }

    const uniqueId = "PO-" + Math.floor(100000 + Math.random() * 900000);
    const compiledPO = {
      supplierName: orderingSupplier.name,
      supplierPhone: orderingSupplier.phone,
      supplierEmail: orderingSupplier.email,
      supplierAddress: orderingSupplier.address,
      items: poItems,
      notes: orderNotes,
      date: new Date().toISOString().split("T")[0],
      purchaseOrderId: uniqueId,
    };

    // Print PO
    setActivePrintPO(compiledPO);
    
    // Auto-restock option (if they complete it)
    setAppData((prev: AppData) => {
      let updatedProducts = [...prev.products];
      poItems.forEach(item => {
        const idx = updatedProducts.findIndex(p => p.id === item.id);
        if (idx > -1) {
          updatedProducts[idx] = {
            ...updatedProducts[idx],
            qty: updatedProducts[idx].qty + item.qty,
            updatedAt: new Date().toISOString()
          };
        }
      });
      return {
        ...prev,
        products: updatedProducts
      };
    });

    setShowOrderSuccess(true);
    setOrderingSupplier(null);
  };

  // Bulk CSV Import States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [duplicateOption, setDuplicateOption] = useState<
    "skip" | "overwrite" | "merge_qty"
  >("skip");
  const [parsedProducts, setParsedProducts] = useState<any[]>([]);
  const [importStats, setImportStats] = useState({
    total: 0,
    valid: 0,
    errors: 0,
    duplicates: 0,
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      barcode:
        newProduct.barcode ||
        Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      costPrice: parseFloat(newProduct.costPrice) || 0,
      qty: parseInt(newProduct.qty),
      category: newProduct.category,
      supplier: newProduct.supplier,
      updatedAt: new Date().toISOString(),
    };
    setAppData((prev: AppData) => ({
      ...prev,
      products: [product, ...prev.products],
    }));
    setShowAddModal(false);
    setNewProduct({
      barcode: "",
      name: "",
      price: "",
      costPrice: "",
      qty: "",
      category: "عام",
      supplier: "",
    });
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setAppData((prev: AppData) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === editingProduct.id ? editingProduct : p,
      ),
    }));
    setEditingProduct(null);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    const cat: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCatName,
    };
    setAppData((prev: AppData) => ({
      ...prev,
      categories: [...prev.categories, cat],
    }));
    setNewCatName("");
  };

  const deleteProduct = (id: string) => {
    setAppData((prev: AppData) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  // --- CSV Bulk Import Helpers ---
  const downloadImportTemplate = () => {
    const headers =
      "barcode,name,price,costPrice,qty,category,supplier,minQty\n";
    const sampleRows =
      "6111234567890,Product Name A,120.00,80.00,100,Electronics,Supplier Alpha,5\n" +
      "6111234567891,Product Name B,45.50,30.00,250,Drinks,Supplier Beta,10\n";
    const blob = new Blob([headers + sampleRows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventory_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cell.trim());
        cell = "";
      } else {
        cell += char;
      }
    }
    result.push(cell.trim());
    return result;
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      if (lines.length === 0) return;

      // Extract and clean headers
      const firstLine = lines[0];
      if (!firstLine) return;
      const headers = parseCSVLine(firstLine).map((h) =>
        h
          .trim()
          .toLowerCase()
          .replace(/^["']|["']$/g, ""),
      );

      const parsed: any[] = [];
      let validCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = parseCSVLine(line).map((c) =>
          c.trim().replace(/^["']|["']$/g, ""),
        );
        const rowObj: any = {};

        headers.forEach((header, idx) => {
          if (header) {
            rowObj[header] = cells[idx] || "";
          }
        });

        const name = rowObj.name || rowObj.product || rowObj.title || "";
        const barcode = rowObj.barcode || "";
        const price = parseFloat(rowObj.price || "0");
        const costPrice = parseFloat(
          rowObj.costprice || rowObj.cost_price || "0",
        );
        const qty = parseInt(rowObj.qty || rowObj.quantity || "0");
        const category = rowObj.category || "عام";
        const supplier = rowObj.supplier || "";
        const minQty =
          rowObj.minqty || rowObj.min_qty
            ? parseInt(rowObj.minqty || rowObj.min_qty)
            : undefined;

        let isValid = true;
        let errorReason = "";

        if (!name) {
          isValid = false;
          errorReason = isRtl ? "اسم المنتج مطلوب" : "Product name is required";
        } else if (isNaN(price) || price < 0) {
          isValid = false;
          errorReason = isRtl ? "ثمن البيع غير صالح" : "Invalid selling price";
        } else if (isNaN(qty) || qty < 0) {
          isValid = false;
          errorReason = isRtl ? "الكمية غير صالحة" : "Invalid quantity";
        }

        const isDuplicate = appData.products.some(
          (p) => p.barcode === barcode && barcode !== "",
        );

        if (!isValid) errorCount++;
        else if (isDuplicate) duplicateCount++;
        else validCount++;

        parsed.push({
          index: i,
          barcode:
            barcode ||
            Math.floor(100000000000 + Math.random() * 900000000000).toString(),
          name,
          price: isNaN(price) ? 0 : price,
          costPrice: isNaN(costPrice) ? 0 : costPrice,
          qty: isNaN(qty) ? 0 : qty,
          category,
          supplier,
          minQty,
          isValid,
          errorReason,
          isDuplicate,
        });
      }

      setParsedProducts(parsed);
      setImportStats({
        total: parsed.length,
        valid: validCount,
        errors: errorCount,
        duplicates: duplicateCount,
      });
    };
    reader.readAsText(file);
  };

  const handleBulkImport = () => {
    if (parsedProducts.length === 0) return;

    setAppData((prev: AppData) => {
      let updatedProducts = [...prev.products];
      const categoriesSet = new Set(
        prev.categories.map((c) => c.name.toLowerCase()),
      );
      const newCategories = [...prev.categories];

      parsedProducts.forEach((item) => {
        if (!item.isValid) return; // Skip invalid records entirely

        // Ensure category exists or create it
        const catNameTrimmed = (item.category || "عام").trim();
        if (
          catNameTrimmed &&
          !categoriesSet.has(catNameTrimmed.toLowerCase())
        ) {
          const newCat: Category = {
            id: Math.random().toString(36).substr(2, 9),
            name: catNameTrimmed,
          };
          newCategories.push(newCat);
          categoriesSet.add(catNameTrimmed.toLowerCase());
        }

        const existingIndex = updatedProducts.findIndex(
          (p) => p.barcode === item.barcode && item.barcode !== "",
        );

        if (existingIndex > -1) {
          // Handle duplicate barcode
          if (duplicateOption === "overwrite") {
            updatedProducts[existingIndex] = {
              ...updatedProducts[existingIndex],
              name: item.name,
              price: item.price,
              costPrice: item.costPrice,
              qty: item.qty,
              category: catNameTrimmed,
              supplier:
                item.supplier || updatedProducts[existingIndex].supplier,
              minQty:
                item.minQty !== undefined
                  ? item.minQty
                  : updatedProducts[existingIndex].minQty,
              updatedAt: new Date().toISOString(),
            };
          } else if (duplicateOption === "merge_qty") {
            updatedProducts[existingIndex] = {
              ...updatedProducts[existingIndex],
              qty: updatedProducts[existingIndex].qty + item.qty,
              updatedAt: new Date().toISOString(),
            };
          }
          // If option is 'skip', do nothing
        } else {
          // New product, add to inventory
          const product: Product = {
            id: Math.random().toString(36).substr(2, 9),
            barcode: item.barcode,
            name: item.name,
            price: item.price,
            costPrice: item.costPrice,
            qty: item.qty,
            category: catNameTrimmed,
            supplier: item.supplier,
            minQty: item.minQty,
            updatedAt: new Date().toISOString(),
          };
          updatedProducts.unshift(product);
        }
      });

      return {
        ...prev,
        products: updatedProducts,
        categories: newCategories,
      };
    });

    // Reset state & close modal
    setShowImportModal(false);
    setImportFile(null);
    setParsedProducts([]);
    setImportStats({ total: 0, valid: 0, errors: 0, duplicates: 0 });
  };

  const filtered = appData.products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode || "").includes(searchTerm);
    const matchesCategory =
      selectedCategory === "الكل" ||
      selectedCategory === "All" ||
      selectedCategory === "Tous"
        ? true
        : p.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || p.qty <= (p.minQty || 5);
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      {/* Subtab Switcher */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit mb-4" id="stock-view-subtabs">
        <button
          type="button"
          onClick={() => setStockTab("products")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            stockTab === "products"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Boxes size={16} />
          {isRtl ? "إدارة المخزون" : "Inventory Management"}
        </button>
        <button
          type="button"
          onClick={() => setStockTab("suppliers")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            stockTab === "suppliers"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Truck size={16} />
          {isRtl ? "بيانات الموردين" : "Suppliers Directory"}
        </button>
      </div>

      {stockTab === "products" ? (
        <>
          {/* Top Controls */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search
                  className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-slate-400`}
                  size={18}
                />
                <input
                  type="text"
                  placeholder={t("search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-2xl border-2 border-slate-200 bg-white py-4 ${isRtl ? "pr-12 pl-4" : "pl-12 pr-4"} text-sm font-bold text-slate-800 outline-none focus:border-primary/50 transition-all shadow-sm`}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {[
                  isRtl
                    ? "الكل"
                    : appData.settings.language === "fr"
                      ? "Tous"
                      : "All",
                  ...appData.categories.map((c) => c.name),
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                      selectedCategory === cat
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                        : "bg-white border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Low Stock Alert Toggle filter */}
              <button
                type="button"
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 flex items-center gap-2 cursor-pointer ${
                  showLowStockOnly
                    ? "bg-rose-50 border-rose-200 text-rose-600 shadow-md shadow-rose-100/50"
                    : "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-slate-300"
                }`}
              >
                <AlertCircle
                  size={14}
                  className={
                    showLowStockOnly
                      ? "text-rose-500 animate-[pulse_1.5s_infinite]"
                      : "text-slate-400"
                  }
                />
                {isRtl ? "سلع مقاربة للنفاذ" : "Low Stock Only"}
              </button>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 rounded-2xl bg-white border-2 border-slate-200 px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Layers size={18} />
                {t("categories_btn")}
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 rounded-2xl bg-white border-2 border-slate-200 px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
              >
                <Upload size={18} />
                {isRtl ? "استيراد جماعي" : "Bulk Import (CSV)"}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
              >
                <Plus size={18} strokeWidth={3} />
                {t("add_product")}
              </button>
            </div>
          </div>

          {/* Main Table */}
          <div className="rounded-[40px] bg-white border border-slate-200 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table
                className={`w-full ${isRtl ? "text-right" : "text-left"} border-collapse`}
              >
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                      {isRtl ? "المنتج والباركود" : "Product & Barcode"}
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                      {isRtl ? "الفئة" : "Category"}
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                      {isRtl ? "الثمن" : "Price"}
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-center">
                      {isRtl ? "الكمية" : "Qty"}
                    </th>
                    <th
                      className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic ${isRtl ? "text-left" : "text-right"}`}
                    >
                      {isRtl ? "التحكم" : "Action"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 transition-all group"
                    >
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                            <Archive size={20} />
                          </div>
                          <div className={isRtl ? "text-right" : "text-left"}>
                            <p className="text-sm font-black text-slate-800 italic leading-none mb-2">
                              {p.name}
                            </p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
                              {p.barcode}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <span className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-8 py-7">
                        <span className="text-lg font-black text-slate-800 italic tracking-tighter">
                          {p.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-8 py-7 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-[18px] justify-center shadow-sm">
                          <button
                            type="button"
                            onClick={() => {
                              setAppData((prev: AppData) => ({
                                ...prev,
                                products: prev.products.map((prod) =>
                                  prod.id === p.id
                                    ? {
                                        ...prod,
                                        qty: Math.max(0, prod.qty - 1),
                                        updatedAt: new Date().toISOString(),
                                      }
                                    : prod,
                                ),
                              }));
                            }}
                            className="h-8 w-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all cursor-pointer active:scale-90"
                            title={
                              isRtl ? "تقليل الكمية (-1)" : "Decrease quantity (-1)"
                            }
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>

                          <div className="min-w-[40px] text-center">
                            <span
                              className={`text-base font-black italic tracking-tighter block ${p.qty <= (p.minQty || 5) ? "text-rose-500 animate-pulse" : "text-slate-800"}`}
                            >
                              {p.qty}
                            </span>
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block -mt-0.5">
                              {isRtl ? "وحدة" : "Unit"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setAppData((prev: AppData) => ({
                                ...prev,
                                products: prev.products.map((prod) =>
                                  prod.id === p.id
                                    ? {
                                        ...prod,
                                        qty: prod.qty + 1,
                                        updatedAt: new Date().toISOString(),
                                      }
                                    : prod,
                                ),
                              }));
                            }}
                            className="h-8 w-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all cursor-pointer active:scale-90"
                            title={
                              isRtl ? "زيادة الكمية (+1)" : "Increase quantity (+1)"
                            }
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </td>
                      <td
                        className={`px-8 py-7 ${isRtl ? "text-left" : "text-right"}`}
                      >
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border border-primary/10 shadow-sm flex items-center justify-center cursor-pointer"
                            title={isRtl ? "تعديل السلعة" : "Edit product"}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all border border-red-500/10 shadow-sm flex items-center justify-center cursor-pointer"
                            title={isRtl ? "حذف السلعة" : "Delete product"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-40 text-center flex flex-col items-center justify-center space-y-4 opacity-40">
                  <Boxes size={80} strokeWidth={1} />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">
                    {isRtl ? "لا توجد سلع متوفرة حالياً" : "No items found"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Top Controls for Suppliers */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search
                className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-slate-400`}
                size={18}
              />
              <input
                type="text"
                placeholder={isRtl ? "البحث عن مورد..." : "Search suppliers..."}
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                className={`w-full rounded-2xl border-2 border-slate-200 bg-white py-4 ${isRtl ? "pr-12 pl-4" : "pl-12 pr-4"} text-sm font-bold text-slate-800 outline-none focus:border-primary/50 transition-all shadow-sm`}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAddSupplierModal(true)}
              className="w-full md:w-auto flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus size={18} strokeWidth={3} />
              {isRtl ? "إضافة مورد جديد" : "Add New Supplier"}
            </button>
          </div>

          {/* Suppliers Directory Grid */}
          {((appData.suppliers || []).filter((s) =>
            s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
            (s.phone || "").includes(supplierSearch) ||
            (s.email || "").toLowerCase().includes(supplierSearch.toLowerCase())
          )).length === 0 ? (
            <div className="py-24 text-center bg-white border border-slate-200 rounded-[40px] flex flex-col items-center justify-center space-y-4 shadow-sm">
              <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <Truck size={48} strokeWidth={1} />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                {isRtl ? "لا يوجد أي مورد مسجل حالياً" : "No suppliers registered"}
              </p>
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(true)}
                className="text-xs font-black text-primary underline uppercase tracking-widest"
              >
                {isRtl ? "انقر لإضافة أول مورد" : "Click here to add your first supplier"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(appData.suppliers || [])
                .filter((s) =>
                  s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                  (s.phone || "").includes(supplierSearch) ||
                  (s.email || "").toLowerCase().includes(supplierSearch.toLowerCase())
                )
                .map((s) => {
                  const associatedProducts = appData.products.filter(
                    (p) => (p.supplier || "").trim().toLowerCase() === s.name.trim().toLowerCase()
                  );

                  return (
                    <div
                      key={s.id}
                      className="bg-white rounded-[32px] p-8 border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between h-full relative group shadow-sm"
                    >
                      <div>
                        {/* Header */}
                        <div className={`flex items-center gap-4 mb-6 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 font-black text-xl italic uppercase font-mono">
                            {s.name.charAt(0)}
                          </div>
                          <div className={isRtl ? "text-right" : "text-left font-sans"}>
                            <h4 className="text-base font-black text-slate-800 leading-none mb-1.5">{s.name}</h4>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {isRtl ? "مورد معتمد" : "Verified Supplier"}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 font-semibold pb-4">
                          {s.phone && (
                            <div className={`flex items-center gap-3 text-xs text-slate-600 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <Phone size={14} className="text-slate-400 shrink-0" />
                              <span className="font-mono">{s.phone}</span>
                            </div>
                          )}
                          {s.email && (
                            <div className={`flex items-center gap-3 text-xs text-slate-600 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <Mail size={14} className="text-slate-400 shrink-0" />
                              <span className="font-mono truncate">{s.email}</span>
                            </div>
                          )}
                          {s.address && (
                            <div className={`flex items-center gap-3 text-xs text-slate-600 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <MapPin size={14} className="text-slate-400 shrink-0" />
                              <span className="truncate">{s.address}</span>
                            </div>
                          )}
                          {s.notes && (
                            <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              <p className={`text-[11px] text-slate-500 italic leading-relaxed font-sans ${isRtl ? "text-right" : "text-left"}`}>
                                {s.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Linked Products */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className={`flex justify-between items-center mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              {isRtl ? "السلع الموردة" : "Supplied Products"}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9.5px] font-black">
                              {associatedProducts.length}
                            </span>
                          </div>

                          {associatedProducts.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto no-scrollbar">
                              {associatedProducts.map((p) => (
                                <span
                                  key={p.id}
                                  className={`px-2.5 py-1.5 rounded-xl border text-[9.5px] font-black flex items-center gap-1.5 transition-all ${
                                    p.qty <= (p.minQty || 5)
                                      ? "bg-rose-50 border-rose-100 text-rose-700 animate-pulse"
                                      : "bg-slate-50 border-slate-200/60 text-slate-600"
                                  }`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${p.qty <= (p.minQty || 5) ? "bg-rose-500" : "bg-emerald-500"}`} />
                                  <span className="truncate max-w-[120px]">{p.name} (x{p.qty})</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className={`text-[10px] font-bold text-slate-400 italic ${isRtl ? "text-right" : "text-left"}`}>
                              {isRtl ? "لا توجد سلع مرتبطة مباشرة حالياً" : "No products mapped to supplier"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer actions */}
                      <div className={`mt-8 pt-4 border-t border-slate-100/60 flex items-center justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setOrderingSupplier(s);
                            const prefilled: Record<string, number> = {};
                            associatedProducts.forEach((p) => {
                              if (p.qty <= (p.minQty || 5)) {
                                prefilled[p.id] = (p.minQty || 5) * 2;
                              } else {
                                prefilled[p.id] = 0;
                              }
                            });
                            if (associatedProducts.length === 0) {
                              appData.products.forEach((p) => {
                                prefilled[p.id] = 0;
                              });
                            }
                            setOrderQuantities(prefilled);
                            setOrderNotes("");
                            setShowOrderSuccess(false);
                          }}
                          className="flex-1 h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-lg shadow-violet-600/10"
                        >
                          <ShoppingBag size={14} />
                          <span>{isRtl ? "تجهيز طلب بضاعة" : "Order Stock"}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingSupplier(s)}
                            className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/40 flex items-center justify-center transition-all cursor-pointer"
                            title={isRtl ? "تعديل المورد" : "Edit Supplier"}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSupplier(s.id)}
                            className="h-12 w-12 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 flex items-center justify-center transition-all cursor-pointer"
                            title={isRtl ? "حذف المورد" : "Delete Supplier"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {/* BULK CSV IMPORT MODAL */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl bg-white rounded-[48px] p-12 border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="mb-8 flex items-center justify-between font-sans">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block mb-2">
                      {isRtl ? "الاستيراد السريع" : "BULK PRODUCT INTAKE"}
                    </span>
                    <h3 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">
                      {isRtl
                        ? "استيراد السلع من ملف CSV"
                        : "Bulk Import Products"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setParsedProducts([]);
                    }}
                    className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Info & Template Download */}
                <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-200/60 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className={isRtl ? "text-right" : "text-left"}>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1 italic">
                      {isRtl
                        ? "مواصفات صيغة الملف المطلوبة"
                        : "Required File Format & Headers"}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed font-sans">
                      {isRtl
                        ? "يرجى استخدام ملف CSV يتضمن الأعمدة التالية: barcode, name, price, costPrice, qty, category, supplier, minQty."
                        : "Your CSV file must include headers matching: barcode, name, price, costPrice, qty, category, supplier, minQty."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadImportTemplate}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-800 transition-all cursor-pointer grow-0 shrink-0 font-sans"
                  >
                    <Download size={14} />
                    {isRtl ? "تحميل قالب CSV جاهز" : "Download CSV Template"}
                  </button>
                </div>

                {/* Upload Field / Drag-drop file area */}
                <div className="relative mb-8">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportFileChange}
                    id="excel-csv-file-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="excel-csv-file-input"
                    className="flex flex-col items-center justify-center border-3 border-dashed border-slate-200 hover:border-primary/40 bg-slate-50/30 hover:bg-slate-50/60 p-8 rounded-[32px] cursor-pointer transition-all gap-3 text-center"
                  >
                    <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                      <Upload size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block mb-1">
                        {importFile
                          ? importFile.name
                          : isRtl
                            ? "اضغط لرفع ملف CSV أو سحبه هنا"
                            : "Click to select or drag & drop CSV file"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        {importFile
                          ? `${(importFile.size / 1024).toFixed(1)} KB`
                          : isRtl
                            ? "الملفات بصيغة .csv فقط"
                            : "Supports .csv files only"}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Parsed Data Preview Section */}
                {parsedProducts.length > 0 && (
                  <div className="space-y-6">
                    {/* Diagnostic Counter Badges */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 text-center">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                          {isRtl ? "إجمالي السطور" : "Total Rows"}
                        </span>
                        <span className="text-lg font-black text-slate-700 font-mono">
                          {importStats.total}
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50 text-center">
                        <span className="text-[9px] uppercase font-black text-emerald-600 tracking-wider block mb-1">
                          {isRtl ? "جاهز للاستيراد" : "Valid Rows"}
                        </span>
                        <span className="text-lg font-black text-emerald-600 font-mono">
                          {importStats.valid}
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100/50 text-center">
                        <span className="text-[9px] uppercase font-black text-amber-600 tracking-wider block mb-1">
                          {isRtl ? "باركود مكرر" : "Duplicates"}
                        </span>
                        <span className="text-lg font-black text-amber-600 font-mono">
                          {importStats.duplicates}
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100/50 text-center">
                        <span className="text-[9px] uppercase font-black text-rose-600 tracking-wider block mb-1">
                          {isRtl ? "سطور بها خطأ" : "Errors"}
                        </span>
                        <span className="text-lg font-black text-rose-600 font-mono">
                          {importStats.errors}
                        </span>
                      </div>
                    </div>

                    {/* How to handle duplicate options */}
                    {importStats.duplicates > 0 && (
                      <div
                        className={`p-6 rounded-[28px] border border-amber-200 bg-amber-50/25 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${isRtl ? "text-right" : "text-left"}`}
                      >
                        <div>
                          <p className="text-xs font-black text-slate-800 flex items-center gap-2">
                            <AlertCircle size={14} className="text-amber-500" />
                            {isRtl
                              ? "تم اكتشاف باركود مكرر في المخزن الحالي!"
                              : "Duplicate barcodes discovered!"}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold mt-1 font-sans">
                            {isRtl
                              ? "اختر طريقة تصرف النظام عند العثور على باركود لسلعة مسجلة مسبقاً:"
                              : "Select your preferred strategy to handle imported products mapping to active barcodes:"}
                          </p>
                        </div>
                        <select
                          value={duplicateOption}
                          onChange={(e) =>
                            setDuplicateOption(e.target.value as any)
                          }
                          className="h-12 px-4 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 outline-none focus:border-amber-400 shadow-sm"
                        >
                          <option value="skip">
                            {isRtl ? "تخطي وتجاهل المكرر" : "Skip Duplicates"}
                          </option>
                          <option value="overwrite">
                            {isRtl
                              ? "تحديث وتجاوز البيانات القديمة"
                              : "Overwrite Fields with CSV"}
                          </option>
                          <option value="merge_qty">
                            {isRtl
                              ? "دمج وإضافة الكمية الجديدة"
                              : "Add Received Stock Quantities"}
                          </option>
                        </select>
                      </div>
                    )}

                    {/* Table Preview */}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">
                        {isRtl
                          ? "معاينة السلع الجاهزة للاستيراد"
                          : "Parsed Product Rows Preview"}
                      </p>
                      <div className="border border-slate-200 rounded-3xl overflow-hidden max-h-[220px] overflow-y-auto custom-scrollbar">
                        <table
                          className={`w-full ${isRtl ? "text-right" : "text-left"} text-[11px] border-collapse`}
                        >
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black">
                              <th className="px-6 py-3">
                                {isRtl ? "المنتج" : "Product"}
                              </th>
                              <th className="px-6 py-3">
                                {isRtl ? "الباركود" : "Barcode"}
                              </th>
                              <th className="px-6 py-3">
                                {isRtl ? "الفئة" : "Category"}
                              </th>
                              <th className="px-6 py-3 text-right">
                                {isRtl ? "الشراء" : "Cost"}
                              </th>
                              <th className="px-6 py-3 text-right">
                                {isRtl ? "البيع" : "Price"}
                              </th>
                              <th className="px-6 py-3 text-center">
                                {isRtl ? "الكمية" : "Qty"}
                              </th>
                              <th className="px-6 py-3 text-center">
                                {isRtl ? "الحالة" : "Status"}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedProducts.map((p, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-slate-100 last:border-none font-bold text-slate-600 hover:bg-slate-50/50"
                              >
                                <td className="px-6 py-3 font-extrabold text-slate-800 truncate max-w-[120px]">
                                  {p.name}
                                </td>
                                <td className="px-6 py-3 font-mono text-slate-500">
                                  {p.barcode}
                                </td>
                                <td className="px-6 py-3 text-slate-400 uppercase tracking-wide text-[9px]">
                                  {p.category}
                                </td>
                                <td className="px-6 py-3 text-right font-mono">
                                  {p.costPrice.toFixed(2)}
                                </td>
                                <td className="px-6 py-3 text-right font-mono text-emerald-600">
                                  {p.price.toFixed(2)}
                                </td>
                                <td className="px-6 py-3 text-center font-mono">
                                  {p.qty}
                                </td>
                                <td className="px-6 py-3 text-center">
                                  {!p.isValid ? (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[8px] font-black border border-rose-100 truncate max-w-[100px] inline-block">
                                      {p.errorReason}
                                    </span>
                                  ) : p.isDuplicate ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[8px] font-black border border-amber-100 inline-block">
                                      {duplicateOption === "skip"
                                        ? isRtl
                                          ? "سيتم تخطيه"
                                          : "Will skip"
                                        : duplicateOption === "overwrite"
                                          ? isRtl
                                            ? "سيتم استبداله"
                                            : "Will replace"
                                          : isRtl
                                            ? "ستضاف الكمية"
                                            : "Will add qty"}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black border border-emerald-100 inline-block">
                                      {isRtl ? "جديد آمن" : "Valid New"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save & Confirm action buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setParsedProducts([]);
                  }}
                  className="flex-1 h-18 rounded-[24px] bg-slate-100 text-slate-500 hover:text-slate-800 font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all cursor-pointer"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={
                    parsedProducts.length === 0 ||
                    (importStats.valid === 0 && importStats.duplicates === 0)
                  }
                  onClick={handleBulkImport}
                  className="flex-1 h-18 rounded-[24px] bg-primary disabled:opacity-50 disabled:pointer-events-none text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 transition-all cursor-pointer active:scale-[0.98]"
                >
                  {isRtl ? "تأكيد وحفظ الكل بالمخزن" : "Confirm & Save All"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Manager Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg bg-white rounded-[48px] p-12 border border-slate-200 shadow-2xl"
            >
              <div className="mb-10 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">
                  {isRtl ? "تدبير فئات السلع" : "Manage Categories"}
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="flex gap-4 mb-10">
                <input
                  required
                  placeholder={
                    isRtl ? "اسم الفئة الجديدة..." : "New category name..."
                  }
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className={`flex-1 h-14 rounded-2xl bg-slate-50 border border-slate-200 px-6 text-slate-800 font-black outline-none ${isRtl ? "text-right" : "text-left"}`}
                  dir={isRtl ? "rtl" : "ltr"}
                />
                <button
                  type="submit"
                  className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all shadow-xl shadow-primary/20"
                >
                  {isRtl ? "إضافة" : "Add"}
                </button>
              </form>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {appData.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group"
                  >
                    <button
                      onClick={() =>
                        setAppData((prev: AppData) => ({
                          ...prev,
                          categories: prev.categories.filter(
                            (c) => c.id !== cat.id,
                          ),
                        }))
                      }
                      className="text-red-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="text-sm font-black text-slate-700 uppercase tracking-widest italic">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onSubmit={handleAddProduct}
              className="w-full max-w-2xl bg-white rounded-[48px] p-12 border border-slate-200 shadow-2xl"
            >
              <div className="mb-10 flex items-center justify-between">
                <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter uppercase">
                  {isRtl ? "إضافة سلعة للمخزن" : "Add New Product"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div
                  className={`col-span-2 space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "الاسم التجاري" : "Name"}
                  </label>
                  <input
                    required
                    type="text"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "ثمن الشراء (DH)" : "Cost Price"}
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={newProduct.costPrice}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        costPrice: e.target.value,
                      })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-red-600 font-black text-xl outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "ثمن البيع (DH)" : "Selling Price"}
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-emerald-600 font-black text-xl outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "الكمية الأولية" : "Initial Qty"}
                  </label>
                  <input
                    required
                    type="number"
                    value={newProduct.qty}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, qty: e.target.value })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "الفئة" : "Category"}
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 px-6 text-slate-800 font-black outline-none focus:border-primary/50 appearance-none"
                  >
                    {appData.categories.map((c) => (
                      <option key={c.id} value={c.name} className="bg-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className={`col-span-2 space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "المورد (اختياري)" : "Supplier (Opt)"}
                  </label>
                  <select
                    value={newProduct.supplier}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, supplier: e.target.value })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 px-6 text-slate-800 font-black outline-none focus:border-primary/50 appearance-none bg-no-repeat bg-[right_1.5rem_center] cursor-pointer"
                  >
                    <option value="" className="bg-white">
                      {isRtl ? "-- بدون مورد --" : "-- No Supplier --"}
                    </option>
                    {(appData.suppliers || []).map((s) => (
                      <option key={s.id} value={s.name} className="bg-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-24 rounded-[32px] bg-primary text-white font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98]"
              >
                {isRtl ? "إضافة للمخزن" : "Add to Stock"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleEditProduct}
              className="w-full max-w-2xl bg-white rounded-[48px] p-12 border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="mb-10 flex items-center justify-between font-sans">
                <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter uppercase">
                  {isRtl ? "تعديل السلعة بالمخزن" : "Edit Product"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10 text-left font-sans">
                <div
                  className={`col-span-2 space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "الاسم التجاري" : "Name"}
                  </label>
                  <input
                    required
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "ثمن الشراء (DH)" : "Cost Price"}
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={editingProduct.costPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        costPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-red-600 font-black text-xl outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "ثمن البيع (DH)" : "Selling Price"}
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-emerald-600 font-black text-xl outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "الكمية الحالية" : "Current Stock"}
                  </label>
                  <input
                    required
                    type="number"
                    value={editingProduct.qty}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        qty: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "الفئة" : "Category"}
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                      })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 px-6 text-slate-800 font-black outline-none focus:border-primary/50 appearance-none"
                  >
                    {appData.categories.map((c) => (
                      <option key={c.id} value={c.name} className="bg-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "الباركود" : "Barcode"}
                  </label>
                  <input
                    required
                    type="text"
                    value={editingProduct.barcode || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        barcode: e.target.value,
                      })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl
                      ? "حد نقص المخزن (الإنذار)"
                      : "Low Stock Alert Level"}
                  </label>
                  <input
                    required
                    type="number"
                    value={
                      editingProduct.minQty !== undefined
                        ? editingProduct.minQty
                        : 5
                    }
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        minQty: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-primary/50"
                  />
                </div>
                <div
                  className={`col-span-2 space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "المورد (اختياري)" : "Supplier (Opt)"}
                  </label>
                  <select
                    value={editingProduct.supplier || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        supplier: e.target.value,
                      })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 px-6 text-slate-800 font-black outline-none focus:border-primary/50 appearance-none bg-no-repeat bg-[right_1.5rem_center] cursor-pointer"
                  >
                    <option value="" className="bg-white">
                      {isRtl ? "-- بدون مورد --" : "-- No Supplier --"}
                    </option>
                    {(appData.suppliers || []).map((s) => (
                      <option key={s.id} value={s.name} className="bg-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-24 rounded-[32px] bg-primary text-white font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98]"
              >
                {isRtl ? "حفظ التغييرات" : "Save Changes"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Add Supplier Modal */}
      <AnimatePresence>
        {showAddSupplierModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleAddSupplier}
              className="w-full max-w-lg bg-white rounded-[40px] p-10 border border-slate-200 shadow-2xl animate-fade-in"
            >
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter flex items-center gap-2">
                  <UserPlus className="text-primary shrink-0" size={24} />
                  <span>{isRtl ? "إضافة مورد جديد" : "Register Supplier"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 mb-8 text-left">
                <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "اسم المورد" : "Supplier Name"} *
                  </label>
                  <input
                    required
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-slate-800 font-extrabold outline-none focus:border-primary/50"
                  />
                </div>
                <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-slate-800 font-extrabold outline-none focus:border-primary/50"
                  />
                </div>
                <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-slate-800 font-extrabold outline-none focus:border-primary/50"
                  />
                </div>
                <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "العنوان" : "Physical Address"}
                  </label>
                  <input
                    type="text"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-slate-800 font-extrabold outline-none focus:border-primary/50"
                  />
                </div>
                <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "ملاحظات إضافية" : "Additional Notes"}
                  </label>
                  <textarea
                    value={newSupplier.notes}
                    onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                    className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-slate-800 font-extrabold outline-none focus:border-primary/50 resize-none font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-16 rounded-[20px] bg-primary text-white font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer"
              >
                {isRtl ? "تسجيل المورد" : "Register Supplier"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Supplier Modal */}
      <AnimatePresence>
        {editingSupplier && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleEditSupplier}
              className="w-full max-w-lg bg-white rounded-[40px] p-10 border border-slate-200 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter flex items-center gap-2">
                  <Edit className="text-primary shrink-0" size={24} />
                  <span>{isRtl ? "تعديل بيانات المورد" : "Edit Supplier Settings"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="h-10 w-10 text-slate-300 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 mb-8 text-left">
                <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "اسم المورد" : "Supplier Name"} *
                  </label>
                  <input
                    required
                    type="text"
                    value={editingSupplier.name}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-slate-800 font-extrabold outline-none focus:border-primary/50"
                  />
                </div>
                <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={editingSupplier.phone || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-slate-800 font-extrabold outline-none focus:border-primary/50"
                  />
                </div>
                <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={editingSupplier.email || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-slate-800 font-extrabold outline-none focus:border-primary/50"
                  />
                </div>
                <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "العنوان" : "Physical Address"}
                  </label>
                  <input
                    type="text"
                    value={editingSupplier.address || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-slate-800 font-extrabold outline-none focus:border-primary/50"
                  />
                </div>
                <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "ملاحظات إضافية" : "Additional Notes"}
                  </label>
                  <textarea
                    value={editingSupplier.notes || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, notes: e.target.value })}
                    className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-slate-800 font-extrabold outline-none focus:border-primary/50 resize-none font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-16 rounded-[20px] bg-primary text-white font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer"
              >
                {isRtl ? "حفظ وتعديل البيانات" : "Save Changes"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Order Stock Modal */}
      <AnimatePresence>
        {orderingSupplier && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleCompleteSuppliedPO}
              className="w-full max-w-2xl bg-white rounded-[40px] p-10 border border-slate-200 shadow-2xl flex flex-col justify-between max-h-[90vh]"
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">
                      {isRtl ? "تجهيز طلب اقتناء بضاعة" : "Stock Purchase Order Request"}
                    </h3>
                    <p className={`text-xs text-primary font-bold ${isRtl ? "text-right" : "text-left"}`}>
                      {orderingSupplier.name} ({orderingSupplier.phone})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderingSupplier(null)}
                    className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <AlertCircle size={18} className="text-violet-500 shrink-0" />
                  <p className={`text-[11px] text-slate-500 font-semibold ${isRtl ? "text-right" : "text-left"}`}>
                    {isRtl
                      ? "قم بتحديد كميات الطلب لكل سلعة. سيقترح النظام تلقائياً كميات ملء المخزن للسلع التي بلغت حد النقص."
                      : "Input ordering quantities. The app auto-suggests values for articles falling below warning parameters."}
                  </p>
                </div>

                {/* Items input list */}
                <div className="space-y-3.5 max-h-[40vh] overflow-y-auto pr-1.5 custom-scrollbar mb-6">
                  {appData.products.filter(p => (p.supplier || "").trim().toLowerCase() === orderingSupplier.name.trim().toLowerCase()).length === 0 ? (
                    appData.products.map(p => {
                      const selectedQty = orderQuantities[p.id] || 0;
                      return (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/50 transition-all">
                          <div className={isRtl ? "text-right" : "text-left"}>
                            <h4 className="text-xs font-black text-slate-800 italic leading-none mb-1">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">
                              {isRtl ? "المخزون الحالي:" : "Current:"} {p.qty} {isRtl ? "وحدة" : "units"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={selectedQty || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setOrderQuantities({ ...orderQuantities, [p.id]: val });
                              }}
                              className="w-24 h-12 rounded-xl bg-white border border-slate-200 text-center text-sm font-black text-indigo-600 outline-none"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    appData.products
                      .filter(p => (p.supplier || "").trim().toLowerCase() === orderingSupplier.name.trim().toLowerCase())
                      .map(p => {
                        const selectedQty = orderQuantities[p.id] || 0;
                        return (
                          <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                            <div className={isRtl ? "text-right" : "text-left"}>
                              <h4 className="text-xs font-black text-slate-800 italic leading-none mb-1">{p.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold">
                                {isRtl ? "المخزون الحالي:" : "Current:"} {p.qty} {isRtl ? "وحدة" : "units"} 
                                {p.qty <= (p.minQty || 5) && <span className="text-rose-500 font-black ml-1 font-sans">({isRtl ? "مستعجل" : "Urgent"})</span>}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={selectedQty || ""}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setOrderQuantities({ ...orderQuantities, [p.id]: val });
                                }}
                                className="w-24 h-12 rounded-xl bg-white border border-slate-200 text-center text-sm font-black text-indigo-600 outline-none"
                              />
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* Additional Notes */}
                <div className={`space-y-1.5 mb-6 ${isRtl ? "text-right" : "text-left"}`}>
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                    {isRtl ? "تعليمات خاصة أو شروط طلب إضافية" : "Special order terms"}
                  </label>
                  <input
                    type="text"
                    placeholder={isRtl ? "ميعاد التسليم، الخصومات المتفق عليها..." : "Delivery threshold, promotional coupons..."}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-xs font-bold text-slate-800 outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Confirm PO Button */}
              <button
                type="submit"
                className="w-full h-16 rounded-[20px] bg-violet-600 text-white font-black uppercase tracking-widest text-xs hover:bg-violet-700 transition-all active:scale-[0.98] cursor-pointer"
              >
                {isRtl ? "إرسال وطباعة طلب البضاعة" : "Register & Issue Purchase Order (PO)"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Success alert with auto-restock notification */}
      <AnimatePresence>
        {showOrderSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[32px] p-8 border border-slate-200 shadow-2xl text-center animate-fade-in"
            >
              <div className="h-16 w-16 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 italic uppercase mb-2">
                {isRtl ? "تم إرسال الطلب بنجاح!" : "Order Generated!"}
              </h3>
              <p className="text-xs text-slate-500 font-sans font-medium leading-relaxed mb-6 text-center">
                {isRtl
                  ? "تم تسجيل سند طلب المشتريات. لقد تم زيادة مستويات مخزون المواد المطلوبة تلقائياً لمواكبة الطلبية الموجهة للمورد!"
                  : "We have issued a purchase order. Inventory stock records have been modified and re-filled instantly to absorb supplier shipments."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowOrderSuccess(false);
                  if (activePrintPO) {
                    window.print();
                  }
                }}
                className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-wider hover:bg-emerald-600 transition-all cursor-pointer"
              >
                {isRtl ? "حسناً، طباعة الوثيقة" : "Got it, Print Document"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DashboardView({
  appData,
  setAppData,
  t,
  isRtl,
  currentUser,
}: {
  appData: AppData;
  setAppData: any;
  t: any;
  isRtl: boolean;
  currentUser?: any;
}) {
  const [subTab, setSubTab] = useState<"analytics" | "reports">("analytics");
  const [timeRange, setTimeRange] = useState<
    "today" | "week" | "month" | "all"
  >("all");
  const [showProfitSeries, setShowProfitSeries] = useState(true);

  // AI strategic analysis assistant states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAIEvaluation = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const response = await analyzeStoreData(null, appData.products, appData.sales);
      setAiResult(response);
    } catch (err: any) {
      if (err.message === "API_KEY_MISSING") {
        setAiError(
          isRtl
            ? "مفتاح GEMINI_API_KEY غير مهيأ! الرجاء التواصل مع مسؤول التطوير لإضافة المفتاح السري إلى الخادم الخاص بك."
            : "GEMINI_API_KEY is not configured! Please set it on your server/environment variables to run analytical features."
        );
      } else {
        setAiError(err.message || "حدث خطأ غير متوقع أثناء عملية التحليل.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const [poDraftItems, setPoDraftItems] = useState<
    Record<string, { qty: number; costPrice: number; selected: boolean }>
  >({});
  const [poSupplierName, setPoSupplierName] = useState("");
  const [poSupplierPhone, setPoSupplierPhone] = useState("");
  const [poSupplierEmail, setPoSupplierEmail] = useState("");
  const [poSupplierAddress, setPoSupplierAddress] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [selectedFilterSupplier, setSelectedFilterSupplier] = useState("all");
  const [activePrintPO, setActivePrintPO] = useState<any | null>(null);
  const [shouldAddStock, setShouldAddStock] = useState(true);
  const [shouldClearReorder, setShouldClearReorder] = useState(true);

  const reorderProducts = useMemo(() => {
    return appData.products.filter((p) =>
      (appData.reorderList || []).includes(p.id),
    );
  }, [appData.products, appData.reorderList]);

  // Keep poDraftItems in sync with reorderProducts
  useEffect(() => {
    setPoDraftItems((prev) => {
      const next = { ...prev };
      let changed = false;
      reorderProducts.forEach((p) => {
        if (!next[p.id]) {
          const defaultQty =
            p.minQty && p.minQty > p.qty ? p.minQty - p.qty : 10;
          next[p.id] = {
            qty: defaultQty > 0 ? defaultQty : 10,
            costPrice: p.costPrice || 0,
            selected: true,
          };
          changed = true;
        }
      });
      // Remove stale items
      Object.keys(next).forEach((id) => {
        if (!reorderProducts.some((p) => p.id === id)) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [reorderProducts]);

  const uniqueSuppliers = useMemo(() => {
    const suppliers = reorderProducts
      .map((p) => p.supplier?.trim())
      .filter(Boolean);
    return Array.from(new Set(suppliers)) as string[];
  }, [reorderProducts]);

  const handleFilterSupplierChange = (supplier: string) => {
    setSelectedFilterSupplier(supplier);
    if (supplier !== "all") {
      setPoSupplierName(supplier);
    } else {
      setPoSupplierName("");
    }
  };

  const handlePrintPO = () => {
    const itemsToOrder = reorderProducts
      .filter((p) => {
        const draft = poDraftItems[p.id];
        if (!draft || !draft.selected) return false;
        if (
          selectedFilterSupplier !== "all" &&
          p.supplier !== selectedFilterSupplier
        )
          return false;
        return true;
      })
      .map((p) => {
        const draft = poDraftItems[p.id];
        const qty = draft?.qty || 10;
        const costPrice = draft?.costPrice || p.costPrice || 0;
        return {
          id: p.id,
          name: p.name,
          qty,
          costPrice,
          total: qty * costPrice,
        };
      });

    if (itemsToOrder.length === 0) {
      alert(
        isRtl
          ? "الرجاء اختيار منتج واحد على الأقل لإعادة الطلب!"
          : "Please select at least one item to order!",
      );
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const poNumber = `PO-${dateStr}-${randomNum}`;
    const grandTotal = itemsToOrder.reduce((acc, item) => acc + item.total, 0);

    const poData = {
      poNumber,
      date: new Date().toLocaleDateString(isRtl ? "ar-MA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      supplier: {
        name:
          poSupplierName ||
          selectedFilterSupplier ||
          (isRtl ? "مورد غير محدد" : "Unknown Supplier"),
        phone: poSupplierPhone,
        email: poSupplierEmail,
        address: poSupplierAddress,
      },
      notes: poNotes,
      items: itemsToOrder,
      grandTotal,
    };

    setActivePrintPO(poData);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setActivePrintPO(null);
      }, 1000);
    }, 600);
  };

  const handleCompletePO = () => {
    const itemsToOrder = reorderProducts
      .filter((p) => {
        const draft = poDraftItems[p.id];
        if (!draft || !draft.selected) return false;
        if (
          selectedFilterSupplier !== "all" &&
          p.supplier !== selectedFilterSupplier
        )
          return false;
        return true;
      })
      .map((p) => {
        const draft = poDraftItems[p.id];
        const qty = draft?.qty || 10;
        const costPrice = draft?.costPrice || p.costPrice || 0;
        return {
          id: p.id,
          qty,
          costPrice,
        };
      });

    if (itemsToOrder.length === 0) {
      alert(
        isRtl
          ? "الرجاء اختيار منتج واحد على الأقل للمتابعة!"
          : "Please select at least one item first!",
      );
      return;
    }

    setAppData((prev: AppData) => {
      const updatedProducts = prev.products.map((p) => {
        const orderedItem = itemsToOrder.find((item) => item.id === p.id);
        if (orderedItem) {
          const newQty = shouldAddStock ? p.qty + orderedItem.qty : p.qty;
          const newCostPrice = shouldAddStock
            ? orderedItem.costPrice
            : p.costPrice || p.costPrice || 0;
          return {
            ...p,
            qty: newQty,
            costPrice: newCostPrice,
          };
        }
        return p;
      });

      const updatedReorderList = shouldClearReorder
        ? (prev.reorderList || []).filter(
            (id) => !itemsToOrder.some((item) => item.id === id),
          )
        : prev.reorderList || [];

      return {
        ...prev,
        products: updatedProducts,
        reorderList: updatedReorderList,
      };
    });

    alert(
      isRtl
        ? "تمت معالجة الطلب وتحديث المخزون المالي والمخزن بنجاح!"
        : "Order processed and inventory/costs successfully updated!",
    );
  };

  const filteredSalesForTime = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return appData.sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      if (timeRange === "today") {
        return saleDate >= startOfToday;
      } else if (timeRange === "week") {
        return saleDate >= startOfWeek;
      } else if (timeRange === "month") {
        return saleDate >= startOfMonth;
      }
      return true; // all
    });
  }, [appData.sales, timeRange]);

  const totalRev = useMemo(() => {
    return filteredSalesForTime.reduce((s, sale) => s + sale.finalTotal, 0);
  }, [filteredSalesForTime]);

  const totalSalesCount = useMemo(() => {
    return filteredSalesForTime.length;
  }, [filteredSalesForTime]);

  const totalDebt = useMemo(() => {
    return appData.clients.reduce((s, c) => s + (Number(c.debt) || 0), 0);
  }, [appData.clients]);

  const totalProfit = useMemo(() => {
    return filteredSalesForTime.reduce((acc, sale) => {
      const saleProfit = (sale.items || []).reduce((sAcc, item) => {
        const itemProfit =
          (item.price - (item.costPrice || 0)) * (item.qty || 0);
        return sAcc + itemProfit;
      }, 0);
      return acc + (saleProfit - (sale.discount || 0));
    }, 0);
  }, [filteredSalesForTime]);

  const averageSaleValue = useMemo(() => {
    return totalSalesCount > 0 ? totalRev / totalSalesCount : 0;
  }, [totalRev, totalSalesCount]);

  const profitMarginPercent = useMemo(() => {
    return totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;
  }, [totalProfit, totalRev]);

  const topProducts = useMemo(() => {
    const counts: Record<
      string,
      { qty: number; revenue: number; price: number; name: string }
    > = {};
    filteredSalesForTime.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const key = item.productId || item.name;
        if (!counts[key]) {
          counts[key] = {
            qty: 0,
            revenue: 0,
            price: item.price,
            name: item.name,
          };
        }
        counts[key].qty += item.qty || 0;
        counts[key].revenue += item.price * (item.qty || 0);
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredSalesForTime]);

  const salesData = useMemo(() => {
    const days: any = {};
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };

    appData.sales.forEach((sale) => {
      const d = new Date(sale.date).toLocaleDateString(
        isRtl ? "ar-MA" : "en-US",
        dateOptions,
      );
      const saleProfit =
        (sale.items || []).reduce((sAcc, item) => {
          return sAcc + (item.price - (item.costPrice || 0)) * (item.qty || 0);
        }, 0) - (sale.discount || 0);

      if (!days[d]) days[d] = { revenue: 0, profit: 0 };
      days[d].revenue += sale.finalTotal;
      days[d].profit += saleProfit;
    });

    return Object.keys(days)
      .map((date) => ({
        date,
        revenue: parseFloat(days[date].revenue.toFixed(2)),
        profit: parseFloat(days[date].profit.toFixed(2)),
      }))
      .slice(-10); // Last 10 days
  }, [appData.sales, isRtl]);

  const lowStockProducts = useMemo(() => {
    return appData.products.filter((p) => p.qty <= (p.minQty || 5));
  }, [appData.products]);

  const debtAlertClients = useMemo(() => {
    return appData.clients.filter((c) => {
      const status = getDebtStatus(c, isRtl);
      return (
        status &&
        (status.status === "overdue" ||
          status.status === "due_today" ||
          status.status === "near")
      );
    });
  }, [appData.clients, isRtl]);

  const toggleToReorder = (id: string) => {
    setAppData((prev: AppData) => {
      const reorderList = prev.reorderList || [];
      const exists = reorderList.includes(id);
      return {
        ...prev,
        reorderList: exists
          ? reorderList.filter((rid) => rid !== id)
          : [...reorderList, id],
      };
    });
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Sub-tabs Selector for combined Reports and Analytics */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/50 w-full sm:w-fit font-sans">
        <button
          onClick={() => setSubTab("analytics")}
          className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer flex items-center gap-2 justify-center ${
            subTab === "analytics"
              ? "bg-white text-slate-800 shadow-xl shadow-slate-200/50 border border-slate-200/50 scale-[1.02]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 size={14} />
          {isRtl ? "التحليلات الذكية والأرباح" : "Smart Analytics"}
        </button>
        <button
          onClick={() => setSubTab("reports")}
          className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer flex items-center gap-2 justify-center ${
            subTab === "reports"
              ? "bg-white text-slate-800 shadow-xl shadow-slate-200/50 border border-slate-200/50 scale-[1.02]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <CalendarDays size={14} />
          {isRtl ? "تقارير المبيعات الدورية" : "Sales Reports"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === "analytics" ? (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-10"
          >
            {/* Time-range Filters */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full`}>
              <div
                className={`flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 w-fit ${isRtl ? "ml-auto" : "mr-auto"}`}
              >
                {(["all", "month", "week", "today"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${
                      timeRange === range
                        ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {range === "all" && (isRtl ? "الكل" : "All")}
                    {range === "month" && (isRtl ? "30 يوم" : "30 Days")}
                    {range === "week" && (isRtl ? "7 أيام" : "7 Days")}
                    {range === "today" && (isRtl ? "اليوم" : "Today")}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAIEvaluation}
                  disabled={aiLoading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-violet-600/10 disabled:opacity-50"
                >
                  <Sparkles size={14} className={aiLoading ? "animate-spin" : ""} />
                  {isRtl ? "استشارة مستشار المحل بالذكاء الاصطناعي" : "Consult AI Store Advisor"}
                </button>
              </div>
            </div>

            {/* AI Advisor Panel */}
            {(aiLoading || aiResult || aiError) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card border-violet-200 bg-gradient-to-br from-violet-50/20 to-indigo-50/20 relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 h-40 w-40 bg-violet-400/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className={`flex items-center gap-3 mb-8 ${isRtl ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
                  <div className="h-10 w-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-600 border border-violet-200">
                    <Sparkles size={20} className={aiLoading ? "animate-pulse" : ""} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800 italic tracking-tight">
                      {isRtl ? "مساعد المحل الذكي بالذكاء الاصطناعي (Gemini AI)" : "AI Business Intelligence Model (Gemini AI)"}
                    </h4>
                    <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mt-0.5">
                      {isRtl ? "توصيات استراتيجية وتنبؤات للمخزن والمبيعات" : "Interactive stock forecasts & pricing strategies"}
                    </p>
                  </div>
                </div>

                {aiLoading && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full border-t-2 border-violet-600 animate-spin" />
                      <Sparkles size={16} className="text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                    </div>
                    <div className="space-y-1 text-slate-600">
                      <p className="text-xs font-black uppercase tracking-wider">
                        {isRtl ? "جاري تحليل حركة المبيعات وتوقع المخزون..." : "Running advanced calculations over store datasets..."}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">
                        {isRtl ? "نفحص السلع والديون وسرعة خروج المنتجات لتزويدك بالخطة المثالية" : "Analyzing product velocity, out-of-stock patterns, and active cash flows"}
                      </p>
                    </div>
                  </div>
                )}

                {aiError && (
                  <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      <p className="text-xs font-black uppercase tracking-wider">{isRtl ? "فشل تفعيل التحليل الذكي" : "Evaluation Error"}</p>
                    </div>
                    <p className={`text-xs font-bold leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
                      {aiError}
                    </p>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleAIEvaluation}
                        className="px-4 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-rose-700 transition-all cursor-pointer"
                      >
                        {isRtl ? "إعادة المحاولة" : "Retry Analysis"}
                      </button>
                    </div>
                  </div>
                )}

                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  >
                    {/* Stratégie */}
                    <div className="p-6 rounded-[32px] bg-white border border-slate-200/60 shadow-sm flex flex-col h-full justify-between">
                      <div>
                        <div className={`flex items-center gap-2 mb-6 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="p-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                            {isRtl ? "الملخص الاستراتيجي" : "Commercial KPI"}
                          </span>
                          <span className="text-xs font-black text-slate-400 font-mono">01</span>
                        </div>
                        
                        <h5 className={`text-base font-black text-slate-800 mb-4 italic tracking-tight ${isRtl ? "text-right" : "text-left"}`}>
                          {isRtl ? "تحليل الأداء التجاري والاستراتيجي" : "Commercial Summary"}
                        </h5>
                        
                        <p className={`text-xs text-slate-600 font-bold leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
                          {aiResult.summary}
                        </p>
                      </div>
                    </div>

                    {/* Prédictions Stock */}
                    <div className="p-6 rounded-[32px] bg-white border border-slate-200/60 shadow-sm flex flex-col h-full justify-between">
                      <div>
                        <div className={`flex items-center gap-2 mb-6 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="p-1 px-2.5 rounded-lg bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider border border-amber-100">
                            {isRtl ? "الاستنفاد المتوقع" : "Stock Exhaustion"}
                          </span>
                          <span className="text-xs font-black text-slate-400 font-mono">02</span>
                        </div>

                        <h5 className={`text-base font-black text-slate-800 mb-4 italic tracking-tight ${isRtl ? "text-right" : "text-left"}`}>
                          {isRtl ? "توقعات نفاد المخزون القريب" : "Stock Exhaustion Forecasts"}
                        </h5>

                        <div className="space-y-4">
                          {(aiResult.predictions || []).map((item, idx) => (
                            <div
                              key={idx}
                              className={`flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100/50 ${isRtl ? "flex-row-reverse text-right" : "flex-row text-left"}`}
                            >
                              <div className="truncate max-w-[140px]">
                                <p className="text-xs font-black text-slate-800 truncate">{item.productName}</p>
                                <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{item.prediction}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                                item.urgency === "high"
                                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                                  : item.urgency === "medium"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-sky-50 text-sky-700 border border-sky-100"
                              }`}>
                                {item.urgency === "high" ? (isRtl ? "قصوى" : "High") : item.urgency === "medium" ? (isRtl ? "متوسطة" : "Med") : (isRtl ? "منخفضة" : "Low")}
                              </span>
                            </div>
                          ))}
                          {(aiResult.predictions || []).length === 0 && (
                            <p className="text-xs text-slate-400 italic text-center py-6">
                              {isRtl ? "لا توجد أي توقعات بنفاد الكميات حالياً" : "All quantities healthy or stale"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Conseils d'achat */}
                    <div className="p-6 rounded-[32px] bg-white border border-slate-200/60 shadow-sm flex flex-col h-full justify-between">
                      <div>
                        <div className={`flex items-center gap-2 mb-6 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="p-1 px-2.5 rounded-lg bg-violet-50 text-violet-700 text-[9px] font-black uppercase tracking-wider border border-violet-100">
                            {isRtl ? "التوريد والمشتريات" : "Supplier Advice"}
                          </span>
                          <span className="text-xs font-black text-slate-400 font-mono">03</span>
                        </div>

                        <h5 className={`text-base font-black text-slate-800 mb-4 italic tracking-tight ${isRtl ? "text-right" : "text-left"}`}>
                          {isRtl ? "طلب المستلزمات والتسعير" : "Operating Proposals"}
                        </h5>

                        <ul className="space-y-4">
                          {(aiResult.suggestions || []).map((adv, idx) => (
                            <li key={idx} className={`flex items-start gap-2.5 text-xs text-slate-600 font-bold leading-relaxed ${isRtl ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
                              <span className="p-1 rounded bg-violet-50 text-violet-600 text-[9px] font-mono shrink-0">#{idx + 1}</span>
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Total Revenue */}
              <div className="p-8 rounded-[40px] bg-primary text-white shadow-2xl shadow-primary/20 relative overflow-hidden group hover:scale-[1.02] transition-all">
                <Banknote className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-3">
                  {isRtl ? "المدخول المالي" : "Total Income"}
                </p>
                <h3 className="text-4xl font-black italic tracking-tighter mb-2">
                  {totalRev.toFixed(2)}
                </h3>
                <p className="text-[10px] font-bold text-white/70">
                  {totalSalesCount}{" "}
                  {isRtl ? "عمليات بيع ناجحة" : "Successful sales"}
                </p>
              </div>
              {/* Net Profit */}
              <div className="p-8 rounded-[40px] bg-emerald-600 text-white shadow-2xl shadow-emerald-400/20 relative overflow-hidden group hover:scale-[1.02] transition-all">
                <TrendingUp className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-3">
                  {isRtl ? "صافي الأرباح" : "Net Profits"}
                </p>
                <h3 className="text-4xl font-black italic tracking-tighter mb-2">
                  {totalProfit.toFixed(2)}
                </h3>
                <p className="text-[10px] font-bold text-white/70">
                  {isRtl ? "معدل ربح متميز" : "Optimized net returns"}
                </p>
              </div>
              {/* Net Margin */}
              <div className="p-8 rounded-[40px] bg-amber-500 text-white shadow-2xl shadow-amber-500/20 relative overflow-hidden group hover:scale-[1.02] transition-all">
                <ShoppingBag className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-4">
                  {isRtl ? "هامش الربح الصافي" : "Net Margin"}
                </p>
                <h3 className="text-4xl font-black italic tracking-tighter mb-2">
                  %{profitMarginPercent.toFixed(1)}
                </h3>
                <p className="text-[10px] font-bold text-white/70">
                  {isRtl
                    ? `معدل السلة: ${averageSaleValue.toFixed(1)} DH`
                    : `Avg: ${averageSaleValue.toFixed(1)} DH`}
                </p>
              </div>
              <div className="p-8 rounded-[40px] bg-slate-900 border border-slate-800 text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden group hover:scale-[1.02] transition-all">
                <TrendingDown className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-4">
                  {isRtl ? "إجمالي الديون المعلقة" : "Total Customers Debts"}
                </p>
                <h3 className="text-4xl font-black italic tracking-tighter mb-2">
                  {totalDebt.toFixed(2)} DH
                </h3>
                <p className="text-[10px] font-bold text-rose-400">
                  {isRtl
                    ? "يتوجب متابعة استخلاصها"
                    : "Requires follow-up calls"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-10 rounded-[40px] bg-white border border-slate-200 shadow-xl overflow-hidden flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                  <h4 className="text-xl font-black text-slate-800 italic tracking-tight">
                    {isRtl
                      ? "حركة المبيعات والأرباح اليومية"
                      : "Daily Sales & Profits Chart"}
                  </h4>
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">
                      {isRtl ? "مؤشر الأرباح" : "Profit Indicator"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowProfitSeries(!showProfitSeries)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        showProfitSeries ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          showProfitSeries
                            ? isRtl
                              ? "-translate-x-5"
                              : "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        salesData.length > 0
                          ? salesData
                          : [{ date: "---", revenue: 0, profit: 0 }]
                      }
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#00000005"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#00000020"
                        fontSize={10}
                        fontWeight="900"
                      />
                      <YAxis
                        stroke="#00000020"
                        fontSize={10}
                        fontWeight="900"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "16px",
                          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
                        }}
                        itemStyle={{ fontWeight: "900" }}
                      />
                      <Bar
                        dataKey="revenue"
                        name={isRtl ? "المداخيل" : "Revenue"}
                        fill="var(--primary)"
                        radius={[8, 8, 0, 0]}
                        barSize={18}
                      />
                      {showProfitSeries && (
                        <Bar
                          dataKey="profit"
                          name={isRtl ? "الأرباح" : "Profit"}
                          fill="#10b981"
                          radius={[8, 8, 0, 0]}
                          barSize={18}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-10 rounded-[40px] bg-white border border-slate-200 shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] block mb-2">
                    {isRtl ? "السلع الأكثر رواجاً" : "TOP SELLING"}
                  </span>
                  <h4 className="text-xl font-black text-slate-800 italic mb-10 tracking-tight">
                    {isRtl ? "المبيعات الأعلى حركة" : "Best Selling Items"}
                  </h4>
                </div>

                <div className="space-y-6 flex-1">
                  {topProducts.map((p, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 truncate max-w-[160px] italic">
                          {p.name}
                        </span>
                        <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {p.qty} {isRtl ? "مباع" : "units"}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-50 overflow-hidden border border-slate-100/50">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (p.qty / (topProducts[0]?.qty || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {topProducts.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 opacity-40">
                      <ShoppingBag size={48} strokeWidth={1.5} />
                      <p className="text-[10px] uppercase font-black tracking-widest leading-none">
                        {isRtl
                          ? "بانتظار اتمام معاملات بيع"
                          : "No sales registered"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Debt Due Alerts */}
              <div className="p-10 rounded-[40px] bg-white border border-slate-200 shadow-xl flex flex-col justify-[space-between]">
                <div>
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] block mb-2">
                    {isRtl ? "متابعة الأقساط" : "DEBT RECOVERY"}
                  </span>
                  <h4 className="text-xl font-black text-slate-800 italic mb-10 tracking-tight font-sans">
                    {isRtl
                      ? "استحقاق مديونية الزبناء"
                      : "Client Debt Deadlines"}
                  </h4>
                </div>

                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {debtAlertClients.map((c) => {
                    const status = getDebtStatus(c, isRtl);
                    return (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between p-4 rounded-[24px] border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all ${isRtl ? "flex-row-reverse" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100/50 flex items-center justify-center text-rose-500 shrink-0">
                            <Clock size={16} />
                          </div>
                          <div className={isRtl ? "text-right" : "text-left"}>
                            <p className="text-xs font-black text-slate-800 leading-tight mb-1 truncate max-w-[120px]">
                              {c.name}
                            </p>
                            <p
                              className={`text-[8px] px-2 py-0.5 rounded font-black inline-block leading-none ${status?.colorClass || ""}`}
                            >
                              {status?.label}
                            </p>
                          </div>
                        </div>
                        <div
                          className={
                            isRtl
                              ? "text-left font-mono shrink-0"
                              : "text-right font-mono shrink-0"
                          }
                        >
                          <span className="text-xs font-black text-rose-600 tracking-tight whitespace-nowrap">
                            {c.debt.toFixed(2)} DH
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {debtAlertClients.length === 0 && (
                    <div className="py-16 text-center flex flex-col items-center justify-center space-y-3 opacity-40">
                      <ShieldCheck
                        size={40}
                        className="text-emerald-500"
                        strokeWidth={1.5}
                      />
                      <p className="text-[9px] uppercase font-black tracking-widest leading-none">
                        {isRtl
                          ? "لا توجد ديون مستحقة حالياً"
                          : "All accounts are clear"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Low Stock Warnings */}
              <div className="p-10 rounded-[40px] bg-white border border-slate-200 shadow-xl">
                <div className="flex items-center justify-between mb-10">
                  <h4 className="text-xl font-black text-slate-800 italic tracking-tight">
                    {isRtl ? "تنبيهات نقص المخزون" : "Low Stock Alerts"}
                  </h4>
                  <div className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase border border-red-100">
                    {lowStockProducts.length} {isRtl ? "أصناف" : "Items"}
                  </div>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-6 rounded-[24px] bg-slate-50 border border-slate-100 hover:border-red-200 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                          <AlertCircle size={20} />
                        </div>
                        <div className={isRtl ? "text-right" : "text-left"}>
                          <p className="text-sm font-black text-slate-800 mb-1">
                            {p.name}
                          </p>
                          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                            {isRtl ? "المخزون الحالي:" : "Current:"} {p.qty} /{" "}
                            {isRtl ? "الأدنى:" : "Min:"} {p.minQty || 5}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleToReorder(p.id)}
                        className={`p-3 rounded-xl transition-all shadow-sm ${(appData.reorderList || []).includes(p.id) ? "bg-primary text-white" : "bg-white text-slate-400 hover:text-primary"}`}
                      >
                        {(appData.reorderList || []).includes(p.id) ? (
                          <Plus size={20} />
                        ) : (
                          <ListFilter size={20} />
                        )}
                      </button>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <div className="py-20 text-center text-slate-300 italic font-black uppercase tracking-widest border border-dashed border-slate-200 rounded-[24px]">
                      {isRtl ? "المخزون كافٍ حالياً" : "Stock is sufficient"}
                    </div>
                  )}
                </div>
              </div>

              {/* Reorder List */}
              <div className="p-10 rounded-[40px] bg-white border border-slate-200 shadow-xl">
                <div className="flex items-center justify-between mb-10">
                  <h4 className="text-xl font-black text-slate-800 italic tracking-tight">
                    {isRtl ? "قائمة إعادة الطلب" : "Reorder List"}
                  </h4>
                  <Archive size={24} className="text-primary" />
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {reorderProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-6 rounded-[24px] bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Package size={20} />
                        </div>
                        <div className={isRtl ? "text-right" : "text-left"}>
                          <p className="text-sm font-black text-slate-800 mb-1">
                            {p.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {p.supplier ||
                              (isRtl ? "المورد غير محدد" : "Unknown supplier")}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleToReorder(p.id)}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {reorderProducts.length === 0 && (
                    <div className="py-20 text-center text-slate-300 italic font-black uppercase tracking-widest border border-dashed border-slate-200 rounded-[24px]">
                      {isRtl ? "القائمة فارغة" : "List is empty"}
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Order Generator */}
              <div
                className="p-10 rounded-[40px] bg-white border border-slate-200 shadow-xl flex flex-col justify-between"
                id="po-generator-container"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block mb-1">
                        {isRtl ? "التوريد الذكي" : "SMART PROCUREMENT"}
                      </span>
                      <h4
                        className="text-xl font-black text-slate-800 italic tracking-tight"
                        id="po-generator-title"
                      >
                        {isRtl ? "بوابة طلبات الموردين" : "Supplier PO Generator"}
                      </h4>
                    </div>
                    <Printer size={24} className="text-primary animate-pulse" />
                  </div>

                  {reorderProducts.length === 0 ? (
                    <div className="py-20 text-center text-slate-300 italic font-black uppercase tracking-widest border border-dashed border-slate-200 rounded-[24px]">
                      {isRtl ? "قم بإضافة منتجات أولاً" : "Add products to reorder first"}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Supplier Select filter */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          {isRtl ? "اختيار المورد المستهدف:" : "FILTER BY SUPPLIER:"}
                        </label>
                        <select
                          value={selectedFilterSupplier}
                          onChange={(e) => handleFilterSupplierChange(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-700 outline-none focus:border-primary"
                          id="po-supplier-select"
                        >
                          <option value="all">
                            {isRtl ? "جميع الموردين / مخصص" : "All Suppliers / Custom"}
                          </option>
                          {uniqueSuppliers.map((sup) => (
                            <option key={sup} value={sup}>
                              {sup}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Supplier info (Editable fields) */}
                      <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <input
                            type="text"
                            placeholder={isRtl ? "اسم المورد المسؤول" : "Supplier Company Name"}
                            value={poSupplierName}
                            onChange={(e) => setPoSupplierName(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-750 outline-none focus:border-primary"
                            id="po-supplier-name-input"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder={isRtl ? "الهاتف" : "Phone"}
                            value={poSupplierPhone}
                            onChange={(e) => setPoSupplierPhone(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-755 outline-none focus:border-primary"
                          />
                          <input
                            type="text"
                            placeholder={isRtl ? "البريد الإلكتروني" : "Email Address"}
                            value={poSupplierEmail}
                            onChange={(e) => setPoSupplierEmail(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-755 outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder={isRtl ? "العنوان" : "Address"}
                            value={poSupplierAddress}
                            onChange={(e) => setPoSupplierAddress(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-755 outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Items table in PO draft */}
                      <div className="max-h-[180px] overflow-y-auto pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50 custom-scrollbar">
                        <table className="w-full text-left border-collapse" dir={isRtl ? "rtl" : "ltr"}>
                          <thead>
                            <tr className="border-b border-slate-200 text-[8px] font-black uppercase text-slate-400">
                              <th className="pb-2 w-8"></th>
                              <th className={`pb-2 ${isRtl ? "text-right" : "text-left"}`}>
                                {isRtl ? "المادة" : "Item"}
                              </th>
                              <th className="pb-2 text-center w-16">
                                {isRtl ? "الكمية" : "Qty"}
                              </th>
                              <th className={`pb-2 w-16 ${isRtl ? "text-left" : "text-right"}`}>
                                {isRtl ? "التكلفة" : "Cost"}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100/50">
                            {reorderProducts
                              .filter(
                                (p) =>
                                  selectedFilterSupplier === "all" ||
                                  p.supplier === selectedFilterSupplier
                              )
                              .map((p) => {
                                const draft = poDraftItems[p.id] || {
                                  qty: 10,
                                  costPrice: p.costPrice || 0,
                                  selected: true,
                                };
                                return (
                                  <tr key={p.id} className="text-[10px]">
                                    <td className="py-2.5">
                                      <input
                                        type="checkbox"
                                        checked={draft.selected}
                                        onChange={(e) =>
                                          setPoDraftItems((prev) => ({
                                            ...prev,
                                            [p.id]: {
                                              ...draft,
                                              selected: e.target.checked,
                                            },
                                          }))
                                        }
                                        className="rounded text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer accent-amber-500"
                                      />
                                    </td>
                                    <td
                                      className={`py-2.5 font-bold text-slate-700 truncate max-w-[90px] ${
                                        isRtl ? "text-right" : "text-left"
                                      }`}
                                    >
                                      {p.name}
                                    </td>
                                    <td className="py-2.5">
                                      <input
                                        type="number"
                                        value={draft.qty}
                                        onChange={(e) =>
                                          setPoDraftItems((prev) => ({
                                            ...prev,
                                            [p.id]: {
                                              ...draft,
                                              qty: Math.max(
                                                1,
                                                parseInt(e.target.value) || 0
                                              ),
                                            },
                                          }))
                                        }
                                        className="w-12 h-6 text-center border border-slate-200 rounded font-bold font-mono outline-none focus:border-primary bg-white text-[10px]"
                                      />
                                    </td>
                                    <td className="py-2.5">
                                      <input
                                        type="number"
                                        value={draft.costPrice}
                                        step="any"
                                        onChange={(e) =>
                                          setPoDraftItems((prev) => ({
                                            ...prev,
                                            [p.id]: {
                                              ...draft,
                                              costPrice: Math.max(
                                                0,
                                                parseFloat(e.target.value) || 0
                                              ),
                                            },
                                          }))
                                        }
                                        className={`w-14 h-6 text-center border border-slate-200 rounded font-bold font-mono outline-none focus:border-primary bg-white text-[10px] ${
                                          isRtl ? "text-left" : "text-right"
                                        }`}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>

                      {/* Note or message details */}
                      <div>
                        <textarea
                          placeholder={
                            isRtl
                              ? "تعليمات الشحن أو ملاحظات إضافية للمورد..."
                              : "Shipping instructions or comments for supplier..."
                          }
                          value={poNotes}
                          onChange={(e) => setPoNotes(e.target.value)}
                          rows={2}
                          className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 outline-none focus:border-primary resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {reorderProducts.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                    {/* Controls for completion flags */}
                    <div className="space-y-2 text-[10px] font-bold text-slate-400">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shouldAddStock}
                          onChange={(e) => setShouldAddStock(e.target.checked)}
                          className="rounded accent-amber-500 h-3.5 w-3.5"
                          id="po-add-stock-checkbox"
                        />
                        <span>
                          {isRtl
                            ? "إضافة الكميات تلقائياً للمخزون عند الاكتمال"
                            : "Add quantities to stock on complete"}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shouldClearReorder}
                          onChange={(e) => setShouldClearReorder(e.target.checked)}
                          className="rounded accent-amber-500 h-3.5 w-3.5"
                          id="po-clear-reorder-checkbox"
                        />
                        <span>
                          {isRtl
                            ? "إزالة المواد من قائمة الطلبات بمجرد الاكتمال"
                            : "Clear items from reorder checklist on complete"}
                        </span>
                      </label>
                    </div>

                    {/* Action triggers */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handlePrintPO}
                        className="h-12 bg-amber-500 border border-amber-400 hover:bg-amber-600 text-white text-xs font-black uppercase rounded-2xl tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        id="po-print-btn"
                      >
                        <Printer size={16} />
                        <span>{isRtl ? "تصدير طلب PDF" : "Print PDF"}</span>
                      </button>
                      <button
                        onClick={handleCompletePO}
                        className="h-12 bg-emerald-500 border border-emerald-400 hover:bg-emerald-600 text-white text-xs font-black uppercase rounded-2xl tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        id="po-complete-btn"
                      >
                        <ShieldCheck size={16} />
                        <span>{isRtl ? "إتمام وحفظ" : "Complete PO"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {activePrintPO &&
              createPortal(
                <div className="printable-only">
                  <PrintablePurchaseOrder
                    po={activePrintPO}
                    isRtl={isRtl}
                    appData={appData}
                  />
                </div>,
                document.body
              )}
          </motion.div>
        ) : (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ReportsView appData={appData} t={t} isRtl={isRtl} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ClientsView({
  appData,
  setAppData,
  t,
  isRtl,
  currentUser,
}: {
  appData: AppData;
  setAppData: any;
  t: any;
  isRtl: boolean;
  currentUser?: any;
}) {
  const [activeSubTab, setActiveSubTab] = useState<"clients" | "checks">(
    "clients",
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "cheque">("cash");
  const [paymentChequeNo, setPaymentChequeNo] = useState("");
  const [paymentBankName, setPaymentBankName] = useState("CIH Bank");
  const [paymentChequeDueDate, setPaymentChequeDueDate] = useState("");
  const [paymentCustomBank, setPaymentCustomBank] = useState("");

  // Add Item states
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    address: "",
    dueDate: "",
    initialDebt: "",
  });
  const [newCheque, setNewCheque] = useState({
    clientName: "",
    chequeNumber: "",
    amount: "",
    bankName: "CIH Bank",
    dueDate: "",
  });
  const [chequeCustomBank, setChequeCustomBank] = useState("");

  // Walk-In Return States
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInSearch, setWalkInSearch] = useState("");
  const [walkInProduct, setWalkInProduct] = useState<Product | null>(null);
  const [walkInQty, setWalkInQty] = useState("1");
  const [walkInPrice, setWalkInPrice] = useState("");

  // Handle Client creation with initial debt support
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    const initialDebtVal = parseFloat(newClient.initialDebt) || 0;
    const client: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClient.name,
      phone: newClient.phone,
      address: newClient.address,
      debt: initialDebtVal,
      paymentHistory:
        initialDebtVal > 0
          ? [
              {
                id: Math.random().toString(36).substr(2, 9),
                amount: -initialDebtVal,
                date: new Date().toISOString(),
                method: isRtl
                  ? "رصيد أولي (دين قديم)"
                  : "Initial Balance (Old Debt)",
              },
            ]
          : [],
      createdAt: new Date().toISOString(),
      dueDate: newClient.dueDate || undefined,
    };

    setAppData((prev: AppData) => ({
      ...prev,
      clients: [client, ...prev.clients],
    }));
    setNewClient({
      name: "",
      phone: "",
      address: "",
      dueDate: "",
      initialDebt: "",
    });
  };

  // Handle Cheque creation
  const handleAddCheque = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheque.clientName || !newCheque.chequeNumber || !newCheque.amount)
      return;
    const amountVal = parseFloat(newCheque.amount) || 0;

    const cheque: Cheque = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: newCheque.clientName,
      chequeNumber: newCheque.chequeNumber,
      amount: amountVal,
      bankName:
        newCheque.bankName === "Other"
          ? chequeCustomBank || (isRtl ? "بنك آخر" : "Other Bank")
          : newCheque.bankName,
      dueDate: newCheque.dueDate,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setAppData((prev: AppData) => ({
      ...prev,
      cheques: [cheque, ...(prev.cheques || [])],
    }));

    setNewCheque({
      clientName: "",
      chequeNumber: "",
      amount: "",
      bankName: "CIH Bank",
      dueDate: "",
    });
    setChequeCustomBank("");
  };

  // Walk-In Return Submit logic
  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInProduct) return;
    const qty = parseInt(walkInQty) || 0;
    const price = parseFloat(walkInPrice) || 0;
    if (qty <= 0) return;

    setAppData((prev: AppData) => {
      // 1. Increment database product qty
      const updatedProducts = prev.products.map((p) => {
        if (p.id === walkInProduct.id) {
          return { ...p, qty: p.qty + qty };
        }
        return p;
      });

      // 2. Add as offset refund sale
      const refundSale: Sale = {
        id: "refund_" + Math.random().toString(36).substr(2, 9),
        total: -(qty * price),
        discount: 0,
        finalTotal: -(qty * price),
        paymentMethod: "cash",
        items: [
          {
            productId: walkInProduct.id,
            name: `${walkInProduct.name} (${isRtl ? "إرجاع عابر" : "Refund"})`,
            qty: -qty,
            price: price,
            costPrice: walkInProduct.costPrice || 0,
          },
        ],
        date: new Date().toISOString(),
        userId: prev.user?.id || "admin",
      };

      return {
        ...prev,
        products: updatedProducts,
        sales: [refundSale, ...prev.sales],
      };
    });

    setShowWalkInModal(false);
    setWalkInProduct(null);
    setWalkInQty("1");
    setWalkInPrice("");
    setWalkInSearch("");
  };

  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClient) return;
    setAppData((prev: AppData) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === editClient.id ? editClient : c,
      ),
    }));
    setEditClient(null);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);

    setAppData((prev: AppData) => {
      let activeClientName = "";
      const resolvedBankName =
        paymentBankName === "Other"
          ? paymentCustomBank || (isRtl ? "بنك آخر" : "Other Bank")
          : paymentBankName;

      const updatedClients = prev.clients.map((c) => {
        if (c.id === showPaymentModal) {
          activeClientName = c.name;
          const currentDebt = Number(c.debt) || 0;

          let methodStr = isRtl ? "نقداً (تسديد)" : "Cash Payment";
          if (paymentMethod === "cheque") {
            methodStr = isRtl
              ? `شيك رقم ${paymentChequeNo} (${resolvedBankName})`
              : `Cheque No ${paymentChequeNo} (${resolvedBankName})`;
          }

          return {
            ...c,
            debt: Math.max(0, currentDebt - amount),
            paymentHistory: [
              {
                id: Math.random().toString(36).substr(2, 9),
                amount,
                date: new Date().toISOString(),
                method: methodStr,
              },
              ...(c.paymentHistory || []),
            ],
          };
        }
        return c;
      });

      let updatedCheques = prev.cheques || [];
      if (paymentMethod === "cheque") {
        const newCh: Cheque = {
          id: Math.random().toString(36).substr(2, 9),
          clientName: activeClientName || (isRtl ? "زبون" : "Client"),
          chequeNumber: paymentChequeNo,
          amount: amount,
          bankName: resolvedBankName,
          dueDate:
            paymentChequeDueDate || new Date().toISOString().split("T")[0],
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        updatedCheques = [newCh, ...updatedCheques];
      }

      return {
        ...prev,
        clients: updatedClients,
        cheques: updatedCheques,
      };
    });

    setShowPaymentModal(null);
    setPaymentAmount("");
    setPaymentMethod("cash");
    setPaymentChequeNo("");
    setPaymentBankName("CIH Bank");
    setPaymentCustomBank("");
    setPaymentChequeDueDate("");
  };

  const handleChequeStatusChange = (
    id: string,
    newStatus: "pending" | "paid" | "bounced",
  ) => {
    setAppData((prev: AppData) => ({
      ...prev,
      cheques: (prev.cheques || []).map((ch) =>
        ch.id === id ? { ...ch, status: newStatus } : ch,
      ),
    }));
  };

  const handleDeleteCheque = (id: string) => {
    if (
      confirm(
        isRtl
          ? "هل أنت متأكد من حذف هذا الشيك؟"
          : "Are you sure you want to delete this cheque?",
      )
    ) {
      setAppData((prev: AppData) => ({
        ...prev,
        cheques: (prev.cheques || []).filter((ch) => ch.id !== id),
      }));
    }
  };

  // Filtering
  const filteredClients = appData.clients.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || "").includes(searchTerm),
  );

  const filteredCheques = (appData.cheques || []).filter(
    (ch) =>
      (ch.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ch.chequeNumber || "").includes(searchTerm) ||
      (ch.bankName || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Walk-in products fuzzy search
  const filteredWalkInProducts = useMemo(() => {
    if (!walkInSearch) return [];
    return appData.products
      .filter(
        (p) =>
          (p.name || "").toLowerCase().includes(walkInSearch.toLowerCase()) ||
          (p.barcode || "").includes(walkInSearch),
      )
      .slice(0, 5);
  }, [appData.products, walkInSearch]);

  const getBankBadgeStyle = (bankName: string) => {
    const name = bankName.toLowerCase();
    if (name.includes("cih")) {
      return "bg-blue-50 text-blue-600 border border-blue-100";
    } else if (
      name.includes("populaire") ||
      name.includes("banque populaire")
    ) {
      return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    } else if (name.includes("attijari")) {
      return "bg-amber-50 text-amber-700 border border-amber-200";
    } else if (name.includes("bmce") || name.includes("africa")) {
      return "bg-indigo-50 text-indigo-600 border border-indigo-100";
    } else if (name.includes("société") || name.includes("generale")) {
      return "bg-red-50 text-red-600 border border-red-100";
    } else if (name.includes("agricole")) {
      return "bg-green-50 text-green-700 border border-green-200";
    } else {
      return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      {/* 1. TOP HEADER & SUB-TABS (MATCHING SCREENSHOT) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        {/* Toggle segmented capsule sub-tabs (top left) */}
        <div className="bg-slate-100/80 p-1.5 rounded-full flex items-center gap-1.5 self-start border border-slate-200/50">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("clients");
              setSearchTerm("");
            }}
            className={`px-8 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              activeSubTab === "clients"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isRtl ? "الزبناء" : "Clients"}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("checks");
              setSearchTerm("");
            }}
            className={`px-8 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              activeSubTab === "checks"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isRtl ? "الشيكات" : "Cheques"}
          </button>
        </div>

        {/* Elegant typography header (top right) */}
        <div
          className={`flex items-center gap-4 ${isRtl ? "flex-row" : "flex-row-reverse"} self-end md:self-auto`}
        >
          <div className={isRtl ? "text-right" : "text-left font-sans"}>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {activeSubTab === "clients"
                ? isRtl
                  ? "الزبناء"
                  : "Clients"
                : isRtl
                  ? "الشيكات"
                  : "Cheques"}
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mt-0.5">
              {activeSubTab === "clients"
                ? "MANAGE_YOUR_ACCOUNTS"
                : "MANAGE_YOUR_CHEQUES"}
            </span>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-md border border-orange-100 shrink-0">
            {activeSubTab === "clients" ? (
              <Users size={26} strokeWidth={2.5} />
            ) : (
              <CreditCard size={26} strokeWidth={2.5} />
            )}
          </div>
        </div>
      </div>

      {/* 2. ADDING INTERACTIVE FORM CARD (ROUNDED-4xl WHITE BOX IN SCREENSHOT) */}
      <div className="bg-white rounded-[40px] p-10 border border-slate-200/80 shadow-xl relative overflow-hidden">
        {activeSubTab === "clients" ? (
          <div>
            {/* Form indicator bullet */}
            <div
              className={`flex items-center gap-2 mb-6 ${isRtl ? "justify-start" : "justify-end"}`}
            >
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                {isRtl ? "إضافة زبون" : "Add Customer"}
              </span>
            </div>

            {/* Client Add horizontal row flow */}
            <form
              onSubmit={handleAddClient}
              className={`grid grid-cols-1 md:grid-cols-6 gap-4 items-end ${isRtl ? "text-right" : "text-left"}`}
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block px-1">
                  {isRtl ? "اسم الزبون" : "Customer Name"}
                </label>
                <input
                  required
                  type="text"
                  placeholder={isRtl ? "اسم الزبون" : "Customer Name"}
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-5 text-xs font-bold text-slate-800 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block px-1">
                  {isRtl ? "الهاتف" : "Phone"}
                </label>
                <input
                  type="text"
                  placeholder="06XXXXXXXX"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-5 text-xs font-bold font-mono text-slate-800 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block px-1">
                  {isRtl ? "العنوان" : "Address"}
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? "العنوان" : "Address"}
                  value={newClient.address}
                  onChange={(e) =>
                    setNewClient({ ...newClient, address: e.target.value })
                  }
                  className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-5 text-xs font-bold text-slate-800 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block px-1">
                  {isRtl ? "تاريخ الاستحقاق" : "Due Date"}
                </label>
                <input
                  type="date"
                  value={newClient.dueDate}
                  onChange={(e) =>
                    setNewClient({ ...newClient, dueDate: e.target.value })
                  }
                  className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-5 text-xs font-bold text-slate-800 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block px-1">
                  {isRtl ? "دين قديم / رصيد أولي" : "Previous Debt"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newClient.initialDebt}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        initialDebt: e.target.value,
                      })
                    }
                    className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-5 text-xs font-bold text-slate-800 outline-none transition-all shadow-sm pr-12"
                  />
                  <span
                    className={`absolute ${isRtl ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400`}
                  >
                    {isRtl ? "هم" : "DH"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-600/25 transition-all cursor-pointer active:scale-95"
              >
                <Plus size={16} strokeWidth={3} />
                <span>{isRtl ? "تقييد" : "Record"}</span>
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Cheque indicator bullet */}
            <div
              className={`flex items-center gap-2 mb-6 ${isRtl ? "justify-start" : "justify-end"}`}
            >
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                {isRtl ? "تسجيل شيك جديد" : "New Cheque Entry"}
              </span>
            </div>

            {/* Cheque Add horizontal row flow */}
            <form
              onSubmit={handleAddCheque}
              className={`grid grid-cols-1 md:grid-cols-6 gap-4 items-end ${isRtl ? "text-right" : "text-left"}`}
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block px-1">
                  {isRtl ? "اسم صاحب الشيك" : "Holder Name"}
                </label>
                <input
                  required
                  type="text"
                  placeholder={isRtl ? "اسم صاحب الشيك" : "Cheque Holder"}
                  value={newCheque.clientName}
                  onChange={(e) =>
                    setNewCheque({ ...newCheque, clientName: e.target.value })
                  }
                  className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-5 text-xs font-bold text-slate-800 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block px-1">
                  {isRtl ? "رقم الشيك" : "Cheque Number"}
                </label>
                <input
                  required
                  type="text"
                  placeholder={isRtl ? "رقم الشيك" : "Cheque Number"}
                  value={newCheque.chequeNumber}
                  onChange={(e) =>
                    setNewCheque({ ...newCheque, chequeNumber: e.target.value })
                  }
                  className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-5 text-xs font-bold font-mono text-slate-800 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block px-1">
                  {isRtl ? "البنك" : "Bank"}
                </label>
                <select
                  value={newCheque.bankName}
                  onChange={(e) =>
                    setNewCheque({ ...newCheque, bankName: e.target.value })
                  }
                  className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-4 text-xs font-bold text-slate-800 outline-none transition-all shadow-sm appearance-none"
                >
                  <option value="CIH Bank">CIH Bank</option>
                  <option value="Groupe Banque Populaire">
                    Banque Populaire
                  </option>
                  <option value="Attijariwafa Bank">Attijariwafa Bank</option>
                  <option value="BMCE Bank of Africa">BMCE Bank</option>
                  <option value="Société Générale Maroc">
                    Société Générale
                  </option>
                  <option value="Crédit Agricole du Maroc">
                    Crédit Agricole
                  </option>
                  <option value="Al Barid Bank">Al Barid Bank</option>
                  <option value="Other">
                    {isRtl ? "بنك آخر..." : "Other Bank..."}
                  </option>
                </select>
              </div>

              {newCheque.bankName === "Other" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 block px-1">
                    {isRtl ? "اسم البنك الآخر" : "Custom Bank Name"}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={
                      isRtl ? "أدخل اسم البنك..." : "Enter bank name..."
                    }
                    value={chequeCustomBank}
                    onChange={(e) => setChequeCustomBank(e.target.value)}
                    className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-5 text-xs font-bold text-slate-800 outline-none transition-all shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block px-1">
                  {isRtl ? "تاريخ الاستحقاق" : "Due Date"}
                </label>
                <input
                  required
                  type="date"
                  value={newCheque.dueDate}
                  onChange={(e) =>
                    setNewCheque({ ...newCheque, dueDate: e.target.value })
                  }
                  className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-5 text-xs font-bold text-slate-800 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block px-1">
                  {isRtl ? "المبلغ" : "Amount"}
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newCheque.amount}
                    onChange={(e) =>
                      setNewCheque({ ...newCheque, amount: e.target.value })
                    }
                    className="w-full h-12 bg-slate-50/75 border border-slate-100 hover:border-slate-300 focus:border-orange-500 rounded-2xl px-5 text-xs font-bold text-slate-800 outline-none transition-all shadow-sm pr-12"
                  />
                  <span
                    className={`absolute ${isRtl ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400`}
                  >
                    {isRtl ? "هم" : "DH"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-600/25 transition-all cursor-pointer active:scale-95"
              >
                <Plus size={16} strokeWidth={3} />
                <span>{isRtl ? "تسجيل" : "Record"}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. LARGE UNIFIED SEARCH & QUICK REFUND (RTL ORDER FROM SCREENSHOT) */}
      <div className={`mt-8 flex flex-col md:flex-row gap-6 items-center`}>
        {/* Refund button on left side of Search bar */}
        <button
          onClick={() => setShowWalkInModal(true)}
          className="w-full md:w-auto h-14 flex items-center justify-center gap-3 rounded-full bg-orange-600 hover:bg-orange-500 px-8 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-600/25 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <span className="font-extrabold">
            {isRtl ? "إرجاع لزبون عابر" : "Walk-In Refund"}
          </span>
          <svg
            className="w-5 h-5 opacity-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </button>

        {/* Wide Search bar capsule with magnifier on the far right (for RTL) */}
        <div className="relative flex-1 w-full">
          <Search
            className={`absolute ${isRtl ? "left-6" : "right-6"} top-1/2 -translate-y-1/2 text-slate-400`}
            size={20}
          />
          <input
            type="text"
            placeholder={
              activeSubTab === "clients"
                ? isRtl
                  ? "بحث في الزبناء..."
                  : "Find client..."
                : isRtl
                  ? "البحث في الشيكات..."
                  : "Search cheques..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full h-14 rounded-full border-2 border-slate-200 bg-white ${isRtl ? "pl-16 pr-8 text-right" : "pr-16 pl-8 text-left"} text-sm font-black text-slate-800 outline-none focus:border-orange-500 transition-all shadow-sm`}
            dir={isRtl ? "rtl" : "ltr"}
          />
        </div>
      </div>

      {/* 4. CONTENT LISTING SECTION */}
      {activeSubTab === "clients" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((c) => {
            const status = getDebtStatus(c, isRtl);
            return (
              <div
                key={c.id}
                className="p-8 rounded-[40px] bg-white border border-slate-200 group hover:border-orange-500/30 transition-all relative overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`flex items-start justify-between mb-8 ${isRtl ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${c.debt > 0 ? "bg-rose-50 text-rose-600 border border-rose-150 animate-pulse" : "bg-emerald-50 text-emerald-600 border border-emerald-150"}`}
                    >
                      {c.debt > 0
                        ? `${c.debt.toFixed(2)} DH (كريدي)`
                        : isRtl
                          ? "خالص"
                          : "Clear"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditClient(c)}
                        title={
                          isRtl ? "تعديل بيانات الزبون" : "Edit customer info"
                        }
                        className="h-14 w-14 rounded-[20px] bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-orange-600 transition-all cursor-pointer"
                      >
                        <Edit size={20} />
                      </button>
                      <div className="h-14 w-14 rounded-[20px] bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform shadow-inner">
                        <User size={28} />
                      </div>
                    </div>
                  </div>

                  <div className={isRtl ? "text-right" : "text-left"}>
                    <h4 className="text-xl font-black text-slate-800 truncate mb-2">
                      {c.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-400 mb-6 italic tracking-tight">
                      {c.phone || (isRtl ? "لا يوجد هاتف" : "No phone")}
                    </p>

                    {c.address && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl mb-4 leading-relaxed font-sans truncate">
                        {isRtl ? "العنوان: " : "Address: "}
                        {c.address}
                      </p>
                    )}

                    {c.dueDate && (
                      <div
                        className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${c.debt > 0 && status ? status.colorClass : "bg-slate-50 text-slate-500 border border-slate-200/50"} ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}
                      >
                        <Clock size={16} className="shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-0.5">
                            {isRtl ? "تاريخ استحقاق الدين" : "Debt Due Date"}
                          </p>
                          <p className="text-xs font-black">
                            {c.dueDate}{" "}
                            {c.debt > 0 && status && (
                              <span className="opacity-80 font-bold">
                                ({status.label})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPaymentModal(c.id)}
                      className="flex-1 py-3 px-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-100 transition-all shadow-sm cursor-pointer"
                    >
                      {isRtl ? "تسديد (دفع)" : "Pay Debt"}
                    </button>
                    <button
                      onClick={() => setShowHistoryModal(c.id)}
                      className="flex-1 py-3 px-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 hover:bg-orange-100 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                    >
                      {isRtl ? "كشف حساب" : "Ledger History"}
                    </button>
                  </div>
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all"
                    >
                      <Phone size={12} />
                      <span>{c.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCheques.map((ch) => (
            <div
              key={ch.id}
              className="p-8 rounded-[40px] bg-white border border-slate-200 hover:border-orange-500/30 transition-all relative overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div>
                <div
                  className={`flex items-start justify-between mb-8 ${isRtl ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getBankBadgeStyle(ch.bankName)}`}
                  >
                    {ch.bankName}
                  </div>
                  <button
                    onClick={() => handleDeleteCheque(ch.id)}
                    className="h-9 w-9 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    title={isRtl ? "حذف الشيك" : "Delete Cheque"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={isRtl ? "text-right" : "text-left"}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {isRtl ? "صاحب الشيك" : "Cheque Holder"}
                  </p>
                  <h4 className="text-xl font-black text-slate-800 truncate mb-3">
                    {ch.clientName}
                  </h4>

                  <div className="flex gap-4 mb-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        {isRtl ? "رقم الشيك" : "Cheque No"}
                      </p>
                      <p className="text-xs font-mono font-black text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
                        {ch.chequeNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        {isRtl ? "تاريخ الصرف" : "Due Date"}
                      </p>
                      <p className="text-xs font-black text-slate-700">
                        {ch.dueDate}
                      </p>
                    </div>
                  </div>

                  <div className="my-5 border-t border-dashed border-slate-100 pt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {isRtl ? "قيمة الشيك" : "Cheque Amount"}
                    </p>
                    <p className="text-2xl font-black text-orange-600">
                      {ch.amount.toFixed(2)} DH
                    </p>
                  </div>
                </div>
              </div>

              {/* Status control layout */}
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">
                  {isRtl ? "تغيير حالة الشيك" : "Cheque Status"}
                </p>
                <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <button
                    onClick={() => handleChequeStatusChange(ch.id, "pending")}
                    className={`py-2 text-[9px] font-black rounded-xl transition-all ${
                      ch.status === "pending"
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {isRtl ? "معلق" : "Pending"}
                  </button>
                  <button
                    onClick={() => handleChequeStatusChange(ch.id, "paid")}
                    className={`py-2 text-[9px] font-black rounded-xl transition-all ${
                      ch.status === "paid"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {isRtl ? "مستخلص" : "Cashed"}
                  </button>
                  <button
                    onClick={() => handleChequeStatusChange(ch.id, "bounced")}
                    className={`py-2 text-[9px] font-black rounded-xl transition-all ${
                      ch.status === "bounced"
                        ? "bg-rose-500 text-white shadow-sm animate-pulse"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {isRtl ? "مرفوض" : "Bounced"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCheques.length === 0 && (
            <div className="col-span-full p-16 text-center text-slate-400 font-bold bg-white rounded-[40px] border border-slate-100">
              {isRtl
                ? "لا توجد شيكات مسجلة مطابقة للبحث"
                : "No cheques registered matching your query."}
            </div>
          )}
        </div>
      )}

      {/* --- MODAL 4: WALK-IN REFUND WIZARD --- */}
      <AnimatePresence>
        {showWalkInModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl bg-white rounded-[48px] p-12 border border-slate-200 shadow-2xl relative"
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Header */}
              <div className="mb-8 flex items-center justify-between font-sans">
                <div>
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] block mb-2">
                    {isRtl ? "عمليات الإرجاع السريع" : "CUSTOMER REFUNDS"}
                  </span>
                  <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">
                    {isRtl
                      ? "إرجاع واسترداد لزبون عابر"
                      : "Refund to Walk-In Customer"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowWalkInModal(false);
                    setWalkInProduct(null);
                    setWalkInQty("1");
                    setWalkInPrice("");
                    setWalkInSearch("");
                  }}
                  className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Step 1: Search for item */}
              <div className="space-y-6 mb-8">
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl
                      ? "ابحث عن السلعة المرجعة فالمخزن"
                      : "Search Store Product to Restock"}
                  </label>
                  <div className="relative">
                    <Search
                      className={`absolute ${isRtl ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-slate-400`}
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder={
                        isRtl
                          ? "اكتب اسم السلعة أو امسح الباركود..."
                          : "Type product name or scan barcode..."
                      }
                      value={walkInSearch}
                      onChange={(e) => setWalkInSearch(e.target.value)}
                      className={`w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 p-6 ${isRtl ? "pl-12" : "pr-12"} text-sm font-bold text-slate-800 outline-none focus:border-orange-500`}
                    />
                  </div>
                </div>

                {/* Instant search dropdown */}
                {filteredWalkInProducts.length > 0 && !walkInProduct && (
                  <div className="p-2 rounded-2xl border border-slate-100 bg-slate-50 space-y-1 max-h-[180px] overflow-y-auto">
                    {filteredWalkInProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setWalkInProduct(p);
                          setWalkInPrice(p.price.toString());
                        }}
                        className={`w-full p-3 rounded-xl hover:bg-white text-right flex items-center justify-between text-xs font-bold text-slate-700 transition-all ${isRtl ? "flex-row" : "flex-row-reverse"}`}
                      >
                        <span className="font-mono text-slate-400">
                          {p.barcode}
                        </span>
                        <span className="font-extrabold text-slate-800">
                          {p.name} ({p.qty} {isRtl ? "متوفر" : "in stock"})
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected item indicators */}
                {walkInProduct && (
                  <div className="p-6 rounded-[28px] border border-orange-200 bg-orange-50/25 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-orange-600 block uppercase tracking-wider">
                          {isRtl ? "السلعة المحددة حالياً" : "Selected Item"}
                        </p>
                        <h4 className="text-md font-black text-slate-800">
                          {walkInProduct.name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWalkInProduct(null)}
                        className="px-3 py-1.5 rounded-lg bg-orange-100 text-[9px] font-bold text-orange-600 hover:bg-orange-200 transition-all"
                      >
                        {isRtl ? "تغيير" : "Change"}
                      </button>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400">
                          {isRtl ? "الكمية المسترجعة" : "Return Quantity"}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={walkInQty}
                          onChange={(e) => setWalkInQty(e.target.value)}
                          className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400">
                          {isRtl
                            ? "سعر الاسترداد (للوحدة)"
                            : "Refund Unit Price"}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={walkInPrice}
                          onChange={(e) => setWalkInPrice(e.target.value)}
                          className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    {/* Math display */}
                    <div className="pt-2 border-t border-dashed border-orange-200/50 flex items-center justify-between text-xs font-black text-slate-800">
                      <span>
                        {isRtl
                          ? "إجمالي مبلغ الاسترداد الصافي"
                          : "Total Refund Outstanding"}
                      </span>
                      <span className="text-md text-orange-600">
                        {(parseInt(walkInQty) || 0) *
                          (parseFloat(walkInPrice) || 0)}{" "}
                        DH
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action operations buttons */}
              <div className="flex gap-4 font-sans justify-end mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowWalkInModal(false);
                    setWalkInProduct(null);
                    setWalkInQty("1");
                    setWalkInPrice("");
                    setWalkInSearch("");
                  }}
                  className="px-6 h-12 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 font-black text-xs uppercase cursor-pointer"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={!walkInProduct}
                  onClick={handleWalkInSubmit}
                  className="px-8 h-12 rounded-xl bg-orange-600 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-xs uppercase tracking-wider hover:bg-orange-500 transition-all cursor-pointer shadow-lg shadow-orange-600/20 active:scale-95"
                >
                  {isRtl ? "تأكيد واسترجاع السلعة" : "Apply Refund & Restock"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADD / EDIT / PAYMENT / HISTORIES MODALS MAINTAINED INTEGRALLY --- */}
      <AnimatePresence>
        {editClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onSubmit={handleUpdateClient}
              className="w-full max-w-lg bg-white rounded-[48px] p-12 border border-slate-200 shadow-2xl relative"
            >
              <div className="mb-10 flex items-center justify-between">
                <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter uppercase">
                  {isRtl ? "تعديل بيانات الزبون" : "Edit Customer"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditClient(null)}
                  className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6 mb-10">
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <input
                    required
                    placeholder={isRtl ? "الاسم..." : "Name..."}
                    type="text"
                    value={editClient.name}
                    onChange={(e) =>
                      setEditClient({ ...editClient, name: e.target.value })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-orange-500/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "رقم الهاتف" : "Phone"}
                  </label>
                  <input
                    placeholder="06..."
                    type="text"
                    value={editClient.phone || ""}
                    onChange={(e) =>
                      setEditClient({ ...editClient, phone: e.target.value })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-orange-500/50"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "العنوان" : "Address"}
                  </label>
                  <textarea
                    placeholder={isRtl ? "العنوان..." : "Address..."}
                    value={editClient.address || ""}
                    onChange={(e) =>
                      setEditClient({ ...editClient, address: e.target.value })
                    }
                    className="w-full h-24 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-orange-500/50 resize-none"
                  />
                </div>
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl
                      ? "تاريخ استحقاق الدين (اختياري)"
                      : "Debt Due Date (Optional)"}
                  </label>
                  <input
                    type="date"
                    value={editClient.dueDate || ""}
                    onChange={(e) =>
                      setEditClient({ ...editClient, dueDate: e.target.value })
                    }
                    className="w-full h-16 rounded-[20px] bg-slate-50 border border-slate-200 p-6 text-slate-800 font-black outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-24 rounded-[32px] bg-orange-600 text-white font-black uppercase tracking-[0.3em] shadow-xl shadow-orange-500/20 hover:brightness-110 transition-all active:scale-[0.98]"
              >
                {isRtl ? "حفظ التغييرات" : "Save Changes"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              {...{ animate: { scale: 1, opacity: 1 } }}
              onSubmit={handlePayment}
              className="w-full max-w-lg bg-white rounded-[48px] p-12 border border-slate-200 shadow-2xl relative"
            >
              <div className="mb-10 flex items-center justify-between font-sans">
                <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter uppercase">
                  {isRtl ? "تسجيل دفعة" : "Record Payment"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6 mb-10">
                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "المبلغ المدفوع" : "Amount Paid"}
                  </label>
                  <input
                    required
                    placeholder="0.00 DH"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full h-24 rounded-[32px] bg-slate-50 border border-slate-200 p-6 text-center text-4xl font-black text-emerald-600 outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div
                  className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                    {isRtl ? "طريقة الدفع" : "Payment Method"}
                  </label>
                  <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                        paymentMethod === "cash"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {isRtl ? "نقداً (كاش)" : "Cash"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cheque")}
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                        paymentMethod === "cheque"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {isRtl ? "شيك بنكي" : "Cheque"}
                    </button>
                  </div>
                </div>

                {paymentMethod === "cheque" && (
                  <div className="space-y-4 border-t border-dashed border-slate-200 pt-4">
                    <div
                      className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                    >
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                        {isRtl ? "رقم الشيك" : "Cheque Number"}
                      </label>
                      <input
                        required={paymentMethod === "cheque"}
                        placeholder="1234567..."
                        type="text"
                        value={paymentChequeNo}
                        onChange={(e) => setPaymentChequeNo(e.target.value)}
                        className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-sm font-black text-slate-800 outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                      >
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                          {isRtl ? "اسم البنك" : "Bank Name"}
                        </label>
                        <select
                          value={paymentBankName}
                          onChange={(e) => setPaymentBankName(e.target.value)}
                          className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-4 text-xs font-black text-slate-800 outline-none focus:border-emerald-500/50 appearance-none"
                        >
                          <option value="CIH Bank">CIH Bank</option>
                          <option value="Groupe Banque Populaire">
                            Banque Populaire
                          </option>
                          <option value="Attijariwafa Bank">
                            Attijariwafa Bank
                          </option>
                          <option value="BMCE Bank of Africa">BMCE Bank</option>
                          <option value="Société Générale Maroc">
                            Société Générale
                          </option>
                          <option value="Crédit Agricole du Maroc">
                            Crédit Agricole
                          </option>
                          <option value="Al Barid Bank">Al Barid Bank</option>
                          <option value="Other">
                            {isRtl ? "بنك آخر..." : "Other Bank..."}
                          </option>
                        </select>
                      </div>

                      <div
                        className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                      >
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                          {isRtl ? "تاريخ صرف الشيك" : "Cheque Due Date"}
                        </label>
                        <input
                          required={paymentMethod === "cheque"}
                          type="date"
                          value={paymentChequeDueDate}
                          onChange={(e) =>
                            setPaymentChequeDueDate(e.target.value)
                          }
                          className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-sm font-black text-slate-800 outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>

                    {paymentBankName === "Other" && (
                      <div
                        className={`space-y-2 ${isRtl ? "text-right" : "text-left"}`}
                      >
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">
                          {isRtl ? "اسم البنك الآخر" : "Custom Bank Name"}
                        </label>
                        <input
                          required
                          type="text"
                          placeholder={
                            isRtl ? "أدخل اسم البنك..." : "Enter bank name..."
                          }
                          value={paymentCustomBank}
                          onChange={(e) => setPaymentCustomBank(e.target.value)}
                          className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-5 text-sm font-black text-slate-800 outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-24 rounded-[32px] bg-emerald-600 text-white font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 hover:brightness-110 transition-all active:scale-[0.98]"
              >
                {isRtl ? "تأكيد الدفع" : "Confirm"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistoryModal &&
          (() => {
            const activeHistoryClient = appData.clients.find(
              (c) => c.id === showHistoryModal,
            );
            if (!activeHistoryClient) return null;
            return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-2xl bg-white rounded-[40px] p-10 border border-slate-200 shadow-2xl relative overflow-hidden text-right"
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  <div className="mb-8 flex items-center justify-between">
                    <button
                      onClick={() => setShowHistoryModal(null)}
                      className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                    >
                      <X size={24} />
                    </button>
                    <div className="text-right">
                      <h3 className="text-2xl font-black text-slate-800 italic tracking-tighter uppercase">
                        {isRtl
                          ? `كشف حساب ومعاملات : ${activeHistoryClient.name}`
                          : `Account Statement: ${activeHistoryClient.name}`}
                      </h3>
                      <p className="text-sm font-black text-red-600 mt-1">
                        {isRtl
                          ? `مجموع الكريدي الحالي: ${activeHistoryClient.debt.toFixed(2)} DH`
                          : `Total Debt: ${activeHistoryClient.debt.toFixed(2)} DH`}
                      </p>
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-none">
                    {!activeHistoryClient.paymentHistory ||
                    activeHistoryClient.paymentHistory.length === 0 ? (
                      <div className="p-8 text-center text-sm font-bold text-slate-400 bg-slate-50 rounded-2xl">
                        {isRtl
                          ? "لا توجد معاملات مسجلة بعد في كشف هذا الزبون"
                          : "No transactions recorded yet for this client."}
                      </div>
                    ) : (
                      activeHistoryClient.paymentHistory.map(
                        (item: any, itemIdx: number) => (
                          <div
                            key={item.id || itemIdx}
                            className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-between text-xs font-bold gap-4"
                          >
                            <div className={isRtl ? "text-right" : "text-left"}>
                              <p className="text-slate-700 font-black">
                                {item.method ||
                                  (item.amount < 0
                                    ? isRtl
                                      ? "شراء بالكريدي"
                                      : "Credit Purchase"
                                    : isRtl
                                      ? "دفعة تسديد"
                                      : "Debt Repayment")}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {new Date(item.date).toLocaleString(
                                  isRtl ? "ar-MA" : "en-US",
                                )}
                              </p>
                            </div>
                            <div
                              className={`text-sm font-black whitespace-nowrap ${item.amount < 0 ? "text-red-500" : "text-emerald-500"}`}
                            >
                              {item.amount < 0
                                ? `${Math.abs(item.amount).toFixed(2)} DH (دين)`
                                : `+${item.amount.toFixed(2)} DH (تسديد)`}
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setShowHistoryModal(null)}
                      className="px-8 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase cursor-pointer"
                    >
                      {isRtl ? "إغلاق" : "Close"}
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()}
      </AnimatePresence>
    </motion.div>
  );
}

// --- NEW COMPONENT: ArchiveView (أرشيف الفواتير المكتملة) ---
export function ArchiveView({ appData, setAppData, t, isRtl }: ArchiveViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<
    "all" | "cash" | "card" | "wallet"
  >("all");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "yesterday" | "7days" | "custom"
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Sale | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Sale | null>(null);
  const [invoiceToVoid, setInvoiceToVoid] = useState<Sale | null>(null);

  const getInvoiceNum = (saleId: string) => {
    if (!saleId) return "000001";
    if (saleId.startsWith("DRAFT-")) return "000000";
    const sorted = [...appData.sales].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const index = sorted.findIndex((s) => s.id === saleId);
    if (index === -1) {
      return String(appData.sales.length + 1).padStart(6, "0");
    }
    return String(index + 1).padStart(6, "0");
  };

  const filteredSales = useMemo(() => {
    return appData.sales.filter((sale) => {
      const lowercaseSearch = searchTerm.toLowerCase();
      const invoiceNum = getInvoiceNum(sale.id);
      const matchesSearch =
        sale.id.toLowerCase().includes(lowercaseSearch) ||
        invoiceNum.includes(lowercaseSearch) ||
        sale.items.some((it) =>
          it.name.toLowerCase().includes(lowercaseSearch),
        );

      const matchesPayment =
        paymentMethodFilter === "all" ||
        sale.paymentMethod === paymentMethodFilter;

      if (dateFilter === "all") return matchesSearch && matchesPayment;

      const saleDate = new Date(sale.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let matchesDate = false;
      if (dateFilter === "today") {
        const d = new Date(sale.date);
        d.setHours(0, 0, 0, 0);
        matchesDate = d.getTime() === today.getTime();
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const d = new Date(sale.date);
        d.setHours(0, 0, 0, 0);
        matchesDate = d.getTime() === yesterday.getTime();
      } else if (dateFilter === "7days") {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        matchesDate = saleDate >= oneWeekAgo;
      } else if (dateFilter === "custom") {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999);

        if (start && end) {
          matchesDate = saleDate >= start && saleDate <= end;
        } else if (start) {
          matchesDate = saleDate >= start;
        } else if (end) {
          matchesDate = saleDate <= end;
        } else {
          matchesDate = true;
        }
      }
      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [
    appData.sales,
    searchTerm,
    paymentMethodFilter,
    dateFilter,
    startDate,
    endDate,
  ]);

  const handlePrint = (sale: Sale) => {
    setPrintInvoice(sale);
    setTimeout(() => {
      window.focus();
      window.print();
      setTimeout(() => {
        setPrintInvoice((prev) => (prev?.id === sale.id ? null : prev));
      }, 15000);
    }, 500);
  };

  const handleConfirmVoid = () => {
    if (!invoiceToVoid) return;
    const saleId = invoiceToVoid.id;

    setAppData((prev: AppData) => {
      const updatedProducts = prev.products.map((p) => {
        const soldItem = invoiceToVoid.items.find(
          (item) => item.productId === p.id,
        );
        if (soldItem) {
          return { ...p, qty: p.qty + soldItem.qty };
        }
        return p;
      });

      let updatedClients = prev.clients;
      if (invoiceToVoid.paymentMethod === "credit" && invoiceToVoid.clientId) {
        updatedClients = prev.clients.map((c) => {
          if (c.id === invoiceToVoid.clientId) {
            const currentDebt = Number(c.debt) || 0;
            return {
              ...c,
              debt: Math.max(0, currentDebt - invoiceToVoid.finalTotal),
              paymentHistory: [
                {
                  id: Math.random().toString(36).substr(2, 9),
                  amount: invoiceToVoid.finalTotal,
                  date: new Date().toISOString(),
                  method: isRtl
                    ? "إلغاء عملية بيع بالكريدي"
                    : "Credit Sale Voided",
                },
                ...(c.paymentHistory || []),
              ],
            };
          }
          return c;
        });
      }

      return {
        ...prev,
        sales: prev.sales.filter((s) => s.id !== saleId),
        products: updatedProducts,
        clients: updatedClients,
      };
    });

    setInvoiceToVoid(null);
    if (selectedInvoice?.id === saleId) {
      setSelectedInvoice(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {printInvoice &&
        createPortal(
          <div className="printable-only">
            <PrintableInvoice
              sale={printInvoice}
              t={t}
              isRtl={isRtl}
              clients={appData.clients}
              settings={appData.settings}
              salesList={appData.sales}
            />
          </div>,
          document.body,
        )}

      <div className="grid grid-cols-1 gap-8">
        <div className="p-8 rounded-[36px] bg-white border border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 max-w-md relative">
            <Search
              className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-slate-400`}
              size={18}
            />
            <input
              type="text"
              placeholder={
                isRtl
                  ? "البحث برقم العملية أو اسم المادة..."
                  : "Search by ID or product name..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-primary/50 transition-all ${isRtl ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
              className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500 outline-none cursor-pointer focus:border-primary/30"
            >
              <option value="all">
                {isRtl ? "كل طرق الدفع" : "All Payments"}
              </option>
              <option value="cash">{isRtl ? "الدفع نقداً" : "Cash"}</option>
              <option value="card">{isRtl ? "البطاقة البنكية" : "Card"}</option>
              <option value="wallet">
                {isRtl ? "المحفظة الرقمية" : "Digital Wallet"}
              </option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500 outline-none cursor-pointer focus:border-primary/30"
            >
              <option value="all">{isRtl ? "كل التواريخ" : "All Time"}</option>
              <option value="today">{isRtl ? "اليوم المعاصر" : "Today"}</option>
              <option value="yesterday">
                {isRtl ? "الأمس المنصرم" : "Yesterday"}
              </option>
              <option value="7days">
                {isRtl ? "آخر 7 أيام" : "Last 7 Days"}
              </option>
              <option value="custom">
                {isRtl ? "فترة مخصصة" : "Custom Period"}
              </option>
            </select>

            {dateFilter === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-14 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-600 outline-none"
                />
                <span className="text-xs font-black text-slate-400">
                  {isRtl ? "إلى" : "to"}
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-14 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-600 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          <div className="xl:col-span-2 p-10 rounded-[40px] bg-white border border-slate-200 shadow-xl space-y-8">
            <div
              className={`flex items-center justify-between border-b border-slate-100 pb-6 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={isRtl ? "text-right" : "text-left"}>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block mb-2">
                  {isRtl ? "السجلات الكاملة" : "TRANSACTION REGISTER"}
                </span>
                <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">
                  {isRtl ? "أرشيف المبيعات المفصل" : "Completed Invoices List"}
                </h2>
              </div>
              <span className="text-xs font-black text-slate-400 bg-slate-100 px-3.5 py-1.5 rounded-full">
                {filteredSales.length} {isRtl ? "فاتورة" : "invoices"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table
                className="w-full text-left border-collapse"
                dir={isRtl ? "rtl" : "ltr"}
              >
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    <th
                      className={`py-4 px-4 ${isRtl ? "text-right" : "text-left"}`}
                    >
                      {isRtl ? "الرقم" : "Invoice ID"}
                    </th>
                    <th
                      className={`py-4 px-4 ${isRtl ? "text-right" : "text-left"}`}
                    >
                      {isRtl ? "التاريخ والوقت" : "Date & Time"}
                    </th>
                    <th className="py-4 px-4 text-center">
                      {isRtl ? "القطع المباعة" : "Units"}
                    </th>
                    <th
                      className={`py-4 px-4 ${isRtl ? "text-right" : "text-left"}`}
                    >
                      {isRtl ? "طريقة السداد" : "Payment"}
                    </th>
                    <th
                      className={`py-4 px-4 ${isRtl ? "text-left" : "text-right"}`}
                    >
                      {isRtl ? "المجموع النهائي" : "Subtotal"}
                    </th>
                    <th className="py-4 px-4 text-center">
                      {isRtl ? "الخيارات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSales.map((sale) => {
                    const totalQty = sale.items.reduce(
                      (prev, item) => prev + item.qty,
                      0,
                    );
                    return (
                      <tr
                        key={sale.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="py-5 px-4">
                          <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {getInvoiceNum(sale.id)}
                          </span>
                        </td>

                        <td className="py-5 px-4">
                          <div className={isRtl ? "text-right" : "text-left"}>
                            <p className="text-xs font-black text-slate-800 tracking-tight">
                              {new Date(sale.date).toLocaleDateString(
                                isRtl ? "ar-MA" : "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {new Date(sale.date).toLocaleTimeString(
                                isRtl ? "ar-MA" : "en-US",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="py-5 px-4 text-center">
                          <span className="inline-block text-xs font-extrabold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                            {totalQty} {isRtl ? "حبات" : "units"}
                          </span>
                        </td>

                        <td className="py-5 px-4">
                          <div className="flex items-center gap-2">
                            {sale.paymentMethod === "cash" ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase italic border border-emerald-500/20">
                                <Banknote size={12} />
                                {isRtl ? "كاش" : "Cash"}
                              </span>
                            ) : sale.paymentMethod === "card" ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase italic border border-blue-500/20">
                                <CreditCard size={12} />
                                {isRtl ? "بطاقة" : "Card"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase italic border border-amber-500/20">
                                <Wallet size={12} />
                                {isRtl ? "محفظة" : "Wallet"}
                              </span>
                            )}
                          </div>
                        </td>

                        <td
                          className={`py-5 px-4 ${isRtl ? "text-left" : "text-right"}`}
                        >
                          <span className="text-sm font-black text-slate-800 italic">
                            {sale.finalTotal.toFixed(2)} DH
                          </span>
                        </td>

                        <td className="py-5 px-4">
                          <div className="flex items-center justify-center gap-2.5">
                            <button
                              onClick={() => setSelectedInvoice(sale)}
                              className="h-9 w-9 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/20 cursor-pointer"
                              title={isRtl ? "تفاصيل الفاتورة" : "View details"}
                            >
                              <ChevronRight
                                size={16}
                                className={isRtl ? "rotate-180" : ""}
                              />
                            </button>
                            <button
                              onClick={() => handlePrint(sale)}
                              className="h-9 w-9 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center transition-all hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/20 cursor-pointer"
                              title={
                                isRtl ? "طباعة نسخة ورقية" : "Print invoice"
                              }
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              onClick={() => setInvoiceToVoid(sale)}
                              className="h-9 w-9 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl flex items-center justify-center transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500 cursor-pointer"
                              title={
                                isRtl
                                  ? "إلغاء المعاملة وإرجاع السلع"
                                  : "Void with stock refund"
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-45">
                          <Archive
                            size={64}
                            className="text-slate-300"
                            strokeWidth={1}
                          />
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic text-center">
                            {isRtl
                              ? "لا توجد فواتير مطابقة لخيارات البحث المذكورة"
                              : "No matching archived sales"}
                          </p>
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setPaymentMethodFilter("all");
                              setDateFilter("all");
                            }}
                            className="bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          >
                            {isRtl
                              ? "إعادة ضبط مرشحات البحث"
                              : "Clear all filters"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-10 rounded-[40px] bg-slate-900 border border-slate-800 text-white shadow-2xl min-h-[500px] flex flex-col justify-between">
            {selectedInvoice ? (
              <div className="space-y-8 flex-1 flex flex-col justify-between">
                <div>
                  <div
                    className={`flex items-center justify-between border-b border-white/10 pb-6 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={isRtl ? "text-right" : "text-left"}>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                        {isRtl ? "مستعرض الفاتورة" : "INVOICE PREVIEW"}
                      </span>
                      <h3 className="text-lg font-black italic mt-1 font-mono">
                        {isRtl ? "رقم الفاتورة: " : "Invoice #: "}{getInvoiceNum(selectedInvoice.id)}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="my-8 rounded-[24px] bg-white/5 border border-white/10 p-6 space-y-4 text-xs font-bold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {isRtl ? "تاريخ المعاملة:" : "Ordered on:"}
                      </span>
                      <span>
                        {new Date(selectedInvoice.date).toLocaleString(
                          isRtl ? "ar-MA" : "en-US",
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {isRtl ? "طريقة وتأكيد الدفع:" : "Payment status:"}
                      </span>
                      <span className="text-emerald-400 uppercase tracking-widest font-black">
                        {selectedInvoice.paymentMethod.toUpperCase()} •{" "}
                        {isRtl ? "مدفوعة بالكامل" : "Paid"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {selectedInvoice.items.map((it, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between text-xs font-bold border-b border-white/5 pb-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div className={isRtl ? "text-right" : "text-left"}>
                          <p className="text-slate-200">{it.name}</p>
                          <p className="text-[10px] text-slate-500 font-extrabold">
                            {it.qty} {isRtl ? "وحدة" : "units"} x{" "}
                            {it.price.toFixed(2)} DH
                          </p>
                        </div>
                        <span className="text-slate-200">
                          {(it.qty * it.price).toFixed(2)} DH
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 space-y-6 mt-6">
                  <div className="space-y-2 text-xs font-bold">
                    <div className="flex justify-between text-slate-400">
                      <span>{isRtl ? "المجموع الأساسي:" : "Subtotal:"}</span>
                      <span>{selectedInvoice.total.toFixed(2)} DH</span>
                    </div>
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between text-rose-400">
                        <span>{isRtl ? "قيمة الخصم:" : "Discount:"}</span>
                        <span>-{selectedInvoice.discount.toFixed(2)} DH</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-black text-white border-t border-white/10 pt-3 italic">
                      <span>{isRtl ? "الإجمالي الصافي:" : "Final Total:"}</span>
                      <span className="text-primary">
                        {selectedInvoice.finalTotal.toFixed(2)} DH
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      onClick={() => handlePrint(selectedInvoice)}
                      className="h-14 rounded-2xl bg-white/10 text-white font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer size={16} />
                      {isRtl ? "طباعة ورقة" : "Print"}
                    </button>
                    <button
                      onClick={() => setInvoiceToVoid(selectedInvoice)}
                      className="h-14 rounded-2xl bg-rose-600/25 border border-rose-500/30 text-rose-200 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={16} />
                      {isRtl ? "إرجاع الفاتورة" : "Void & Refund"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-20 opacity-40">
                <Archive size={48} strokeWidth={1.5} />
                <p className="text-xs uppercase font-black tracking-widest max-w-[180px] leading-tight text-center">
                  {isRtl
                    ? "اختر أي فاتورة من الأرشيف لإظهار التفاصيل وإدارتها"
                    : "Select an invoice from the archive list to view details"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {invoiceToVoid && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-[40px] p-10 border border-slate-200 shadow-2xl relative"
            >
              <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 italic">
                  {isRtl ? "تأكيد إلغاء الفاتورة" : "Void & Refund Invoice"}
                </h3>
                <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                  #{invoiceToVoid.id.toUpperCase().slice(0, 10)}
                </p>
                <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-sm mx-auto">
                  {isRtl
                    ? "هل أنت متأكد من رغبتك في إلغاء وإرجاع هذه الفاتورة؟ سيتم فوراً استرداد جميع السلع وإرجاع كاش الكميات إلى المخزن المتاح تلقائياً!"
                    : "This action will cancel the sale transaction. All quantities will be immediately returned to the storage inventory levels as a stock refund."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => setInvoiceToVoid(null)}
                  className="h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {isRtl ? "إلغاء وإغلاق التنبيه" : "Cancel"}
                </button>
                <button
                  onClick={handleConfirmVoid}
                  className="h-14 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-wider hover:bg-rose-700 shadow-xl shadow-rose-600/25 transition-all cursor-pointer"
                >
                  {isRtl ? "تأكيد الإرجاع" : "Void & Refund"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- NEW COMPONENT: ReportsView (التقارير الشهرية والتصدير) ---
interface ReportsViewProps {
  appData: AppData;
  t: any;
  isRtl: boolean;
}

export function ReportsView({ appData, t, isRtl }: ReportsViewProps) {
  const [reportType, setReportType] = useState<"daily" | "monthly" | "yearly">(
    "monthly",
  );

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });

  const [printReport, setPrintReport] = useState<any>(null);

  const { availableMonths, availableYears } = useMemo(() => {
    const monthsSet = new Set<string>();
    const yearsSet = new Set<string>();

    appData.sales.forEach((sale) => {
      const date = new Date(sale.date);
      const mLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthsSet.add(mLabel);
      yearsSet.add(date.getFullYear().toString());
    });

    const now = new Date();
    monthsSet.add(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    );
    yearsSet.add(now.getFullYear().toString());

    return {
      availableMonths: Array.from(monthsSet).sort().reverse(),
      availableYears: Array.from(yearsSet).sort().reverse(),
    };
  }, [appData.sales]);

  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableMonths, availableYears, selectedMonth, selectedYear]);

  const currentPeriodSales = useMemo(() => {
    return appData.sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      if (reportType === "daily") {
        const saleDay = saleDate.toISOString().split("T")[0];
        return saleDay === selectedDate;
      } else if (reportType === "monthly") {
        const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, "0")}`;
        return saleMonth === selectedMonth;
      } else {
        const saleYear = saleDate.getFullYear().toString();
        return saleYear === selectedYear;
      }
    });
  }, [appData.sales, reportType, selectedDate, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let discounts = 0;
    let totalItemsSold = 0;
    let cashRevenue = 0;
    let cardRevenue = 0;
    let walletRevenue = 0;
    let creditRevenue = 0;

    const categorySalesMap: { [cat: string]: number } = {};
    const subTotals: {
      [key: string]: { revenue: number; cost: number; count: number };
    } = {};

    currentPeriodSales.forEach((sale) => {
      revenue += sale.finalTotal;
      discounts += sale.discount || 0;

      const sDate = new Date(sale.date);
      let key = "";

      if (reportType === "daily") {
        const hour = sDate.getHours();
        key = `${hour}:00`;
      } else if (reportType === "monthly") {
        key = sDate.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        });
      } else {
        key = sDate.toLocaleDateString(isRtl ? "ar-MA" : "en-US", {
          month: "short",
        });
      }

      if (!subTotals[key]) {
        subTotals[key] = { revenue: 0, cost: 0, count: 0 };
      }
      subTotals[key].revenue += sale.finalTotal;
      subTotals[key].count += 1;

      if (sale.paymentMethod === "cash") cashRevenue += sale.finalTotal;
      else if (sale.paymentMethod === "card") cardRevenue += sale.finalTotal;
      else if (sale.paymentMethod === "wallet")
        walletRevenue += sale.finalTotal;
      else if (sale.paymentMethod === "credit")
        creditRevenue += sale.finalTotal;

      let saleCost = 0;
      sale.items.forEach((item) => {
        totalItemsSold += item.qty;
        const itemCost = (item.costPrice || 0) * item.qty;
        cost += itemCost;
        saleCost += itemCost;

        const prod = appData.products.find((p) => p.id === item.productId);
        const cat = prod?.category || (isRtl ? "عام" : "General");
        categorySalesMap[cat] =
          (categorySalesMap[cat] || 0) + item.price * item.qty;
      });
      subTotals[key].cost += saleCost;
    });

    const profit = revenue - cost;

    const chartData = Object.entries(subTotals).map(([label, d]) => ({
      label,
      revenue: parseFloat(d.revenue.toFixed(2)),
      profit: parseFloat((d.revenue - d.cost).toFixed(2)),
      count: d.count,
    }));

    if (reportType === "daily") {
      chartData.sort((a, b) => parseInt(a.label) - parseInt(b.label));
    } else if (reportType === "monthly") {
      // Keep sorted
    } else if (reportType === "yearly") {
      const mOrder = isRtl
        ? [
            "يناير",
            "فبراير",
            "مارس",
            "أبريل",
            "مايو",
            "يونيو",
            "يوليو",
            "أغسطس",
            "سبتمبر",
            "أكتوبر",
            "نوفمبر",
            "ديسمبر",
          ]
        : [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
      chartData.sort((a, b) => {
        const idxA = mOrder.findIndex((m) => (a.label || "").includes(m));
        const idxB = mOrder.findIndex((m) => (b.label || "").includes(m));
        return idxA - idxB;
      });
    }

    return {
      revenue,
      cost,
      discounts,
      profit,
      totalSales: currentPeriodSales.length,
      totalItemsSold,
      cashRevenue,
      cardRevenue,
      walletRevenue,
      creditRevenue,
      categorySales: Object.entries(categorySalesMap).map(([name, amount]) => ({
        name,
        amount,
      })),
      avgBasket:
        currentPeriodSales.length > 0 ? revenue / currentPeriodSales.length : 0,
      chartData,
    };
  }, [currentPeriodSales, reportType, appData.products, isRtl]);

  const exportToExcel = () => {
    const headers = isRtl
      ? [
          "رقم الفاتورة",
          "التاريخ والوقت",
          "طريقة الدفع",
          "المجموع الهيكلي",
          "التخفيض الممنوح",
          "الإجمالي النهائي",
          "صافي ربح السلة",
          "المواد المباعةتفصيلا",
        ]
      : [
          "Invoice ID",
          "Date & Time",
          "Payment Method",
          "Subtotal",
          "Discount",
          "Grand Total",
          "Profit",
          "Sold Items",
        ];

    const rows = currentPeriodSales.map((sale) => {
      const formattedDate = new Date(sale.date).toLocaleString(
        isRtl ? "ar-MA" : "en-US",
      );
      const itemsConcatenated = sale.items
        .map((it) => `${it.name} (${it.qty}x${it.price} DH)`)
        .join(" | ");

      let saleCost = 0;
      sale.items.forEach((it) => {
        saleCost += (it.costPrice || 0) * it.qty;
      });
      const saleProfit = sale.finalTotal - saleCost;

      return [
        sale.id,
        `"${formattedDate}"`,
        sale.paymentMethod.toUpperCase(),
        sale.total,
        sale.discount,
        sale.finalTotal,
        saleProfit.toFixed(2),
        `"${itemsConcatenated}"`,
      ];
    });

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const fileLabel =
      reportType === "daily"
        ? selectedDate
        : reportType === "monthly"
          ? selectedMonth
          : selectedYear;
    link.setAttribute(
      "download",
      `${reportType.toUpperCase()}_Sales_Report_${fileLabel}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrintReport = () => {
    const periodLabel =
      reportType === "daily"
        ? selectedDate
        : reportType === "monthly"
          ? selectedMonth
          : selectedYear;
    const reportData = {
      type: reportType,
      period: periodLabel,
      stats,
      sales: currentPeriodSales,
    };
    setPrintReport(reportData);
    setTimeout(() => {
      window.focus();
      window.print();
      setTimeout(() => {
        setPrintReport((prev) => (prev?.period === periodLabel ? null : prev));
      }, 15000);
    }, 500);
  };

  const formattedPeriod = useMemo(() => {
    if (reportType === "daily") {
      const d = new Date(selectedDate);
      return d.toLocaleDateString(isRtl ? "ar-MA" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (reportType === "monthly") {
      const [year, month] = selectedMonth.split("-");
      const d = new Date(parseInt(year), parseInt(month) - 1, 1);
      return d.toLocaleString(isRtl ? "ar-MA" : "en-US", {
        month: "long",
        year: "numeric",
      });
    } else {
      return isRtl
        ? `تقرير سنة ${selectedYear}`
        : `Report for Year ${selectedYear}`;
    }
  }, [reportType, selectedDate, selectedMonth, selectedYear, isRtl]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 animate-in fade-in duration-300"
    >
      {printReport &&
        createPortal(
          <div className="printable-only">
            <PrintableReport
              report={printReport}
              isRtl={isRtl}
              t={t}
              appData={appData}
            />
          </div>,
          document.body,
        )}

      {/* Report Switcher & Time Picker Card */}
      <div className="p-8 rounded-[36px] bg-white border border-slate-200 shadow-xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full xl:w-auto">
          {/* Quick Tabs switcher */}
          <div className="flex gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/50 w-full sm:w-fit font-sans">
            {(["daily", "monthly", "yearly"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${
                  reportType === type
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {type === "daily" && (isRtl ? "يومي" : "Daily")}
                {type === "monthly" && (isRtl ? "شهري" : "Monthly")}
                {type === "yearly" && (isRtl ? "سنوي" : "Yearly")}
              </button>
            ))}
          </div>

          <div className={`space-y-1 ${isRtl ? "text-right" : "text-left"}`}>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] block">
              {isRtl ? "إحصائيات متقدمة وحساب الأرباح" : "BUSINESS ANALYTICS"}
            </span>
            <h2 className="text-xl font-black text-slate-800 italic">
              {formattedPeriod}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* Selective Custom Period Pickers */}
          {reportType === "daily" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-600 outline-none cursor-pointer focus:border-primary/40 focus:bg-white transition-all w-full sm:w-auto font-sans text-center"
            />
          )}

          {reportType === "monthly" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500 outline-none cursor-pointer focus:border-primary/30 w-full sm:w-auto text-center"
            >
              {availableMonths.map((m) => {
                const [yr, mn] = m.split("-");
                const dt = new Date(parseInt(yr), parseInt(mn) - 1, 1);
                const label = dt.toLocaleString(isRtl ? "ar-MA" : "en-US", {
                  month: "long",
                  year: "numeric",
                });
                return (
                  <option key={m} value={m}>
                    {label}
                  </option>
                );
              })}
            </select>
          )}

          {reportType === "yearly" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500 outline-none cursor-pointer focus:border-primary/30 w-full sm:w-auto text-center font-sans"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {isRtl ? `عام ${yr}` : `Year ${yr}`}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={exportToExcel}
            className="h-14 px-6 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] w-full sm:w-auto"
          >
            <Download size={16} strokeWidth={2.5} />
            {isRtl ? "تصدير Excel" : "Export Excel"}
          </button>

          <button
            onClick={triggerPrintReport}
            className="h-14 px-6 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] w-full sm:w-auto"
          >
            <Printer size={16} strokeWidth={2.5} />
            {isRtl ? "طباعة تقرير PDF" : "Print PDF"}
          </button>
        </div>
      </div>

      {currentPeriodSales.length > 0 ? (
        <>
          {/* Main Statistics Cards Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="p-6 rounded-[28px] bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl flex flex-col justify-between min-h-[140px]">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-80">
                {isRtl ? "صافي المربح المالي" : "NET SELLING PROFITS"}
              </span>
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter">
                  {stats.profit.toFixed(2)} DH
                </h3>
                <p className="text-[10px] font-bold opacity-75 mt-1">
                  {isRtl
                    ? "مستخرج من تكلفة السلعة وفاتورتها"
                    : "Calculated after COGS"}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-white border border-slate-200 shadow-lg flex flex-col justify-between min-h-[140px]">
              <span className="text-[9px] font-black text-slate-400 tracking-widest">
                {isRtl ? "إجمالي المداخيل" : "GROSS SALES"}
              </span>
              <div>
                <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter">
                  {stats.revenue.toFixed(2)} DH
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  {isRtl
                    ? "شامل لجميع المعاملات المؤكدة"
                    : "Total sales revenue"}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-white border border-slate-200 shadow-lg flex flex-col justify-between min-h-[140px]">
              <span className="text-[9px] font-black text-slate-400 tracking-widest">
                {isRtl ? "إجمالي تكلفة المنتجات" : "COST OF GOODS (COGS)"}
              </span>
              <div>
                <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter">
                  {stats.cost.toFixed(2)} DH
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  {isRtl
                    ? "التكلفة الإجمالية لإنتاج السلع"
                    : "Cost of raw goods"}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-white border border-slate-200 shadow-lg flex flex-col justify-between min-h-[140px]">
              <span className="text-[9px] font-black text-slate-400 tracking-widest">
                {isRtl ? "إجمالي مجرى العمليات" : "TRANSACTION COUNT"}
              </span>
              <div>
                <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter">
                  {stats.totalSales}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  {stats.totalItemsSold}{" "}
                  {isRtl ? "مادة تم بيعها" : "units sold"}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-white border border-slate-200 shadow-lg flex flex-col justify-between min-h-[140px]">
              <span className="text-[9px] font-black text-slate-400 tracking-widest">
                {isRtl ? "متوسط قيمة سلة العميل" : "AVERAGE BASKET SIZE"}
              </span>
              <div>
                <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter">
                  {stats.avgBasket.toFixed(2)} DH
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  {isRtl
                    ? "معدل سداد الفاتورة الواحدة"
                    : "Average invoice amount"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Sales performance trend (adapted dynamically) */}
            <div className="lg:col-span-2 p-10 rounded-[40px] bg-white border border-slate-200 shadow-xl flex flex-col justify-between min-h-[450px]">
              <div className={isRtl ? "text-right" : "text-left"}>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block mb-2">
                  {reportType === "daily" &&
                    (isRtl
                      ? "حركة المداخيل العادية التفصيلية ساعياً"
                      : "HOURLY TREND ANALYSIS")}
                  {reportType === "monthly" &&
                    (isRtl
                      ? "حركة المبيعات اليومية التفصيلية"
                      : "DAILY TREND PERFORMANCE")}
                  {reportType === "yearly" &&
                    (isRtl
                      ? "حركة المبيعات والشهرية التفصيلية"
                      : "MONTHLY TREND PERFORMANCE")}
                </span>
                <h3 className="text-lg font-black text-slate-800 italic mb-10">
                  {isRtl
                    ? "مقارن المداخيل المباشرة وصافي الأرباح التراكمي"
                    : "Revenue & Profits Trends"}
                </h3>
              </div>

              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={10}
                      fontWeight="black"
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="black" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{ fontWeight: "900" }}
                    />
                    <Bar
                      dataKey="revenue"
                      name={isRtl ? "المداخيل" : "Revenue"}
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                      barSize={16}
                    />
                    <Bar
                      dataKey="profit"
                      name={isRtl ? "الأرباح" : "Profit"}
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-8 h-full">
              {/* Methods Spread */}
              <div className="p-10 rounded-[40px] bg-white border border-slate-200 shadow-xl space-y-6">
                <h4
                  className={`text-sm font-black text-slate-800 italic uppercase tracking-wider pb-4 border-b border-slate-100 ${isRtl ? "text-right" : "text-left"}`}
                >
                  {isRtl ? "طرق الدفع المستخدمة" : "Payment Methods Spread"}
                </h4>
                <div className="space-y-5">
                  {[
                    {
                      label: isRtl ? "نقداً (كاش)" : "Cash",
                      value: stats.cashRevenue,
                      color: "bg-emerald-500",
                      pct:
                        stats.revenue > 0
                          ? (stats.cashRevenue / stats.revenue) * 100
                          : 0,
                    },
                    {
                      label: isRtl ? "البطاقة البنكية" : "Bank Card",
                      value: stats.cardRevenue,
                      color: "bg-blue-500",
                      pct:
                        stats.revenue > 0
                          ? (stats.cardRevenue / stats.revenue) * 100
                          : 0,
                    },
                    {
                      label: isRtl ? "المحفظة الرقمية" : "Digital Wallets",
                      value: stats.walletRevenue,
                      color: "bg-amber-500",
                      pct:
                        stats.revenue > 0
                          ? (stats.walletRevenue / stats.revenue) * 100
                          : 0,
                    },
                    {
                      label: isRtl ? "كريدي / دين" : "Credit / Debt",
                      value: stats.creditRevenue,
                      color: "bg-red-500",
                      pct:
                        stats.revenue > 0
                          ? (stats.creditRevenue / stats.revenue) * 100
                          : 0,
                    },
                  ].map((p, idx) => (
                    <div key={idx} className="space-y-2">
                      <div
                        className={`flex items-center justify-between text-xs font-bold text-slate-700 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <span>{p.label}</span>
                        <span>
                          {p.value.toFixed(2)} DH ({p.pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div
                        className="h-2 w-full rounded-full bg-slate-50 overflow-hidden border border-slate-100/40"
                        dir="ltr"
                      >
                        <div
                          className={`h-full ${p.color} rounded-full`}
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorical sales spread */}
              <div className="p-10 rounded-[40px] bg-white border border-slate-200 shadow-xl space-y-6">
                <h4
                  className={`text-sm font-black text-slate-800 italic uppercase tracking-wider pb-4 border-b border-slate-100 ${isRtl ? "text-right" : "text-left"}`}
                >
                  {isRtl
                    ? "أداء فئات المنتجات"
                    : "Product Categories performance"}
                </h4>
                <div className="space-y-4 max-h-[185px] overflow-y-auto pr-1 custom-scrollbar">
                  {stats.categorySales.map((cat, idx) => {
                    const maxVal = Math.max(
                      ...stats.categorySales.map((c) => c.amount),
                      1,
                    );
                    return (
                      <div key={idx} className="space-y-2">
                        <div
                          className={`flex items-center justify-between text-xs font-bold text-slate-700 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <span className="truncate max-w-[120px]">
                            {cat.name}
                          </span>
                          <span>{cat.amount.toFixed(2)} DH</span>
                        </div>
                        <div
                          className="h-1.5 w-full rounded-full bg-slate-50 overflow-hidden border border-slate-100/40"
                          dir="ltr"
                        >
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(cat.amount / maxVal) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {stats.categorySales.length === 0 && (
                    <p className="text-xs font-bold text-slate-400 text-center py-6">
                      {isRtl
                        ? "لا توجد بيانات بيع للفئات"
                        : "No categorical records"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-20 text-center bg-white border border-slate-200 rounded-[40px] shadow-xl flex flex-col items-center justify-center space-y-4">
          <CalendarDays size={64} className="text-slate-300 animate-pulse" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic text-center">
            {isRtl
              ? "لا تتوفر مبيعات أو عمليات دفع مسجلة في هاته الفترة لتصدير التقرير"
              : "No transaction records exist for this selected period"}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// --- NEW COMPONENT: PrintableReport (نسخة التقارير الورقية للـ PDF لجميع الفترات) ---
export function PrintableReport({
  report,
  isRtl,
  t,
  appData,
}: {
  report: any;
  isRtl: boolean;
  t: any;
  appData: AppData;
}) {
  const { type, period, stats, sales } = report;

  const getInvoiceNum = (saleId: string) => {
    if (!saleId) return "000001";
    if (saleId.startsWith("DRAFT-")) return "000000";
    const sorted = [...appData.sales].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const index = sorted.findIndex((s) => s.id === saleId);
    if (index === -1) {
      return String(appData.sales.length + 1).padStart(6, "0");
    }
    return String(index + 1).padStart(6, "0");
  };

  let typeTitle = "";
  let periodDisplay = "";

  if (type === "daily") {
    typeTitle = isRtl ? "التقرير المالي اليومي" : "Daily Business Analytics";
    const dObj = new Date(period);
    periodDisplay = dObj.toLocaleDateString(isRtl ? "ar-MA" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (type === "monthly") {
    typeTitle = isRtl ? "التقرير المالي الشهري" : "Monthly Business Analytics";
    const [year, mNum] = period.split("-");
    const dObj = new Date(parseInt(year), parseInt(mNum) - 1, 1);
    periodDisplay = dObj.toLocaleString(isRtl ? "ar-MA" : "en-US", {
      month: "long",
      year: "numeric",
    });
  } else {
    typeTitle = isRtl ? "التقرير المالي السنوي" : "Yearly Business Analytics";
    periodDisplay = isRtl ? `عام ${period}` : `Year ${period}`;
  }

  return (
    <div
      className="p-4 sm:p-12 font-sans text-sm max-w-[800px] mx-auto bg-white text-black print:max-w-full print:w-full print:mx-0 print:border-none print:shadow-none print:p-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={`flex justify-between items-center border-b-2 border-black pb-6 mb-8 text-black ${isRtl ? "flex-row-reverse" : "flex-row"}`}
      >
        <div className={isRtl ? "text-right" : "text-left"}>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-black">
            BOUTABSSIL REPORT
          </h1>
          <p className="text-md font-bold mt-1 text-black">
            {appData.settings.shopName || "Boutique Pro"}
          </p>
          <p className="text-xs font-bold text-slate-500">
            {isRtl ? "تاريخ طباعة التقرير / التصدير:" : "Generated on:"}{" "}
            {new Date().toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-black italic bg-slate-100 px-6 py-3 rounded-[16px] border border-slate-200 uppercase">
            {type}
          </span>
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-2xl font-black uppercase tracking-widest italic underline decoration-double">
          {typeTitle} • {periodDisplay}
        </h2>
      </div>

      <div
        className={`grid grid-cols-2 gap-6 text-xs font-bold mb-10 border border-black p-6 rounded-[16px] ${isRtl ? "text-right" : "text-left"}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="space-y-3 pb-3 border-b-2 border-slate-100 md:border-b-0 md:pb-0">
          <div className="flex justify-between text-black text-sm border-b pb-1">
            <span>{isRtl ? "صافي المربح المالي:" : "Net Sales Profit:"}</span>
            <span className="text-xl font-black">
              {stats.profit.toFixed(2)} DH
            </span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>
              {isRtl ? "إجمالي المداخيل البينية:" : "Gross Revenues:"}
            </span>
            <span>{stats.revenue.toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>
              {isRtl
                ? "تكلفة البضائع المقتناة (COGS):"
                : "Cost of Goods (COGS):"}
            </span>
            <span>{stats.cost.toFixed(2)} DH</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-slate-700">
            <span>
              {isRtl ? "حجم المعاملات الكلي:" : "Total Transactions Count:"}
            </span>
            <span>
              {stats.totalSales} {isRtl ? "معاملة بيع" : "sales"}
            </span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>{isRtl ? "حجم السلع المفرغة:" : "Total Units Sold:"}</span>
            <span>
              {stats.totalItemsSold} {isRtl ? "قطعة" : "items"}
            </span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>
              {isRtl ? "معدل سلة الفاتورة الواحدة:" : "Avg basket size:"}
            </span>
            <span>{stats.avgBasket.toFixed(2)} DH</span>
          </div>
        </div>
      </div>

      <div className={`mb-10 text-xs ${isRtl ? "text-right" : "text-left"}`}>
        <h3 className="text-sm font-black uppercase tracking-widest italic mb-4 border-b border-black pb-2 text-black">
          {isRtl
            ? "توزيع المداخيل حسب فئات المنتجات"
            : "Sales Distribution by Category"}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {stats.categorySales.map((cat: any, idx: number) => (
            <div
              key={idx}
              className="border border-slate-200 p-4 rounded-xl flex flex-col justify-between"
            >
              <span className="font-extrabold text-slate-500 uppercase">
                {cat.name}
              </span>
              <span className="text-base font-black text-black mt-1">
                {cat.amount.toFixed(2)} DH
              </span>
            </div>
          ))}
          {stats.categorySales.length === 0 && (
            <p className="col-span-3 text-xs font-bold text-slate-400 text-center py-4">
              {isRtl ? "لا توجد بيانات بيع للفئات" : "No categorical records"}
            </p>
          )}
        </div>
      </div>

      <div className={`text-xs ${isRtl ? "text-right" : "text-left"}`}>
        <h3 className="text-sm font-black uppercase tracking-widest italic mb-4 border-b border-black pb-2 text-black">
          {isRtl
            ? "جدول المبيعات التفصيلي لهذه الفترة"
            : "Comprehensive Period Sales Log"}
        </h3>
        <table
          className="w-full text-left font-bold border-collapse"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <thead>
            <tr className="border-b border-black pb-2 text-[10px] font-black uppercase text-slate-500">
              <th className={`py-3 ${isRtl ? "text-right" : "text-left"}`}>
                Invoice ID
              </th>
              <th className={`py-3 ${isRtl ? "text-right" : "text-left"}`}>
                {isRtl ? "التاريخ والوقت" : "Date & Time"}
              </th>
              <th className="py-3 text-center">
                {isRtl ? "نوع السداد" : "Payment"}
              </th>
              <th className="py-3 text-center">
                {isRtl ? "القطع المباعة" : "Goods Count"}
              </th>
              <th
                className={`py-3 ${isRtl ? "text-left font-black" : "text-right font-black"}`}
              >
                {isRtl ? "المبلغ الإجمالي" : "Total"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale: any) => {
              const qty = sale.items.reduce(
                (acc: number, item: any) => acc + item.qty,
                0,
              );
              return (
                <tr
                  key={sale.id}
                  className="text-[11px] font-bold text-slate-800"
                >
                  <td className="py-2.5 font-mono">
                    #{getInvoiceNum(sale.id)}
                  </td>
                  <td className="py-2.5">
                    {new Date(sale.date).toLocaleString(
                      isRtl ? "ar-MA" : "en-US",
                    )}
                  </td>
                  <td className="py-2.5 text-center uppercase font-black">
                    {sale.paymentMethod}
                  </td>
                  <td className="py-2.5 text-center">
                    {qty} {isRtl ? "حبات" : "pcs"}
                  </td>
                  <td
                    className={`py-2.5 ${isRtl ? "text-left font-black text-sm" : "text-right font-black text-sm"}`}
                  >
                    {sale.finalTotal.toFixed(2)} DH
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className={`mt-20 border-t border-slate-200 pt-8 flex justify-between text-xs font-bold text-slate-400 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
      >
        <p>
          {isRtl
            ? "مستند تسيير حسابات مؤمن ومحمي بالكامل"
            : "Automated secure calculations."}
        </p>
        <p className={isRtl ? "text-left" : "text-right"}>
          {isRtl
            ? "توقيع وختم الإدارة والمدير المسؤول"
            : "Management Signature & Seal"}
        </p>
      </div>
    </div>
  );
}

// --- TypeScript Interfaces for the properties props ---
interface ArchiveViewProps {
  appData: AppData;
  setAppData: any;
  t: any;
  isRtl: boolean;
  currentUser?: any;
}

// --- NEW COMPONENT: PrintablePurchaseOrder (نسخة طلبات الموردين الورقية للـ PDF) ---
export function PrintablePurchaseOrder({
  po,
  isRtl,
  appData,
}: {
  po: {
    supplierName: string;
    supplierPhone: string;
    supplierEmail: string;
    supplierAddress: string;
    items: Array<{
      id: string;
      name: string;
      qty: number;
      costPrice: number;
    }>;
    notes: string;
    date: string;
    purchaseOrderId: string;
  };
  isRtl: boolean;
  appData: AppData;
}) {
  const systemName = isRtl
    ? "نظام التسيير المتكامل"
    : "Droguerie, Peinture & Électricité";

  const totalCost = po.items.reduce((acc, item) => acc + item.qty * item.costPrice, 0);

  return (
    <div className="p-16 max-w-4xl mx-auto bg-white font-sans text-xs text-slate-800" dir={isRtl ? "rtl" : "ltr"}>
      {/* Printable Header logo/brand */}
      <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase italic mb-1">
            {isRtl ? "طلب شراء قطع لتجارة التجزئة" : "PURCHASE ORDER REQUEST"}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {systemName} — {isRtl ? "إدارة التوريد والمشتريات" : "Procurement Department"}
          </p>
          <p className="text-slate-400 text-[10px] font-bold mt-1">
            ID: <span className="font-mono font-black">{po.purchaseOrderId}</span>
          </p>
        </div>
        <div className={`text-right ${isRtl ? "text-left leading-4" : "text-right leading-4"}`}>
          <div className="text-black text-sm font-black italic">{systemName}</div>
          <div className="text-slate-400 font-bold mb-1 text-[10px]">
            {isRtl ? "المغرب" : "Kingdom Of Morocco"}
          </div>
          <div className="text-slate-500 font-bold text-[9px] font-mono">
            {new Date(po.date).toLocaleString(isRtl ? "ar-MA" : "en-US")}
          </div>
        </div>
      </div>

      {/* Supplier & Store information */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div className="p-6 border border-slate-200 rounded-[20px] bg-slate-50/50">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            {isRtl ? "المرسل إليه / المورد:" : "SUPPLIER INFORMATION:"}
          </h4>
          <p className="text-sm font-black text-black">{po.supplierName || (isRtl ? "مورد غير مسمى" : "Unnamed Supplier")}</p>
          {po.supplierPhone && (
            <p className="font-bold text-slate-600 mt-1">
              {isRtl ? "الهاتف: " : "Phone: "}
              <span className="font-mono">{po.supplierPhone}</span>
            </p>
          )}
          {po.supplierEmail && (
            <p className="font-bold text-slate-600">
              {isRtl ? "البريد: " : "Email: "}
              <span className="font-mono underline">{po.supplierEmail}</span>
            </p>
          )}
          {po.supplierAddress && (
            <p className="font-bold text-slate-600">
              {isRtl ? "العنوان: " : "Address: "} 
              <span>{po.supplierAddress}</span>
            </p>
          )}
        </div>

        <div className="p-6 border border-slate-200 rounded-[20px] bg-slate-50/50">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            {isRtl ? "مستودع الاستلام والاتصال:" : "DELIVER TO STORES:"}
          </h4>
          <p className="text-sm font-black text-black">
            {isRtl ? "مستودع المواد والأجهزة والطلاء" : "Central Hardware & Paint Warehouses"}
          </p>
          <p className="font-bold text-slate-600 mt-1">
            {isRtl ? "التنظيم: " : "Store Type: "}
            <span>{isRtl ? "دروغري، سباغة وكهرباء" : "Droguerie, Peinture & Électricité"}</span>
          </p>
          <p className="font-bold text-slate-600">
            {isRtl ? "المسؤول: " : "Supervised By: "}
            <span>{isRtl ? "مسؤول المخازن العام" : "Procurement Manager"}</span>
          </p>
        </div>
      </div>

      {/* Items list Table */}
      <div className="mb-10 text-xs">
        <h3 className="text-sm font-black uppercase tracking-widest italic mb-4 border-b border-black pb-2 text-black">
          {isRtl ? "قائمة السلع والكميات المطلوبة" : "Ordered Items & Deliveries Specs"}
        </h3>
        <table className="w-full text-left font-bold border-collapse" dir={isRtl ? "rtl" : "ltr"}>
          <thead>
            <tr className="border-b border-black pb-2 text-[10px] font-black uppercase text-slate-500">
              <th className={`py-3 w-8 ${isRtl ? "text-right" : "text-left"}`}>#</th>
              <th className={`py-3 ${isRtl ? "text-right" : "text-left"}`}>
                {isRtl ? "اسم السلعة / المادة" : "Goods / Item Description"}
              </th>
              <th className="py-3 text-center w-24">
                {isRtl ? "الكمية المطلوبة" : "Quantity Requested"}
              </th>
              <th className={`py-3 w-32 ${isRtl ? "text-left" : "text-right"}`}>
                {isRtl ? "التكلفة الافتراضية" : "Est. Unit Price"}
              </th>
              <th className={`py-3 w-32 ${isRtl ? "text-left" : "text-right"}`}>
                {isRtl ? "المبلغ المقدر" : "Estimated Subtotal"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {po.items.map((item, idx) => (
              <tr key={item.id} className="text-[11px] font-bold text-slate-800">
                <td className="py-3 text-slate-400 font-mono">{idx + 1}</td>
                <td className="py-3">
                  <p className="font-black text-black">{item.name}</p>
                </td>
                <td className="py-3 text-center font-black font-mono">
                  {item.qty} {isRtl ? "حبة" : "units"}
                </td>
                <td className={`py-3 font-mono ${isRtl ? "text-left" : "text-right"}`}>
                  {item.costPrice.toFixed(2)} DH
                </td>
                <td className={`py-3 font-mono font-black text-black ${isRtl ? "text-left" : "text-right"}`}>
                  {(item.qty * item.costPrice).toFixed(2)} DH
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes and Total summary */}
      <div className="grid grid-cols-2 gap-10 items-start mb-10">
        <div className="p-4 rounded-2xl border border-dotted border-slate-300">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            {isRtl ? "ملاحظات وتوجيهات الشحن:" : "PURCHASE ORDER INSTRUCTIONS:"}
          </span>
          <p className="text-[11px] font-semibold text-slate-600 whitespace-pre-line leading-relaxed">
            {po.notes || (isRtl ? "لا توجد ملاحظات إضافية لهذا التوريد" : "No special notes or secondary instructions added.")}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-6 text-xs font-bold font-sans">
          <div className="flex justify-between text-slate-500 mb-2">
            <span>{isRtl ? "إجمالي المواد المطلوبة:" : "Total Requested Lines:"}</span>
            <span>{po.items.length} {isRtl ? "مواد مختلفة" : "unique items"}</span>
          </div>
          <div className="flex justify-between text-slate-500 mb-4 pb-4 border-b border-slate-200">
            <span>{isRtl ? "مجموع الوحدات الإجمالي:" : "Gross Quantities:"}</span>
            <span>
              {po.items.reduce((sum, item) => sum + item.qty, 0)} {isRtl ? "قطعة" : "units"}
            </span>
          </div>
          <div className="flex justify-between text-black text-base font-black">
            <span>{isRtl ? "القيمة التقديرية للطلب:" : "Est. Purchase Total:"}</span>
            <span className="font-mono text-lg text-primary">
              {totalCost.toFixed(2)} DH
            </span>
          </div>
        </div>
      </div>

      {/* Footer stamp elements */}
      <div className={`mt-24 border-t border-slate-200 pt-8 flex justify-between text-xs font-bold text-slate-400 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
        <p>
          {isRtl
            ? "يتم مراجعة الطلب واعتماده للاستيراد والادخال للمخزون"
            : "Authorized for supply purchase and stock ingestions."}
        </p>
        <p className={isRtl ? "text-left" : "text-right"}>
          {isRtl ? "الختم وتوقيع الإدارة المالية" : "Financial Controller Signature & Seal"}
        </p>
      </div>
    </div>
  );
}
