const fs = require('fs');
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Update build publish configuration to use generic server
pkg.build.publish = {
  provider: "generic",
  url: "https://mourad-updates.web.app"
};

// Update publish script to deploy to firebase hosting instead of github
pkg.scripts["publish"] = "vite build && electron-builder && firebase deploy --only hosting";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
console.log('package.json updated for Firebase Hosting updates');
