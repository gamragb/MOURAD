import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  ShoppingCart,
  Boxes,
  Users,
  Archive,
  Settings,
  LogOut,
  ShoppingBag,
  Bell,
  Store,
  RefreshCw,
  DownloadCloud,
  CheckCircle2
} from "lucide-react";

export function Sidebar({
  isOpen,
  activeTab,
  setActiveTab,
  onLogout,
  t,
  isRtl,
  currentUser,
}: {
  isOpen: boolean;
  activeTab: string;
  setActiveTab: (t: any) => void;
  onLogout: () => void;
  t: any;
  isRtl: boolean;
  currentUser?: any;
}) {
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'downloaded' | 'error' | 'not-available'>('idle');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electron) {
      const el = (window as any).electron;
      if (el.onUpdateAvailable) el.onUpdateAvailable(() => setUpdateStatus('available'));
      if (el.onUpdateDownloaded) el.onUpdateDownloaded(() => setUpdateStatus('downloaded'));
      if (el.onUpdateError) el.onUpdateError(() => setUpdateStatus('error'));
      if (el.onUpdateNotAvailable) el.onUpdateNotAvailable(() => {
        setUpdateStatus('not-available');
        setTimeout(() => setUpdateStatus('idle'), 3000);
      });
    }
  }, []);

  const handleCheckUpdate = () => {
    if (typeof window !== 'undefined' && (window as any).electron && (window as any).electron.checkForUpdates) {
      setUpdateStatus('checking');
      (window as any).electron.checkForUpdates();
    } else {
      alert(isRtl ? "خدمة التحديث غير متوفرة" : "Updater service not available");
    }
  };

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: BarChart3, show: true },
    { id: "pos", label: t("pos"), icon: ShoppingCart, show: true },
    { id: "stock", label: t("stock"), icon: Boxes, show: currentUser?.role === 'admin' || currentUser?.permissions?.stock },
    { id: "suppliers", label: isRtl ? "الموردين" : "Suppliers", icon: Store, show: currentUser?.role === 'admin' || currentUser?.permissions?.suppliers },
    { id: "customers", label: t("customers"), icon: Users, show: currentUser?.role === 'admin' || currentUser?.permissions?.customers },
    { id: "archive", label: isRtl ? "الأرشيف والنشاطات" : "Archive & Logs", icon: Archive, show: currentUser?.role === 'admin' || currentUser?.permissions?.history },
    { id: "settings", label: t("settings"), icon: Settings, show: currentUser?.role === 'admin' },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
      className={`hidden h-full flex-col ${isRtl ? "border-l" : "border-r"} border-slate-200 bg-white/90 backdrop-blur-md lg:flex shadow-xl relative z-30`}
    >
      <div className="flex flex-col h-auto pt-8 pb-4 items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-4 w-full justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 rotate-3 group cursor-default">
            <ShoppingBag
              size={24}
              strokeWidth={3}
              className="group-hover:-rotate-12 transition-transform"
            />
          </div>
          <div className={isRtl ? "text-right" : "text-left"}>
            <span className="block text-2xl font-black italic tracking-tighter text-slate-800 leading-none uppercase">
              BOUTABSSIL
            </span>
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mt-1 block opacity-70">
              v0.3.2
            </span>
          </div>
        </div>
        
        <button
          onClick={handleCheckUpdate}
          className={`mt-6 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            updateStatus === 'checking' ? 'bg-amber-100 text-amber-600' :
            updateStatus === 'available' ? 'bg-blue-100 text-blue-600 animate-pulse' :
            updateStatus === 'downloaded' ? 'bg-green-100 text-green-600' :
            updateStatus === 'error' ? 'bg-red-100 text-red-600' :
            'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
          }`}
        >
          {updateStatus === 'checking' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
           updateStatus === 'available' ? <DownloadCloud className="w-3.5 h-3.5" /> :
           updateStatus === 'downloaded' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
           updateStatus === 'error' ? <RefreshCw className="w-3.5 h-3.5" /> :
           <RefreshCw className="w-3.5 h-3.5" />}
          {updateStatus === 'checking' ? (isRtl ? "جاري البحث..." : "Checking...") :
           updateStatus === 'available' ? (isRtl ? "جاري التحميل..." : "Downloading...") :
           updateStatus === 'downloaded' ? (isRtl ? "تحديث جاهز" : "Update Ready") :
           updateStatus === 'not-available' ? (isRtl ? "لا يوجد تحديث" : "Up to date") :
           updateStatus === 'error' ? (isRtl ? "خطأ بالتحديث" : "Update Error") :
           (isRtl ? "البحث عن تحديث" : "Check Update")}
        </button>
      </div>

      <nav className="flex-1 space-y-2 p-6">
        {menuItems.filter(item => item.show).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] ${
              activeTab === item.id
                ? "bg-primary text-white shadow-2xl shadow-primary/40"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 3 : 2} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-8 space-y-6">
        <button
          onClick={() => setActiveTab('notifications')}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary/10 border border-primary/20 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-all hover:bg-primary hover:text-white"
        >
          <Bell size={18} strokeWidth={3} />
          {isRtl ? "الإشعارات" : "Notifications"}
        </button>

        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-xl hover:shadow-red-500/20"
        >
          <LogOut size={18} strokeWidth={3} />
          {t("logout")}
        </button>
      </div>
    </motion.div>
  );
}
