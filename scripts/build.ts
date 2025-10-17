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

const envDefs: Record<keyof typeof ESBUILDENV, string> = {
  APPID: getEnv('APPID'),
  PRIVATE_KEY: getEnv('PRIVATE_KEY'),
  WEBHOOK_SECRET: getEnv('WEBHOOK_SECRET'),
};

await build({
  entryPoints: ['src/index.ts'],
  minify: true,
  bundle: true,
  outfile: 'dist/index.js',
  platform: 'neutral',
  format: 'esm',
  define: {
    ...envDefs,
  },
  // logLevel: 'verbose',
  external: ['node:buffer', 'node:crypto'],
});

export {};
