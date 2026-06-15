import { translations, Language } from '../i18n';
import { useState } from "react";
import { motion } from "motion/react";
import { UserPlus, ShieldAlert, Key, Trash2 } from "lucide-react";
import { storage, UserProfile } from "../storage";

export function StaffManagementView({ currentUser,
  onRefresh,
  isRtl,
  t, language }: { currentUser: UserProfile;
  onRefresh: () => void;
  isRtl: boolean;
  t: any, language: string }) {
  const data = storage.getData();
  const users = data.users || [];

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager" | "staff">("staff");

  const [newPerms, setNewPerms] = useState({
    stock: true,
    customers: false,
    history: false,
    profits: false,
    viewCostPrice: false,
    editStock: false,
    supplierDebt: false,
    financials: false,
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    if (users.find(u => u.username === newUsername)) {
      alert(t('username_exists'));
      return;
    }

    const newUser: UserProfile = {
      id: Date.now().toString(),
      username: newUsername,
      password: newPassword,
      role: newRole,
      permissions: newRole === 'admin' ? {
        stock: true,
        customers: true,
        history: true,
        profits: true,
        viewCostPrice: true,
        editStock: true,
        supplierDebt: true,
        financials: true,
      } : newPerms,
      createdAt: new Date().toISOString()
    };

    storage.update("users", [...users, newUser]);
    storage.logActivity('STAFF', 'create', `تمت إضافة موظف: ${newUsername}`, currentUser.id, currentUser.username);
    
    setNewUsername("");
    setNewPassword("");
    onRefresh();
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert(t('cannot_delete_own_account'));
      return;
    }
    if (window.confirm(t('confirm_delete_employee'))) {
      const userToDelete = users.find(u => u.id === id);
      storage.update("users", users.filter(u => u.id !== id));
      storage.logActivity('STAFF', 'delete', `تم حذف موظف: ${userToDelete?.username}`, currentUser.id, currentUser.username);
      onRefresh();
    }
  };

  const togglePermission = (id: string, permKey: keyof typeof newPerms) => {
    const user = users.find(u => u.id === id);
    if (!user || user.role === 'admin') return;

    const updated = users.map(u => {
      if (u.id === id) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [permKey]: !u.permissions[permKey]
          }
        };
      }
      return u;
    });
    storage.update("users", updated);
    storage.logActivity('STAFF', 'update', `تعديل صلاحيات: ${user.username}`, currentUser.id, currentUser.username);
    onRefresh();
  };

  if (currentUser.role !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center text-red-500 font-bold text-2xl">{t('no_access_permission')}</div>
    );
  }

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      <div>
        <h2 className="text-3xl font-black italic text-slate-800 uppercase">
          {t('employees_management')}
        </h2>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <h3 className="mb-6 text-lg font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
          <UserPlus className="text-primary" />
          {t('add_new_staff')}
        </h3>
        
        <form onSubmit={handleAddUser} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <input
              type="text"
              placeholder={t('username')}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800 outline-none focus:border-primary focus:bg-white"
              required
            />
            <input
              type="password"
              placeholder={t('password')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800 outline-none focus:border-primary focus:bg-white"
              required
            />
            <select
              value={newRole}
              onChange={(e: any) => setNewRole(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800 outline-none focus:border-primary focus:bg-white"
            >
              <option value="staff">{t('sales_role')}</option>
              <option value="manager">{t('custom_role')}</option>
              <option value="admin">{t('system_admin')}</option>
            </select>
          </div>

          {newRole !== 'admin' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">
                {t('set_permissions')}
              </h4>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Object.keys(newPerms).map((k) => (
                  <label key={k} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(newPerms as any)[k]}
                      onChange={(e) => setNewPerms({ ...newPerms, [k]: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-bold text-slate-700">{k}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="rounded-2xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary/90 active:scale-95"
          >
          {t('add_account_btn')}
          </button>
        </form>
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className={`p-6 text-xs font-black uppercase tracking-widest text-slate-400 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('user_col')}
              </th>
              <th className={`p-6 text-xs font-black uppercase tracking-widest text-slate-400 text-center`}>
                {t('role')}
              </th>
              <th className={`p-6 text-xs font-black uppercase tracking-widest text-slate-400 text-center`}>
                {t('permissions_label')}
              </th>
              <th className={`p-6 text-xs font-black uppercase tracking-widest text-slate-400 ${isRtl ? 'text-left' : 'text-right'}`}>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-6">
                  <div className="font-bold text-slate-800">
                    {u.username}
                    {u.id === currentUser.id && (
                      <span className="ml-2 rounded bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">
                        {t('you_label')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    u.role === 'admin' ? 'bg-primary/10 text-primary' : 
                    u.role === 'manager' ? 'bg-amber-100 text-amber-700' : 
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {u.role === 'admin' ? (
                      <span className="text-xs font-bold text-emerald-500">{t('all_permissions')}</span>
                    ) : (
                      Object.keys(u.permissions || {}).map((k) => (
                        <button
                          key={k}
                          onClick={() => togglePermission(u.id, k as any)}
                          className={`rounded px-2 py-1 text-[10px] font-bold border ${
                            (u.permissions as any)[k] 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          {k}
                        </button>
                      ))
                    )}
                  </div>
                </td>
                <td className="p-6">
                  <div className={`flex items-center gap-2 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === currentUser.id}
                      className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
