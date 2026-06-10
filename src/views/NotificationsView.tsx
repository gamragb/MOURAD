import { Bell, AlertTriangle, AlertCircle, TrendingDown } from "lucide-react";
import { storage } from "../storage";

export function NotificationsView({ isRtl }: { isRtl: boolean }) {
  const data = storage.getData();
  const products = data.products || [];
  const clients = data.clients || [];

  const notifications = [];

  // 1. Stock Notifications
  products.forEach(p => {
    if (p.qty <= (p.minQty || 5)) {
      notifications.push({
        id: `stock-${p.id}`,
        type: 'STOCK',
        title: isRtl ? "نقص في المخزون" : "Low Stock",
        message: isRtl ? `المنتج "${p.name}" وصل إلى الحد الأدنى (${p.qty})` : `Product "${p.name}" reached minimum stock (${p.qty})`,
        icon: <TrendingDown className="text-amber-500" />
      });
    }
  });

  // 2. Debt Notifications
  clients.forEach(c => {
    if (c.debt > 0 && c.dueDate) {
      const due = new Date(c.dueDate);
      const today = new Date();
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 3) {
        notifications.push({
          id: `debt-${c.id}`,
          type: 'DEBT',
          title: isRtl ? "تنبيه موعد سداد" : "Payment Due Alert",
          message: isRtl ? `الزبون "${c.name}" موعد سداده اقترب أو حان (${c.dueDate}) بمبلغ ${c.debt}` : `Customer "${c.name}" payment is due (${c.dueDate}) for ${c.debt}`,
          icon: <AlertCircle className="text-red-500" />
        });
      }
    }
  });

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      <div>
        <h2 className="text-3xl font-black italic text-slate-800 uppercase flex items-center gap-3">
          <Bell className="text-primary" size={32} />
          {isRtl ? "مركز الإشعارات" : "Notifications Center"}
        </h2>
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-8">
        {notifications.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold flex flex-col items-center gap-4">
            <Bell size={48} className="opacity-20" />
            {isRtl ? "لا توجد إشعارات حالياً" : "No new notifications"}
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  {notif.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-800">
                    {notif.title}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
