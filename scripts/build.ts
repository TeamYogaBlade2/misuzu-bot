import { build } from 'esbuild';

declare global {
  const process: {
    env: Record<string, string|undefined>,
  }
}

const getEnv = (key: string) => {
  const v = process.env[key];
  if(!v) {
    throw new Error(`env "${key}" is not set`);
  }
  return v;
}

const envDefs: Record<`ESBUILDENV.${keyof typeof ESBUILDENV}`, string> = {
  'ESBUILDENV.APPID': getEnv('APPID'),
  'ESBUILDENV.PRIVATE_KEY': `"${getEnv('PRIVATE_KEY')}"`,
  'ESBUILDENV.WEBHOOK_SECRET': `"${getEnv('WEBHOOK_SECRET')}"`,
};

await build({
  entryPoints: ['src/index.ts'],
  minify: true,
  bundle: true,
  outfile: 'dist/index.js',
  platform: 'browser',
  format: 'esm',
  define: {
    ...envDefs,
  },
  // logLevel: 'verbose',
  // external: ['node:buffer', 'node:crypto'],
});

export {};
