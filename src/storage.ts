/**
 * storage.ts
 * Manages local persistence for a purely offline POS system.
 */

const STORAGE_KEY = 'POS_LOCAL_DATA';

export interface Category {
  id: string;
  name: string;
}

export interface PaymentRecord {
  date: string;
  amount: number;
  id?: string;
  method?: string;
}

export interface TransactionRecord {
  id: string;
  type: 'PAYMENT' | 'DEBT' | 'SALE' | 'charge' | 'payment';
  amount: number;
  date: string;
  description: string;
  note?: string;
  paymentMethod?: string;
  checkNumber?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  debt: number;
  paymentHistory: PaymentRecord[]; // legacy
  transactions?: TransactionRecord[]; // new advanced tracking
  createdAt: string;
  dueDate?: string;
}

export interface Cheque {
  id: string;
  clientName: string;
  chequeNumber: string;
  amount: number;
  bankName: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'bounced';
  createdAt: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  costPrice: number;
  qty: number;
  category: string;
  supplier?: string;
  minQty?: number;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  costPrice: number;
}

export interface Sale {
  id: string;
  total: number;
  discount: number;
  finalTotal: number;
  paymentMethod: 'cash' | 'card' | 'wallet' | 'credit' | 'check';
  type?: 'sale' | 'return';
  checkNumber?: string;
  items: SaleItem[];
  date: string;
  userId: string;
  clientId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  debt?: number; // Added from Gamra
  transactions?: TransactionRecord[]; // Added from Gamra
  createdAt: string;
}

// --- New Interfaces from Gamra ---

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'manager' | 'staff';
  permissions: {
    stock: boolean;
    customers: boolean;
    history: boolean;
    profits: boolean;
    viewCostPrice: boolean;
    editStock: boolean;
    supplierDebt: boolean;
    financials: boolean;
  };
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'SALE' | 'PAYMENT' | 'PRODUCT' | 'CUSTOMER' | 'STAFF' | 'STOCK' | 'CATEGORY';
  action: 'create' | 'update' | 'delete' | 'login';
  details: string;
  actorId: string;
  actorName: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'STOCK' | 'DEBT' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// --- AppData Update ---

export interface AppData {
  products: Product[];
  categories: Category[];
  clients: Client[];
  cheques?: Cheque[];
  sales: Sale[];
  reorderList: string[]; // List of product IDs
  settings: any;
  user: any; // legacy single user
  suppliers?: Supplier[];
  
  // New Arrays
  users?: UserProfile[];
  activityLogs?: ActivityLog[];
  notifications?: Notification[];
  activeUserId?: string | null;
}

const defaultData: AppData = {
  products: [],
  categories: [
    { id: '1', name: 'عام' },
    { id: '2', name: 'مشروبات' },
    { id: '3', name: 'خضروات' },
    { id: '4', name: 'ألبان' },
  ],
  clients: [],
  cheques: [],
  sales: [],
  reorderList: [],
  suppliers: [],
  users: [
    {
      id: 'admin-1',
      username: 'admin',
      password: '1234',
      role: 'admin',
      permissions: {
        stock: true,
        customers: true,
        history: true,
        profits: true,
        viewCostPrice: true,
        editStock: true,
        supplierDebt: true,
        financials: true,
      },
      createdAt: new Date().toISOString()
    }
  ],
  activityLogs: [],
  notifications: [],
  settings: {
    shopName: 'متجري الاحترافي',
    currency: 'DH',
    theme: 'light',
    language: 'ar',
    primaryColor: '#2563eb', 
    accentColor: '#10b981' 
  },
  user: {
    authenticated: false,
    password: '1234'
  }
};

export const storage = {
  getData: (): AppData => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    try {
      const parsed = JSON.parse(raw);
      // Ensure all arrays exist
      return {
        ...defaultData,
        ...parsed,
        settings: { ...defaultData.settings, ...(parsed.settings || {}) },
        reorderList: parsed.reorderList || [],
        products: parsed.products || [],
        categories: parsed.categories || [],
        clients: parsed.clients || [],
        cheques: parsed.cheques || [],
        sales: parsed.sales || [],
        suppliers: parsed.suppliers || [],
        users: parsed.users || defaultData.users,
        activityLogs: parsed.activityLogs || [],
        notifications: parsed.notifications || [],
      };
    } catch {
      return defaultData;
    }
  },

  saveData: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  update: (key: keyof AppData, value: any) => {
    const data = storage.getData();
    (data as any)[key] = value;
    storage.saveData(data);
  },

  logActivity: (
    type: ActivityLog['type'],
    action: ActivityLog['action'],
    details: string,
    actorId: string = 'system',
    actorName: string = 'النظام'
  ) => {
    const data = storage.getData();
    const newLog: ActivityLog = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      type,
      action,
      details,
      actorId,
      actorName,
      timestamp: new Date().toISOString()
    };
    
    // Keep only last 1000 logs to prevent localStorage bloat
    const updatedLogs = [newLog, ...(data.activityLogs || [])].slice(0, 1000);
    storage.update('activityLogs', updatedLogs);
  }
};
