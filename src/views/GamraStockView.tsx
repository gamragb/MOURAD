import { translations, Language } from '../i18n';
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
  const isRtlValue = language === 'ar';
  const t = (key: string) => (translations[language as Language] as any)?.[key] || key;

  const products = appData.products || [];
  const categories = appData.categories || [];
  const suppliers = appData.suppliers || [];
  const api = {
    addCategory: async (name: string) => { 
      setAppData((prev: AppData) => ({ ...prev, categories: [...(prev.categories || []), { id: Date.now().toString() + Math.random().toString(36).slice(2, 6), name }] }));
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
    if (!name || !price || (!qty && !editingProduct)) return alert(t('enter_basic_fields'));
    
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
    if (confirm(t('confirm_delete_product'))) {
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
    if (confirm(t('confirm_delete_category'))) {
      await api.deleteCategory(id);
    }
  };
  const handleSetupDefaults = async () => {
    const defaults = ["ALTERNATEUR", "POMPE IMMERGEE", "ACCESSORIES POMPE IMMERGEE", "BALLON", "Peinture (الصباغة)", "Visserie (الفيس و البراغي)", "Outillage (الأدوات)", "Électricité (الكهرباء)", "Plomberie (الترصيص / الما)", "Matériaux (مواد البناء)", "Quincaillerie (خردوات متنوعة)", "PVC", "ELCTRO POMPE"];
    setAppData((prev: AppData) => {
      const existingCats = prev.categories || [];
      const newCats = defaults.filter(name => !existingCats.find((c:any) => c.name === name)).map((name, i) => ({
        id: Date.now().toString() + i + Math.random().toString(36).slice(2, 6),
        name
      }));
      return { ...prev, categories: [...existingCats, ...newCats] };
    });
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
            <Package className="w-7 h-7 text-primary" />{t('products_and_inventory')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('products_management_desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 hover:bg-border-subtle transition-all font-bold text-sm shadow-sm">
            <LayoutGrid className="w-4 h-4" />{t('categories_btn')}
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />{t('add_product')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Boxes} title={t('total_products_label')} value={totalProducts} colorClass="bg-blue-500/10 text-blue-500" />
        <StatCard icon={DollarSign} title={t('stock_value_label')} value={formatNumber(totalValue) + " " + t('mad')} colorClass="bg-green-500/10 text-green-500" />
        <StatCard icon={AlertTriangle} title={t('products_low_stock')} value={lowStockCount} colorClass="bg-amber-500/10 text-amber-500" />
        <StatCard icon={X} title={t('products_out_of_stock')} value={outOfStockCount} colorClass="bg-red-500/10 text-red-500" />
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder={t('search_product')}
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
            <option value="">{t('all_categories')}</option>
            <option value="none">{t('no_category')}</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          
          <select 
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value as any)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer font-bold"
          >
            <option value="all">{t('all_statuses')}</option>
            <option value="inStock">{t('status_available')}</option>
            <option value="lowStock">{t('status_low_stock')}</option>
            <option value="outOfStock">{t('status_out_of_stock')}</option>
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
                  <div className="flex items-center gap-2">{t('product_label')} {sortConfig?.key === 'name' && <ArrowUpDown className="w-3 h-3" />}</div>
                </th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">{t('category_supplier_label')}</th>
                <th onClick={() => handleSort('qty')} className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors select-none">
                  <div className="flex items-center gap-2">{t('quantity')} {sortConfig?.key === 'qty' && <ArrowUpDown className="w-3 h-3" />}</div>
                </th>
                {true && (
                  <th onClick={() => handleSort('costPrice')} className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors select-none">
                  <div className="flex items-center gap-2">{t('purchase_price')} {sortConfig?.key === 'costPrice' && <ArrowUpDown className="w-3 h-3" />}</div>
                </th>
              )}
                <th onClick={() => handleSort('price')} className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors select-none">
                  <div className="flex items-center gap-2">{t('sale_price')} {sortConfig?.key === 'price' && <ArrowUpDown className="w-3 h-3" />}</div>
                </th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Archive className="w-12 h-12 opacity-20" />
                      <p className="font-bold text-lg">{t('no_products_found').split('.')[0]}</p>
                      <p className="text-sm">{t('no_products_found')}</p>
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
                            {cat ? cat.name : t('no_category')}
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
                        <td className="p-4 font-bold text-slate-500 text-sm">{formatNumber(p.costPrice)} {t('mad')}</td>
                      )}
                      <td className="p-4 font-black text-slate-900 text-sm">{formatNumber(p.price)} {t('mad')}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setAdjustModal(p)} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors group relative">
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-main text-bg-base text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{t('adjust_stock')}</span>
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
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden" dir="ltr">
              <div className="p-8">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-8">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  {editingProduct ? t('edit_product_title') : t('add_product_title')}
                </h3>
                
                <form onSubmit={handleSaveProduct} className="space-y-6">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('product_name_label')}</label>
                      <input autoFocus required type="text" placeholder={t('product_name_label').replace(' *','')} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('category')}</label>
                      <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer font-medium text-slate-700" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                        <option value="">{t('no_category')}</option>
                        {categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="space-y-2 md:col-span-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('barcode_label')}</label>
                      <input type="text" placeholder={t('barcode_label')} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700" value={barcode} onChange={e => setBarcode(e.target.value)} />
                    </div>

                    <div className="space-y-2 md:col-span-3 relative">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('supplier')}</label>
                        <button type="button" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">+ {t('add_supplier')}</button>
                      </div>
                      <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer font-medium text-slate-700" value={supplier} onChange={e => setSupplier(e.target.value)}>
                        <option value="">{t('supplier_select')}</option>
                        {suppliers.map((s:any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('purchase_price_label')}</label>
                      <input type="number" step="0.01" min="0" placeholder={t('purchase_price')} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700" value={costPrice} onChange={e => setCostPrice(e.target.value)} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('sale_price_label')}</label>
                      <input required type="number" step="0.01" min="0" placeholder={t('sale_price')} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('quantity_label')}</label>
                      <input required type="number" min="0" placeholder={t('quantity')} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700 text-center" value={qty} onChange={e => setQty(e.target.value)} disabled={!!editingProduct} />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('min_qty_alert')}</label>
                      <input required type="number" min="0" placeholder="5" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700 text-center" value={minQty} onChange={e => setMinQty(e.target.value)} />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-widest transition-all">
                      {t('save_product')}
                    </button>
                  </div>
                </form>
                
                <button onClick={() => setShowAddProductModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Categories Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCategoryModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden" dir="ltr">
              <div className="p-8">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-8">
                  <Package className="w-5 h-5 text-indigo-600" />
                  {t('add_category_title')}
                </h3>
                
                <form onSubmit={handleAddCategory} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('category_name_label')}</label>
                    <input autoFocus required type="text" placeholder={t('category_name_label').replace(' *','')} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                  </div>
                  
                  <div className="pt-2">
                    <button type="submit" className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-black uppercase tracking-widest hover:border-indigo-500 transition-all shadow-sm">
                      {t('save_category')}
                    </button>
                  </div>
                </form>

                <div className="mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('categories_title')}</h4>
                    <button type="button" onClick={handleSetupDefaults} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-800 transition-colors">
                      <Plus className="w-3 h-3" /> {t('setup_defaults')}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2 pb-2">
                    {categories.length === 0 ? (
                      <p className="text-slate-400 text-sm font-medium w-full text-center py-4">{t('no_categories')}</p>
                    ) : categories.map((c: any) => (
                      <div key={c.id} className="group relative flex items-center justify-center px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl hover:border-indigo-500 transition-all cursor-default select-none">
                        <span className="text-xs font-black text-slate-900">{c.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c.id); }} className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button onClick={() => setShowCategoryModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
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
                <h3 className="text-xl font-black text-slate-900">{t('adjust_stock_title')}</h3>
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
                      {t('add_quantity')}
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="type" value="out" className="peer sr-only" />
                    <div className="py-2.5 text-center rounded-lg text-sm font-bold text-slate-500 peer-checked:bg-red-500 peer-checked:text-white transition-all peer-checked:shadow-md">
                      {t('withdraw_quantity')}
                    </div>
                  </label>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{t('quantity')}</label>
                  <input name="qty" required type="number" min="1" placeholder="مثال: 10" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xl font-black text-center focus:border-primary outline-none transition-all" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setAdjustModal(null)} className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-bold uppercase tracking-widest hover:bg-border-subtle transition-all">{t('cancel')}</button>
                  <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">{t('confirm_btn')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
