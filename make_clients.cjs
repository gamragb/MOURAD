const fs = require('fs');

const inputPath = 'C:/Users/HP/Downloads/gamra/src/pages/CustomerList.tsx';
const outputPath = 'C:/Users/HP/Downloads/MOURAD/src/views/GamraClientsView.tsx';

let content = fs.readFileSync(inputPath, 'utf8');

// Replace top level imports
content = content.replace(/import \{ useStore, useAuthStore \} from '\.\.\/store\/useStore';/, 'import { storage, AppData } from \'../storage\';');

// Remove api import
content = content.replace(/import \{ api \} from '\.\.\/services\/apiService';/, '');

// Replace function signature
content = content.replace(/export default function CustomerList\(\) \{[\s\S]*?const t = translations\[language\];/, 
`export default function GamraClientsView({ permissions, appData, setAppData, t, language }: { permissions: any, appData: AppData, setAppData: any, t: any, language: string }) {
  const customers = appData.clients || [];
  const sales = appData.sales || [];
  const payments = appData.sales.filter(s => s.type === 'PAYMENT') || [];
  const settings = appData.settings || {};
  const onRefresh = () => setAppData(storage.getData());
  const setMessage = (msg: any) => console.log(msg);

  const api = {
    addCustomer: async (c: any) => { const data = storage.getData(); data.clients.push({ ...c, id: Date.now().toString() }); storage.saveData(data); },
    updateCustomer: async (id: string, c: any) => { const data = storage.getData(); data.clients = data.clients.map((cus: any) => cus.id === id ? { ...cus, ...c } : cus); storage.saveData(data); },
    addPayment: async (id: string, p: any) => { 
        const data = storage.getData(); 
        const cus = data.clients.find((c: any) => c.id === id); 
        if (cus) { 
            cus.debt -= p.amount; 
            if (p.payment_method === 'CHECK') {
                data.cheques = data.cheques || [];
                data.cheques.push({
                    id: Date.now().toString(),
                    checkNumber: p.check_number,
                    checkOwner: p.check_owner,
                    total: p.amount,
                    date: new Date().toISOString(),
                    partyName: cus.name,
                    partyRole: 'customer',
                    type: 'customer_payment'
                });
            }
            data.sales.push({ id: Date.now().toString(), type: 'PAYMENT', amount: p.amount, date: new Date().toISOString(), description: 'Customer Payment', entityId: id });
            storage.saveData(data); 
        } 
    },
    addCharge: async (id: string, amount: number, note: string) => { 
        const data = storage.getData(); 
        const cus = data.clients.find((c: any) => c.id === id); 
        if (cus) { 
            cus.debt += amount; 
            data.sales.push({ id: Date.now().toString(), type: 'DEBT', amount, date: new Date().toISOString(), description: note || 'Customer Charge', entityId: id });
            storage.saveData(data); 
        } 
    },
    getCustomerHistory: async (id: string) => { 
        const data = storage.getData(); 
        return data.sales.filter((s: any) => s.entityId === id); 
    },
    returnProduct: async (id: string, returnData: any) => {
        // Mock return product
    }
  };
`);

content = '// @ts-nocheck\n' + content;

fs.writeFileSync(outputPath, content);
console.log('Created GamraClientsView.tsx');
