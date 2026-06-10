const fs = require('fs');

let content = fs.readFileSync('src/views/GamraStockView.tsx', 'utf-8');

// Replace imports
content = content.replace(/import \{ useStore, useAuthStore \} from '\.\.\/store\/useStore';/g, "import { storage, AppData } from '../storage';");
content = content.replace(/import \{ api \} from '\.\.\/services\/apiService';/g, "");

// Change Component signature
const compRegex = /export default function Inventory\(\{ permissions \}: \{ permissions: any \}\) \{/;
const newComp = `export default function GamraStockView({ permissions, appData, setAppData, t, language }: { permissions: any, appData: AppData, setAppData: any, t: any, language: string }) {
  const products = appData.products || [];
  const categories = appData.categories || [];
  const suppliers = appData.suppliers || [];
  const onRefresh = () => setAppData(storage.getData());
  const setMessage = (msg: any) => console.log(msg);

  const api = {
    addCategory: async (name: string) => { const data = storage.getData(); data.categories.push({ id: Date.now().toString(), name }); storage.saveData(data); },
    deleteCategory: async (id: string) => { const data = storage.getData(); data.categories = data.categories.filter((c: any) => c.id !== id); storage.saveData(data); },
    addProduct: async (p: any) => { const data = storage.getData(); data.products.push({ ...p, id: Date.now().toString() }); storage.saveData(data); },
    updateProduct: async (id: string, p: any) => { const data = storage.getData(); data.products = data.products.map((prod: any) => prod.id === id ? { ...prod, ...p } : prod); storage.saveData(data); },
    deleteProduct: async (id: string) => { const data = storage.getData(); data.products = data.products.filter((prod: any) => prod.id !== id); storage.saveData(data); },
    adjustStock: async (id: string, adj: any) => { const data = storage.getData(); const p = data.products.find((prod: any) => prod.id === id); if (p) { if (adj.type === 'in') p.qty += adj.quantity; else p.qty -= adj.quantity; storage.saveData(data); } },
    addSupplier: async (s: any) => { const data = storage.getData(); data.suppliers.push({ ...s, id: Date.now().toString() }); storage.saveData(data); }
  };
`;
content = content.replace(compRegex, newComp);

// Remove old store hooks
content = content.replace(/const \{ products, categories, suppliers, fetchData: onRefresh, setMessage \} = useStore\(\);\n\s*const \{ language \} = useAuthStore\(\);\n\s*const t = translations\[language\];/g, '');
content = content.replace(/import \{ translations \} from '\.\.\/translations';/g, '');

fs.writeFileSync('src/views/GamraStockView.tsx', content, 'utf-8');

let content2 = fs.readFileSync('src/views/GamraSupplierView.tsx', 'utf-8');

// Replace imports
content2 = content2.replace(/import \{ useStore, useAuthStore \} from '\.\.\/store\/useStore';/g, "import { storage, AppData } from '../storage';");
content2 = content2.replace(/import \{ api \} from '\.\.\/services\/apiService';/g, "");

// Change Component signature
const compRegex2 = /export default function SupplierList\(\{ permissions \}: \{ permissions: any \}\) \{/;
const newComp2 = `export default function GamraSupplierView({ permissions, appData, setAppData, t, language }: { permissions: any, appData: AppData, setAppData: any, t: any, language: string }) {
  const suppliers = appData.suppliers || [];
  const checks = appData.cheques || [];
  const settings = appData.settings || {};
  const onRefresh = () => setAppData(storage.getData());
  const setMessage = (msg: any) => console.log(msg);

  const api = {
    addSupplier: async (s: any) => { const data = storage.getData(); data.suppliers.push({ ...s, id: Date.now().toString() }); storage.saveData(data); },
    updateSupplier: async (id: string, s: any) => { const data = storage.getData(); data.suppliers = data.suppliers.map((sup: any) => sup.id === id ? { ...sup, ...s } : sup); storage.saveData(data); },
    deleteSupplier: async (id: string) => { const data = storage.getData(); data.suppliers = data.suppliers.filter((sup: any) => sup.id !== id); storage.saveData(data); },
    addSupplierPayment: async (id: string, pay: any) => { 
        const data = storage.getData(); 
        const sup = data.suppliers.find((s: any) => s.id === id); 
        if (sup) { 
            sup.debt -= pay.amount; 
            if (pay.payment_method === 'CHECK') {
                data.cheques.push({
                    id: Date.now().toString(),
                    checkNumber: pay.check_number,
                    checkOwner: pay.check_owner,
                    total: pay.amount,
                    date: new Date().toISOString(),
                    partyName: sup.name,
                    partyRole: 'supplier',
                    type: 'supplier_payment'
                } as any);
            }
            data.sales.push({ id: Date.now().toString(), type: 'PAYMENT', amount: pay.amount, date: new Date().toISOString(), description: 'Supplier Payment', entityId: id } as any);
            storage.saveData(data); 
        } 
    },
    addSupplierCharge: async (id: string, amount: number, note: string) => { 
        const data = storage.getData(); 
        const sup = data.suppliers.find((s: any) => s.id === id); 
        if (sup) { 
            sup.debt += amount; 
            data.sales.push({ id: Date.now().toString(), type: 'DEBT', amount, date: new Date().toISOString(), description: note || 'Supplier Charge', entityId: id } as any);
            storage.saveData(data); 
        } 
    },
    getSupplierHistory: async (id: string) => { 
        const data = storage.getData(); 
        return data.sales.filter((s: any) => s.entityId === id); 
    }
  };
`;
content2 = content2.replace(compRegex2, newComp2);

// Remove old store hooks
content2 = content2.replace(/const \{ suppliers, checks, settings, fetchData: onRefresh, setMessage \} = useStore\(\);\n\s*const \{ language \} = useAuthStore\(\);/g, '');
content2 = content2.replace(/import \{ translations \} from '\.\.\/translations';/g, '');
content2 = content2.replace(/const t = translations\[language\];/g, '');
content2 = content2.replace(/import \{ generateStatementPDF \} from '\.\.\/services\/invoiceService';/g, "const generateStatementPDF = (a:any, b:any, c:any) => alert('Statement generator not ported yet');");

fs.writeFileSync('src/views/GamraSupplierView.tsx', content2, 'utf-8');
