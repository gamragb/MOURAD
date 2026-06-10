const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add imports at the beginning (after license)
if (!text.includes("import GamraStockView")) {
    const lines = text.split('\n');
    lines.splice(5, 0, "import GamraStockView from './views/GamraStockView';\nimport GamraSupplierView from './views/GamraSupplierView';");
    text = lines.join('\n');
}

// 2. Ensure Store is in lucide-react import
if (!text.includes("Store, ") && !text.includes("Store ")) {
    text = text.replace(/import \{([^}]+)\} from "lucide-react";/, (m, p1) => {
        return `import { Store, ${p1} } from "lucide-react";`;
    });
}

// 3. Ensure react import is clean
text = text.replace(/import \{ Store,\s*/, "import { ");

fs.writeFileSync('src/App.tsx', text, 'utf-8');
console.log("App.tsx patched again.");
