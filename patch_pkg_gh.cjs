const fs = require('fs');
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Revert to GitHub provider
pkg.build.publish = {
  provider: "github",
  owner: "gamragb",
  repo: "MOURAD"
};

// Keep the C:/ output dir to bypass OneDrive
pkg.build.directories = {
  output: "C:/MOURAD_BUILD_OUTPUT"
};

// Update the publish script to use our node script
pkg.scripts["publish"] = "node publish.js";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
