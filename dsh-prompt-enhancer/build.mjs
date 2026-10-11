import { build } from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
await build({ entryPoints: [join(root, 'src/index.mjs')], outfile: join(root, 'lib/index.js'), bundle: true, format: 'esm', platform: 'node', target: 'node22', external: ['@deepseek-ai/*', 'node:*'] });
await build({ entryPoints: [join(root, 'src/client.jsx')], outfile: join(root, 'lib/client.js'), bundle: true, format: 'cjs', platform: 'browser', target: 'es2022', jsx: 'automatic', external: ['@deepseek-ai/*', 'react', 'react-dom', 'react/jsx-runtime'], banner: { js: "window.__ModuleLoader__.load({id:'dsh-prompt-enhancer',factory:(require)=>{var module={exports:{}};var exports=module.exports;" }, footer: { js: 'return module.exports;}});' } });
