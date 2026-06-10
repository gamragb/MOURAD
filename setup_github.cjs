const fs = require('fs');
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.build.publish = {
  provider: "github",
  owner: "gamragb",
  repo: "MOURAD"
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
console.log('GitHub linked in package.json');
