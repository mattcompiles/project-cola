import path from 'path';
import { existsSync, promises as fs } from 'fs';
import debug from 'debug';
import { build } from 'esbuild';
import onDeath from 'death';
// @ts-expect-error
import alias from 'esbuild-plugin-alias';

import { createServerManager } from './server-watcher';

const log = debug('cola');

const cwd = process.cwd();

export async function start() {
  const outdir = path.join(cwd, 'dist');

  if (existsSync(outdir)) {
    await fs.rm(outdir, { recursive: true });
  }

  await fs.mkdir(outdir);

  const serverOutputFile = path.join(outdir, 'server.js');
  const staticOutputDir = path.join(outdir, 'static');

  const serverManager = createServerManager(serverOutputFile);

  const clientResult = await build({
    watch: {
      onRebuild(error) {
        if (error) {
          console.error('watch build failed:', error);
        } else {
        }
      },
    },
    target: ['safari11'],
    entryPoints: [require.resolve('@cola/core/client')],
    metafile: true,
    platform: 'browser',
    bundle: true,
    minify: false,
    absWorkingDir: cwd,
    outdir: staticOutputDir,
    plugins: [
      alias({
        __APP__: path.join(cwd, 'src/App.tsx'),
      }),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
  });

  const clientFiles = Object.keys(clientResult?.metafile?.outputs || {}).map(
    (file) => path.basename(file),
  );

  log('Client build finished: %o', clientFiles);

  const serverResult = await build({
    watch: {
      onRebuild(error) {
        if (error) {
          console.error('watch build failed:', error);
        } else {
          serverManager.start({ clientFiles, staticDir: staticOutputDir });
        }
      },
    },
    target: ['node14'],
    entryPoints: [require.resolve('@cola/core/server')],
    metafile: true,
    platform: 'node',
    bundle: true,
    minify: false,
    absWorkingDir: cwd,
    outfile: serverOutputFile,
    plugins: [
      alias({
        __APP__: path.join(cwd, 'src/App.tsx'),
      }),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
  });

  log('Server build finished');
  serverManager.start({ clientFiles, staticDir: staticOutputDir });

  onDeath(() => {
    if (clientResult.stop) {
      clientResult.stop();
    }
    if (serverResult.stop) {
      serverResult.stop();
    }
    serverManager.kill();
  });
}
