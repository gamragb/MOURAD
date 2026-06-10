const fs = require('fs');

const vitePath = 'vite.config.ts';
let viteConfig = fs.readFileSync(vitePath, 'utf8');

if (!viteConfig.includes("base: './'")) {
    viteConfig = viteConfig.replace("export default defineConfig(({mode}) => {", "export default defineConfig(({mode}) => {\n  const base = './';");
    viteConfig = viteConfig.replace("return {", "return {\n    base,");
    fs.writeFileSync(vitePath, viteConfig, 'utf8');
}
