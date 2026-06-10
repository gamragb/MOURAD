const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add Imports
const imports = `import GamraStockView from './views/GamraStockView';\nimport GamraSupplierView from './views/GamraSupplierView';\n`;
if (!content.includes('GamraStockView')) {
    // add after first import
    content = content.replace(/import [^\n]+;\n/, match => match + imports);
}

// 2. Replace <StockView ... /> block
const stockViewRegex = /<StockView\s+key="stock"[\s\S]+?\/>/;
if (stockViewRegex.test(content)) {
    content = content.replace(stockViewRegex, `<GamraStockView\n                key="stock"\n                appData={appData}\n                setAppData={setAppData}\n                t={t}\n                language={isRtl ? 'ar' : 'fr'}\n                permissions={currentUser?.permissions || {}}\n              />`);
}

// 3. Add <GamraSupplierView /> under <GamraStockView /> block
if (!content.includes('activeTab === "suppliers"')) {
    const stockTabBlock = /{activeTab === "stock" && \([\s\S]+?<\/GamraStockView>\s*\)\s*}/;
    content = content.replace(stockTabBlock, match => `${match}\n            {activeTab === "suppliers" && (\n              <GamraSupplierView\n                key="suppliers"\n                appData={appData}\n                setAppData={setAppData}\n                t={t}\n                language={isRtl ? 'ar' : 'fr'}\n                permissions={currentUser?.permissions || {}}\n              />\n            )}`);
}

// 4. Add 'suppliers' to the Sidebar. Let's find the array of tabs.
// In MOURAD, they usually map over an array like `const menuItems = [...]` or `const tabs = [...]`.
// Let's search for `{ id: "stock", `
if (content.includes('id: "stock"')) {
    content = content.replace(/\{ id: "stock",([^}]+)\},/, match => `${match}\n      { id: "suppliers", label: isRtl ? "الموردين" : "Suppliers", icon: Store, role: "stock" },`);
} else if (content.includes('id: \'stock\'')) {
    content = content.replace(/\{ id: 'stock',([^}]+)\},/, match => `${match}\n      { id: 'suppliers', label: isRtl ? "الموردين" : "Suppliers", icon: Store, role: "stock" },`);
} else {
    // If not found, let's find the manual button for stock in sidebar.
    // E.g. <button ... onClick={() => setActiveTab('stock')}
    const stockBtnRegex = /<button[^>]+onClick=\{\(\) => setActiveTab\("stock"\)\}[^>]*>[\s\S]*?<\/button>/;
    if (stockBtnRegex.test(content)) {
        content = content.replace(stockBtnRegex, match => `${match}\n            <button\n              onClick={() => setActiveTab("suppliers")}\n              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all \${activeTab === "suppliers" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}\`}\n            >\n              <Store size={18} strokeWidth={2.5} />\n              {isRtl ? "الموردين" : "Suppliers"}\n            </button>`);
    }
}

// Ensure Store icon is imported from lucide-react
if (!content.includes('Store,')) {
    content = content.replace(/import \{([\s\S]+?)\} from "lucide-react";/, (match, p1) => {
        return `import { Store, ${p1} } from "lucide-react";`;
    });
}

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('App.tsx patched');
