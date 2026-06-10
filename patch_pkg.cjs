const fs = require('fs');

const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.main = "electron/main.cjs";

pkg.scripts["dev:electron"] = "concurrently \"vite\" \"wait-on tcp:3000 && electron .\"";
pkg.scripts["build:electron"] = "vite build && electron-builder";
// Command to publish to GitHub. The user will run this when they want to deploy an update.
pkg.scripts["publish"] = "vite build && electron-builder --publish always";

pkg.build = {
  "appId": "com.mourad.pos",
  "productName": "MOURAD",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron/**/*",
    "package.json"
  ],
  "win": {
    "target": ["nsis"]
  },
  "publish": {
    "provider": "github",
    "owner": "YOUR_GITHUB_USERNAME",
    "repo": "MOURAD_REPO_NAME"
  }
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
