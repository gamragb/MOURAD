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
  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: BarChart3, show: true },
    { id: "pos", label: t("pos"), icon: ShoppingCart, show: true },
    { id: "stock", label: t("stock"), icon: Boxes, show: currentUser?.role === 'admin' || currentUser?.permissions?.stock },
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
      <div className="flex h-28 items-center px-10">
        <div className="flex items-center gap-4">
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
              v0.1
            </span>
          </div>
        </div>
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
