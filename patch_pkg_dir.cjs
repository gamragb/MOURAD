const fs = require('fs');
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.build.directories = {
  output: "build-release"
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
