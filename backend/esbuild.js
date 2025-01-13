import { build } from 'esbuild';

await build({
  entryPoints: ['./dist/src/server.js'],
  outfile: './dist/PrintSync3D.js',
  bundle: true,
  platform: 'node',
  sourcemap: false,
  minify: true,
  format: 'esm',
  // We'll only need to run `npm i serialport --no-package-lock --no-save
  external: ['@serialport'],
  mainFields: ['module', 'main'],
  banner: {
    js: "import { createRequire } from 'module'; import path from 'path'; import {fileURLToPath} from 'url'; const require = createRequire(import.meta.url); const __dirname = path.dirname(fileURLToPath(import.meta.url));",
  },
})
  .then(() => console.log('Build successful!'))
  .catch((error) => {
    console.error('Build failed:', error);
    // eslint-disable-next-line no-undef
    process.exit(1);
  });
