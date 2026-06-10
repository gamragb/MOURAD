import re

with open('src/views/GamraStockView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace imports
content = re.sub(r"import \{ useStore, useAuthStore \} from '../store/useStore';", "import { storage, AppData } from '../storage';", content)
content = re.sub(r"import \{ api \} from '../services/apiService';", "", content)

# Change Component signature
content = re.sub(r'export default function Inventory\(\{ permissions \}: \{ permissions: any \}\) \{', 
'''export default function GamraStockView({ permissions, appData, setAppData, t, language }: { permissions: any, appData: AppData, setAppData: any, t: any, language: string }) {
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
''', content)

# Remove old store hooks
content = re.sub(r'const \{ products, categories, suppliers, fetchData: onRefresh, setMessage \} = useStore\(\);\n  const \{ language \} = useAuthStore\(\);\n  const t = translations\[language\];', '', content)
content = re.sub(r"import \{ translations \} from '../translations';", '', content)

with open('src/views/GamraStockView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/views/GamraSupplierView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace imports
content = re.sub(r"import \{ useStore, useAuthStore \} from '../store/useStore';", "import { storage, AppData } from '../storage';", content)
content = re.sub(r"import \{ api \} from '../services/apiService';", "", content)

# Change Component signature
content = re.sub(r'export default function SupplierList\(\{ permissions \}: \{ permissions: any \}\) \{', 
'''export default function GamraSupplierView({ permissions, appData, setAppData, t, language }: { permissions: any, appData: AppData, setAppData: any, t: any, language: string }) {
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
                });
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
''', content)

# Remove old store hooks
content = re.sub(r'const \{ suppliers, checks, settings, fetchData: onRefresh, setMessage \} = useStore\(\);\n  const \{ language \} = useAuthStore\(\);', '', content)
content = re.sub(r"import \{ translations \} from '../translations';", '', content)
content = re.sub(r'const t = translations\[language\];', '', content)
content = re.sub(r"import \{ generateStatementPDF \} from '../services/invoiceService';", "const generateStatementPDF = (a:any, b:any, c:any) => alert('Statement generator not ported yet');", content)

with open('src/views/GamraSupplierView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
