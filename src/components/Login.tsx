import { useState } from "react";
import { motion } from "motion/react";
import {
  Lightbulb,
  Zap,
  Layers,
  Paintbrush,
  Droplet,
  ShieldCheck,
  Key,
} from "lucide-react";

export function Login({
  onLogin,
  error,
  t,
  isRtl,
}: {
  onLogin: (username: string, pass: string) => void;
  error: string | null;
  t: any;
  isRtl: boolean;
}) {
  const [username, setUsername] = useState("admin");
  const [pass, setPass] = useState("");
  return (
    <div
      className="relative flex h-screen items-center justify-center bg-slate-50 font-sans select-none overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Background glowing paint-splashes & light bulbs representing 'daw' (electricity/light) and 'sbagha' (paint/colors) */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-400/20 blur-[130px] pointer-events-none animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-400/25 blur-[130px] pointer-events-none animate-pulse"
        style={{ animationDuration: "10s" }}
      />
      <div
        className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDuration: "9s" }}
      />

      {/* Structural Hardware Grid layout (Blueprint pattern) representing droguerie & measures */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40" />

      {/* Flowing electric lines overlay representing wiring & electrical cables (les fils) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.3] pointer-events-none"
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg mx-4 p-8 md:p-12 rounded-[48px] bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] text-center overflow-hidden"
      >
        {/* Colorful top border representing hardware precision & colors */}
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-500" />

        {/* Dynamic Light Theme Brand Badges (Daw, Fils, Sbagha) */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {/* Electricity Badge (Daw) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50/75 hover:bg-amber-100/70 border border-amber-100 transition-all group cursor-pointer"
          >
            <div className="relative h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.15)] group-hover:shadow-[0_6px_20px_rgba(245,158,11,0.25)] transition-all">
              <Lightbulb
                size={26}
                className="text-amber-500 group-hover:scale-110 transition-transform"
              />
              <Zap
                size={14}
                className="absolute -bottom-1 -right-1 text-amber-500 fill-amber-400 animate-bounce"
              />
            </div>
            <span className="text-[10px] font-black text-amber-800 mt-3 tracking-wider uppercase">
              {isRtl ? "الكهرباء والإنارة" : "Électricité"}
            </span>
          </motion.div>

          {/* Wires & Cabling Badge (Fils) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50/75 hover:bg-sky-100/70 border border-sky-100 transition-all group cursor-pointer"
          >
            <div className="relative h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-sky-500 shadow-[0_4px_12px_rgba(14,165,233,0.15)] group-hover:shadow-[0_6px_20px_rgba(14,165,233,0.25)] transition-all">
              <Layers
                size={24}
                className="text-sky-500 rotate-45 group-hover:rotate-90 transition-transform"
                style={{ transitionDuration: "0.6s" }}
              />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-sky-500 animate-ping" />
            </div>
            <span className="text-[10px] font-black text-sky-800 mt-3 tracking-wider uppercase">
              {isRtl ? "الأسلاك والعقاقير" : "Fils & Matériel"}
            </span>
          </motion.div>

          {/* Paint & Colors Badge (Sbagha) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/75 hover:bg-emerald-100/70 border border-emerald-100 transition-all group cursor-pointer"
          >
            <div className="relative h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.15)] group-hover:shadow-[0_6px_20px_rgba(16,185,129,0.25)] transition-all">
              <Paintbrush
                size={24}
                className="text-emerald-500 group-hover:-rotate-12 transition-transform"
              />
              <Droplet
                size={12}
                className="absolute -top-1 -left-1 text-emerald-500 animate-pulse fill-emerald-400"
              />
            </div>
            <span className="text-[10px] font-black text-emerald-800 mt-3 tracking-wider uppercase">
              {isRtl ? "الصباغة والألوان" : "Peinture"}
            </span>
          </motion.div>
        </div>

        {/* Branding Titles */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-normal mb-2 font-sans italic">
            {isRtl
              ? "بوابة تسيير العقاقير، الصباغة والكهرباء"
              : "Droguerie, Peinture & Électricité"}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
              {isRtl
                ? "نظام مبيعات وتسيير المخازن المحترف"
                : "Secure Smart Retail Platform"}
            </p>
          </div>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-auto" />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl bg-red-50 border border-red-100 p-4 text-xs font-black text-red-600 uppercase tracking-widest"
          >
            {error}
          </motion.div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(username, pass);
          }}
          className="space-y-6"
        >
          <div className="relative bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-400/10 rounded-[28px] border-2 border-slate-200 focus-within:border-amber-500/60 transition-all p-2 pr-6 pl-6">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
              <Key size={20} />
            </div>
            <input
              type="text"
              placeholder={isRtl ? "اسم المستخدم (admin)" : "Username (admin)"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-16 bg-transparent text-center text-2xl font-black text-slate-900 placeholder-slate-300 outline-none tracking-[0.1em]"
            />
          </div>

          <div className="relative bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-400/10 rounded-[28px] border-2 border-slate-200 focus-within:border-amber-500/60 transition-all p-2 pr-6 pl-6">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
              <Key size={20} />
            </div>
            <input
              type="password"
              placeholder={`${t("admin_pass")} (1234)...`}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full h-16 bg-transparent text-center text-3xl font-black text-slate-900 placeholder-slate-300 outline-none tracking-[0.2em]"
            />
          </div>

          <button
            type="submit"
            className="w-full h-20 rounded-[28px] bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 hover:from-amber-600 hover:to-sky-600 text-white font-black uppercase tracking-[0.2em] shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_35px_-5px_rgba(16,185,129,0.45)] transition-all active:scale-[0.98] cursor-pointer"
          >
            {t("login")}
          </button>
        </form>

        {/* Powered and security watermark */}
        <div className="mt-10 flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">
          <ShieldCheck size={14} className="text-emerald-500 animate-pulse" />
          <span>
            {isRtl ? "حماية تامة • معالجة محلية آمنة" : "Secure Local Instance"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
