const fs = require('fs');

let mainContent = fs.readFileSync('electron/main.cjs', 'utf-8');
mainContent = mainContent.replace('http://localhost:3000', 'http://localhost:5173');
fs.writeFileSync('electron/main.cjs', mainContent, 'utf-8');

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts["dev:electron"] = "concurrently \"vite\" \"wait-on tcp:5173 && electron .\"";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf8');
