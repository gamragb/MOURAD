import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Archive, Plus, Edit2, Trash2, 
  AlertTriangle, Store, X, Package, LayoutGrid, Save, ArrowUpDown, Tag, DollarSign, Boxes, Download, Upload, Eye
} from 'lucide-react';
import { formatNumber, cn } from '../utils';
import { storage, AppData } from '../storage';

type SortKey = 'name' | 'price' | 'costPrice' | 'qty' | 'supplier';
type SortConfig = { key: SortKey; direction: 'asc' | 'desc' } | null;

export default function GamraStockView({ permissions, appData, setAppData, language }: { permissions: any, appData: AppData, setAppData: any, language: string }) {
  const products = appData.products || [];
  const categories = appData.categories || [];
  const suppliers = appData.suppliers || [];
  const api = {
    addCategory: async (name: string) => { 
      setAppData((prev: AppData) => ({ ...prev, categories: [...(prev.categories || []), { id: Date.now().toString(), name }] }));
    },
    deleteCategory: async (id: string) => { 
      setAppData((prev: AppData) => ({ ...prev, categories: (prev.categories || []).filter((c: any) => c.id !== id) }));
    },
    addProduct: async (p: any) => { 
      setAppData((prev: AppData) => ({ ...prev, products: [...(prev.products || []), { ...p, id: Date.now().toString() }] }));
    },
    updateProduct: async (id: string, p: any) => { 
      setAppData((prev: AppData) => ({ ...prev, products: (prev.products || []).map((prod: any) => prod.id === id ? { ...prod, ...p } : prod) }));
    },
    deleteProduct: async (id: string) => { 
      setAppData((prev: AppData) => ({ ...prev, products: (prev.products || []).filter((prod: any) => prod.id !== id) }));
    },
    adjustStock: async (id: string, adj: any) => { 
      setAppData((prev: AppData) => {
        const products = [...(prev.products || [])];
        const idx = products.findIndex(prod => prod.id === id);
        if (idx !== -1) {
          const prod = { ...products[idx] };
          if (adj.type === 'in') prod.qty += adj.quantity; else prod.qty -= adj.quantity;
          products[idx] = prod;
        }
        return { ...prev, products };
      });
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all');
  
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [qty, setQty] = useState('');
  const [minQty, setMinQty] = useState('5');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplier, setSupplier] = useState('');
  
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + ((p.costPrice || p.price) * (p.qty || 0)), 0);
  const lowStockCount = products.filter(p => p.qty <= (p.minQty || 5) && p.qty > 0).length;
  const outOfStockCount = products.filter(p => p.qty <= 0).length;

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode?.includes(searchQuery);
      const matchCategory = filterCategoryId ? (filterCategoryId === 'none' ? !p.category : p.category === filterCategoryId) : true;
      let matchStatus = true;
      if (filterStockStatus === 'inStock') matchStatus = p.qty > (p.minQty || 5);
      if (filterStockStatus === 'lowStock') matchStatus = p.qty <= (p.minQty || 5) && p.qty > 0;
      if (filterStockStatus === 'outOfStock') matchStatus = p.qty <= 0;
      return matchSearch && matchCategory && matchStatus;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';
        if (typeof aVal === 'string' || typeof bVal === 'string') {
          return sortConfig.direction === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
        }
        return sortConfig.direction === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
      });
    }

    return filtered;
  }, [products, searchQuery, filterCategoryId, filterStockStatus, sortConfig]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName(''); setPrice(''); setCostPrice(''); setQty(''); setMinQty('5');
    setBarcode(''); setCategoryId(''); setSupplier('');
    setShowAddProductModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setName(p.name || ''); setPrice(p.price || ''); setCostPrice(p.costPrice || ''); 
    setQty(p.qty || ''); setMinQty(p.minQty || '5'); setBarcode(p.barcode || ''); 
    setCategoryId(p.category || ''); setSupplier(p.supplier || '');
    setShowAddProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || (!qty && !editingProduct)) return alert("يرجى إدخال الحقول الأساسية");
    
    const pData = {
      name, price: Number(price), costPrice: Number(costPrice) || 0,
      qty: Number(qty) || 0, minQty: Number(minQty) || 5, barcode,
      category: categoryId, supplier
    };

    if (editingProduct) {
      await api.updateProduct(editingProduct.id, { ...pData, qty: editingProduct.qty });
    } else {
      await api.addProduct(pData);
    }
    setShowAddProductModal(false);
    setShowAddProductModal(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await api.deleteProduct(id);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    await api.addCategory(newCategoryName);
    setNewCategoryName('');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      await api.deleteCategory(id);
    }
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
            <Package className="w-7 h-7 text-primary" />
            المخزون والمنتجات
          </h1>
          <p className="text-slate-500 text-sm mt-1">إدارة منتجاتك، وتصنيفاتك، ومتابعة الكميات بكل سهولة</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 hover:bg-border-subtle transition-all font-bold text-sm shadow-sm">
            <LayoutGrid className="w-4 h-4" /> التصنيفات
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> إضافة منتج
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Boxes} title="إجمالي المنتجات" value={totalProducts} colorClass="bg-blue-500/10 text-blue-500" />
        <StatCard icon={DollarSign} title="قيمة المخزون" value={formatNumber(totalValue) + " درهم"} colorClass="bg-green-500/10 text-green-500" />
        <StatCard icon={AlertTriangle} title="منتجات قاربت على النفاذ" value={lowStockCount} colorClass="bg-amber-500/10 text-amber-500" />
        <StatCard icon={X} title="منتجات نفدت" value={outOfStockCount} colorClass="bg-red-500/10 text-red-500" />
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="بحث باسم المنتج أو الباركود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary outline-none font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer font-bold"
          >
            <option value="">كل التصنيفات</option>
            <option value="none">بدون تصنيف</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          
          <select 
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value as any)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer font-bold"
          >
            <option value="all">كل الحالات</option>
            <option value="inStock">متوفر</option>
            <option value="lowStock">قارب على النفاذ</option>
            <option value="outOfStock">نفد</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th onClick={() => handleSort('name')} className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors select-none">
                  <div className="flex items-center gap-2">المنتج {sortConfig?.key === 'name' && <ArrowUpDown className="w-3 h-3" />}</div>
                </th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">التصنيف / المورد</th>
                <th onClick={() => handleSort('qty')} className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors select-none">
                  <div className="flex items-center gap-2">الكمية {sortConfig?.key === 'qty' && <ArrowUpDown className="w-3 h-3" />}</div>
                </th>
                {true && (
                  <th onClick={() => handleSort('costPrice')} className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors select-none">
                    <div className="flex items-center gap-2">ثمن الشراء {sortConfig?.key === 'costPrice' && <ArrowUpDown className="w-3 h-3" />}</div>
                  </th>
                )}
                <th onClick={() => handleSort('price')} className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors select-none">
                  <div className="flex items-center gap-2">ثمن البيع {sortConfig?.key === 'price' && <ArrowUpDown className="w-3 h-3" />}</div>
                </th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Archive className="w-12 h-12 opacity-20" />
                      <p className="font-bold text-lg">لا توجد منتجات</p>
                      <p className="text-sm">لم يتم العثور على أي منتج يطابق بحثك.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p: any) => {
                  const cat = categories.find((c:any) => c.id === p.category);
                  const isLow = p.qty <= (p.minQty || 5) && p.qty > 0;
                  const isOut = p.qty <= 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{p.name}</span>
                          {p.barcode && <span className="text-[10px] text-slate-500 font-mono tracking-wider">{p.barcode}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-500 w-fit">
                            {cat ? cat.name : 'بدون تصنيف'}
                          </span>
                          {p.supplier && <span className="text-[10px] text-primary/80 font-medium">{p.supplier}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "inline-flex items-center justify-center min-w-[2.5rem] h-6 rounded-lg text-xs font-black shadow-sm border",
                            isOut ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                            isLow ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                            "bg-green-500/10 text-green-500 border-green-500/20"
                          )}>
                            {p.qty}
                          </span>
                        </div>
                      </td>
                      {true && (
                        <td className="p-4 font-bold text-slate-500 text-sm">{formatNumber(p.costPrice)} درهم</td>
                      )}
                      <td className="p-4 font-black text-slate-900 text-sm">{formatNumber(p.price)} درهم</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setAdjustModal(p)} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors group relative">
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-main text-bg-base text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">تعديل المخزون</span>
                          </button>
                          <button onClick={() => openEditModal(p)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddProductModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" dir="rtl">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" />
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h3>
                <button onClick={() => setShowAddProductModal(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">اسم المنتج *</label>
                    <input autoFocus required type="text" placeholder="مثال: حليب ممتاز" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">الباركود</label>
                    <input type="text" placeholder="123456789..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono" value={barcode} onChange={e => setBarcode(e.target.value)} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">التصنيف</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer font-bold" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                      <option value="">بدون تصنيف</option>
                      {categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">ثمن الشراء</label>
                    <div className="relative">
                      <input type="number" step="0.01" min="0" placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold" value={costPrice} onChange={e => setCostPrice(e.target.value)} />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-black">درهم</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">ثمن البيع *</label>
                    <div className="relative">
                      <input required type="number" step="0.01" min="0" placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-black text-primary" value={price} onChange={e => setPrice(e.target.value)} />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xs font-black">درهم</span>
                    </div>
                  </div>

                  {!editingProduct && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">الكمية الأولية *</label>
                      <input required type="number" min="0" placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-black" value={qty} onChange={e => setQty(e.target.value)} />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">المورد</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer font-bold" value={supplier} onChange={e => setSupplier(e.target.value)}>
                      <option value="">اختيار مورد...</option>
                      {suppliers.map((s:any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-black uppercase tracking-widest hover:border-text-secondary/30 transition-all">إلغاء</button>
                  <button type="submit" className="flex-1 py-3.5 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">حفظ المنتج</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Categories Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCategoryModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" dir="rtl">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <LayoutGrid className="w-6 h-6 text-primary" />
                  إدارة التصنيفات
                </h3>
                <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                  <input required type="text" placeholder="اسم التصنيف الجديد..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none font-medium" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                  <button type="submit" className="px-5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> إضافة
                  </button>
                </form>
                
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {categories.length === 0 ? (
                    <p className="text-center text-slate-500 py-4 text-sm font-bold">لا توجد تصنيفات بعد.</p>
                  ) : categories.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-primary/30 transition-colors">
                      <span className="font-bold text-slate-900">{c.name}</span>
                      <button onClick={() => handleDeleteCategory(c.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Stock Adjustment Modal */}
        {adjustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAdjustModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" dir="rtl">
              <div className="p-6 border-b border-slate-200 bg-slate-50/30">
                <h3 className="text-xl font-black text-slate-900">تعديل المخزون</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">{adjustModal.name}</p>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const qty = Number(formData.get('qty'));
                const type = formData.get('type');
                if (qty > 0) {
                  await api.adjustStock(adjustModal.id, { type, quantity: qty });
                  setAdjustModal(null);
                  setAdjustModal(null);
                }
              }} className="p-6 space-y-5">
                <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="type" value="in" defaultChecked className="peer sr-only" />
                    <div className="py-2.5 text-center rounded-lg text-sm font-bold text-slate-500 peer-checked:bg-green-500 peer-checked:text-white transition-all peer-checked:shadow-md">
                      إضافة كمية
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="type" value="out" className="peer sr-only" />
                    <div className="py-2.5 text-center rounded-lg text-sm font-bold text-slate-500 peer-checked:bg-red-500 peer-checked:text-white transition-all peer-checked:shadow-md">
                      سحب كمية
                    </div>
                  </label>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">الكمية</label>
                  <input name="qty" required type="number" min="1" placeholder="مثال: 10" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xl font-black text-center focus:border-primary outline-none transition-all" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setAdjustModal(null)} className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-bold uppercase tracking-widest hover:bg-border-subtle transition-all">إلغاء</button>
                  <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">تأكيد</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
