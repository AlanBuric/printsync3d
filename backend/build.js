import { build } from 'esbuild';

(async () => {
  try {
    await build({
      entryPoints: ['./src/server.ts'],
      outfile: './dist/PrintSync3D.cjs',
      bundle: true,
      platform: 'node',
      sourcemap: false,
      minify: true,
    });

    console.log('Build successful!');
  } catch (error) {
    console.error('Build failed:', error);
    // eslint-disable-next-line no-undef
    process.exit(1);
  }
})();
