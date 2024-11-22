#!/usr/bin/env node

import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/sharedCode.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
// eslint-disable-next-line no-undef
}).catch(() => process.exit(1));