require('dotenv').config();
const { execSync } = require('child_process');

try {
  console.log("Starting build and publishing to GitHub...");
  execSync('npm run build:electron -- -p always', { env: process.env, stdio: 'inherit' });
  console.log("Successfully published to GitHub!");
} catch (err) {
  console.error("Publish failed:", err.message);
  process.exit(1);
}
