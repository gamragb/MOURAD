import { motion } from "motion/react";
import { History, Activity } from "lucide-react";
import { storage } from "../storage";

export function ActivityLogView({ isRtl }: { isRtl: boolean }) {
  const data = storage.getData();
  const logs = data.activityLogs || [];

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      <div>
        <h2 className="text-3xl font-black italic text-slate-800 uppercase">
          {isRtl ? "سجل نشاطات النظام" : "System Activity Logs"}
        </h2>
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden p-8">
        <div className="mb-6 flex items-center gap-3">
          <Activity className="text-primary" />
          <h3 className="text-lg font-black uppercase tracking-widest text-slate-800">
            {isRtl ? "سجل الحركات" : "Activity Feed"}
          </h3>
        </div>

        {logs.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold">
            {isRtl ? "لا توجد نشاطات مسجلة بعد" : "No activity recorded yet"}
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-slate-500">
                  <History size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">
                    {log.details}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{log.actorName}</span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-primary">{log.type}</span>
                    <span className="text-slate-300">({log.action})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
