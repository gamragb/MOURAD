const fs = require('fs');
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.build.directories = {
  output: "C:/MOURAD_BUILD_OUTPUT"
};

pkg.scripts["publish"] = "vite build && electron-builder && xcopy /E /I /Y C:\\MOURAD_BUILD_OUTPUT\\* release\\ && npx firebase-tools deploy --only hosting";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
