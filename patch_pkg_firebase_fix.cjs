const fs = require('fs');
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.scripts["publish"] = "vite build && electron-builder && npx firebase-tools deploy --only hosting";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
