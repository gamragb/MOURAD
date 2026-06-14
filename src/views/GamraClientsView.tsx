import { translations, Language } from '../i18n';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Archive, Plus, Edit2, Trash2, 
  Users, X, DollarSign, Eye
} from 'lucide-react';
import { formatNumber, cn } from '../utils';
import { storage, AppData, TransactionRecord } from '../storage';

export default function GamraClientsView({ permissions, appData, setAppData, language }: { permissions: any, appData: AppData, setAppData: any, language: string }) {
  const isRtlValue = language === 'ar';
  const t = (key: string) => (translations[language as Language] as any)?.[key] || key;

  const clients = appData.clients || [];
  const onRefresh = () => setAppData(storage.getData());

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [adjustDebtModal, setAdjustDebtModal] = useState<any>(null);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  // Stats
  const totalClients = clients.length;
  const totalClientDebt = clients.reduce((sum, c) => sum + (c.debt || 0), 0);
  
  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone?.includes(searchQuery)
    );
  }, [clients, searchQuery]);

  const openAddModal = () => {
    setEditingClient(null);
    setName(''); setPhone(''); setAddress(''); setNotes('');
    setShowAddClientModal(true);
  };

  const openEditModal = (c: any) => {
    setEditingClient(c);
    setName(c.name || ''); setPhone(c.phone || ''); 
    setAddress(c.address || ''); setNotes(c.notes || '');
    setShowAddClientModal(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert(t('enter_client_name'));
    
    const cData = { name, phone, address, notes };
    const data = storage.getData();
    
    if (!data.clients) data.clients = [];

    if (editingClient) {
      data.clients = data.clients.map((cli: any) => cli.id === editingClient.id ? { ...cli, ...cData } : cli);
    } else {
      data.clients.push({ ...cData, id: Date.now().toString(), debt: 0, transactions: [], paymentHistory: [], createdAt: new Date().toISOString() });
    }
    storage.saveData(data);
    setShowAddClientModal(false);
    onRefresh();
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm(t('confirm_delete_client'))) {
      const data = storage.getData();
      data.clients = data.clients.filter((cli: any) => cli.id !== id);
      storage.saveData(data);
      onRefresh();
    }
  };

  const handleAdjustDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const amount = Number(formData.get('amount'));
    const type = formData.get('type') as 'add' | 'pay';
    const note = formData.get('note') as string;
    const paymentMethod = formData.get('paymentMethod') as string || 'cash';
    const checkNumber = formData.get('checkNumber') as string;

    if (!amount || amount <= 0) return;

    const data = storage.getData();
    const clientIndex = data.clients.findIndex((c:any) => c.id === adjustDebtModal.id);
    if (clientIndex === -1) return;

    const transaction: TransactionRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: type === 'add' ? 'charge' : 'payment',
      amount,
      description: note,
      note,
      paymentMethod,
      checkNumber
    };

    if (type === 'add') {
      data.clients[clientIndex].debt += amount;
    } else {
      data.clients[clientIndex].debt -= amount;
    }

    if (!data.clients[clientIndex].transactions) {
      data.clients[clientIndex].transactions = [];
    }
    data.clients[clientIndex].transactions.unshift(transaction);

    storage.saveData(data);
    setAdjustDebtModal(null);
    if (clientDetails) {
        setClientDetails(data.clients[clientIndex]);
    }
    onRefresh();
  };

  const StatCard = ({ icon: Icon, title, value, colorClass }: any) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in space-y-6" dir="rtl">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />{t('clients_management')}</h1>
          <p className="text-slate-500 text-sm mt-1">إدارة معلومات الزبائن، وتتبع الحسابات والديون (الكريدي) بسهولة</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />{t('add_client')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard icon={Users} title="إجمالي الزبائن" value={totalClients} colorClass="bg-blue-500/10 text-blue-500" />
        <StatCard icon={DollarSign} title="مجموع ديون الزبائن (كريدي)" value={true ? formatNumber(totalClientDebt) + " درهم" : '***'} colorClass="bg-red-500/10 text-red-500" />
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder={t('search_client')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary outline-none font-medium"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">اسم الزبون</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">التواصل</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">ديون الزبون (الكريدي)</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Archive className="w-12 h-12 opacity-20" />
                      <p className="font-bold text-lg">لا يوجد زبائن</p>
                      <p className="text-sm">لم يتم العثور على أي زبون يطابق بحثك.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                        {c.notes && <span className="text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5">{c.notes}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-mono text-slate-500 font-bold">{c.phone || '—'}</span>
                        {c.address && <span className="text-[10px] text-primary/80 font-medium">{c.address}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      {true ? (
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-black shadow-sm border",
                            (c.debt || 0) > 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                            (c.debt || 0) < 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                            "bg-slate-50 border-slate-200 text-slate-500"
                          )}>
                            {formatNumber(Math.abs(c.debt || 0))} درهم
                          </span>
                          {(c.debt || 0) > 0 && <span className="text-[10px] font-bold text-red-500">{t('credit')}</span>}
                          {(c.debt || 0) < 0 && <span className="text-[10px] font-bold text-green-500">مسبق</span>}
                        </div>
                      ) : <span className="text-sm font-black text-slate-500">***</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {true && (
                          <button onClick={() => setAdjustDebtModal(c)} className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors group relative">
                            <DollarSign className="w-4 h-4" />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-main text-bg-base text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">إدارة الديون</span>
                          </button>
                        )}
                        <button onClick={() => setClientDetails(c)} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors group relative">
                          <Eye className="w-4 h-4" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-main text-bg-base text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{t('details_and_archive')}</span>
                        </button>
                        <button onClick={() => openEditModal(c)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors group relative">
                          <Edit2 className="w-4 h-4" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-main text-bg-base text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{t('edit')}</span>
                        </button>
                        <button onClick={() => handleDeleteClient(c.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors group relative">
                          <Trash2 className="w-4 h-4" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-main text-bg-base text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Details & History Modal */}
      <AnimatePresence>
        {clientDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setClientDetails(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" dir="rtl">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/30 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{clientDetails.name}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">{clientDetails.phone} {clientDetails.address ? `• ${clientDetails.address}` : ''}</p>
                  </div>
                </div>
                <button onClick={() => setClientDetails(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">الرصيد الحالي (الكريدي)</p>
                    <div className="flex items-center gap-3">
                      <h2 className={cn("text-3xl font-black", (clientDetails.debt || 0) > 0 ? "text-red-500" : "text-green-500")}>
                        {formatNumber(Math.abs(clientDetails.debt || 0))} درهم
                      </h2>
                      {(clientDetails.debt || 0) > 0 && <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-bold">كريدي غير مدفوع</span>}
                      {(clientDetails.debt || 0) < 0 && <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold">دفع مسبق</span>}
                    </div>
                  </div>
                  {true && (
                    <button onClick={() => setAdjustDebtModal(clientDetails)} className="px-5 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all flex items-center gap-2">
                      <DollarSign className="w-5 h-5" /> إدارة الديون
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Archive className="w-5 h-5 text-primary" />{t('transaction_history')}</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-right">
                      <thead className="bg-white border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-xs font-black text-slate-500 uppercase tracking-widest">{t('date')}</th>
                          <th className="p-3 text-xs font-black text-slate-500 uppercase tracking-widest">{t('type')}</th>
                          <th className="p-3 text-xs font-black text-slate-500 uppercase tracking-widest">{t('amount')}</th>
                          <th className="p-3 text-xs font-black text-slate-500 uppercase tracking-widest">{t('notes')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {(!clientDetails.transactions || clientDetails.transactions.length === 0) ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500 font-bold text-sm">{t('no_previous_transactions')}</td>
                          </tr>
                        ) : (
                          clientDetails.transactions.map((t:any) => (
                            <tr key={t.id} className="hover:bg-white/50 transition-colors">
                              <td className="p-3 text-sm font-bold text-slate-500" dir="ltr">
                                {new Date(t.date).toLocaleString('fr-FR')}
                              </td>
                              <td className="p-3">
                                {t.type === 'charge' ? (
                                  <span className="inline-flex px-2 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                                    إضافة كريدي
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">{t('clear_amount')}</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className={cn("text-sm font-black", t.type === 'charge' ? "text-red-500" : "text-green-500")}>
                                  {t.type === 'charge' ? '+' : '-'}{formatNumber(t.amount)} درهم
                                </span>
                              </td>
                              <td className="p-3 text-sm text-slate-500 font-medium">
                                {t.note || '—'}
                                {t.paymentMethod === 'check' && (
                                  <div className="mt-1 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded inline-block font-bold">
                                    شيك رقم: {t.checkNumber || '—'}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Adjust Debt Modal */}
        {adjustDebtModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAdjustDebtModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" dir="rtl">
              <div className="p-6 border-b border-slate-200 bg-slate-50/30">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  إدارة الكريدي
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-bold">{adjustDebtModal.name}</p>
              </div>
              <form onSubmit={handleAdjustDebt} className="p-6 space-y-5">
                <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="type" value="pay" defaultChecked className="peer sr-only" />
                    <div className="py-2.5 text-center rounded-lg text-sm font-bold text-slate-500 peer-checked:bg-green-500 peer-checked:text-white transition-all peer-checked:shadow-md">
                      دفع مبلغ (تخليص)
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="type" value="add" className="peer sr-only" />
                    <div className="py-2.5 text-center rounded-lg text-sm font-bold text-slate-500 peer-checked:bg-red-500 peer-checked:text-white transition-all peer-checked:shadow-md">
                      إضافة كريدي جديد
                    </div>
                  </label>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">المبلغ *</label>
                  <div className="relative">
                    <input name="amount" required type="number" step="0.01" min="0.01" placeholder="مثال: 500" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-2xl font-black text-center focus:border-primary outline-none transition-all" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">{t('mad')}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">ملاحظة أو وصف</label>
                  <input name="note" type="text" placeholder="مثال: دفعة من حساب كريدي الأمس..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-medium" />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">{t('payment_method')}</label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="paymentMethod" value="cash" defaultChecked className="peer sr-only" onChange={(e) => {
                        const checkDiv = document.getElementById('check-input-div-' + (adjustDebtModal?.id || ''));
                        if(checkDiv) checkDiv.style.display = 'none';
                      }} />
                      <div className="py-2.5 text-center rounded-xl text-sm font-bold text-slate-500 border border-slate-200 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all">
                        نقدي (Cash)
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="paymentMethod" value="check" className="peer sr-only" onChange={(e) => {
                        const checkDiv = document.getElementById('check-input-div-' + (adjustDebtModal?.id || ''));
                        if(checkDiv) checkDiv.style.display = 'block';
                      }} />
                      <div className="py-2.5 text-center rounded-xl text-sm font-bold text-slate-500 border border-slate-200 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all">
                        شيك (Check)
                      </div>
                    </label>
                  </div>
                </div>

                <div id={'check-input-div-' + (adjustDebtModal?.id || '')} style={{display: 'none'}}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">رقم الشيك</label>
                  <input name="checkNumber" type="text" placeholder="أدخل رقم الشيك هنا..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-medium" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setAdjustDebtModal(null)} className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-bold uppercase tracking-widest hover:bg-border-subtle transition-all">{t('cancel')}</button>
                  <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">{t('confirm_operation')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add / Edit Client Modal */}
        {showAddClientModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddClientModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" dir="rtl">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  {editingClient ? 'تعديل الزبون' : 'إضافة زبون جديد'}
                </h3>
                <button onClick={() => setShowAddClientModal(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveClient} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">اسم الزبون *</label>
                    <input autoFocus required type="text" placeholder="مثال: أحمد..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">رقم الهاتف</label>
                    <input type="text" placeholder="06..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">العنوان</label>
                    <input type="text" placeholder="عنوان الزبون..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={address} onChange={e => setAddress(e.target.value)} />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">ملاحظات (اختياري)</label>
                    <textarea rows={3} placeholder="أي معلومات إضافية..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setShowAddClientModal(false)} className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-black uppercase tracking-widest hover:border-text-secondary/30 transition-all">{t('cancel')}</button>
                  <button type="submit" className="flex-1 py-3.5 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">حفظ الزبون</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
