import debug from 'debug';
import cluster from 'cluster';

const log = debug('cola');

export function createServerManager(serverFilePath: string) {
  let currentWorker: cluster.Worker | null = null;

  cluster.setupMaster({
    exec: serverFilePath,
    silent: false,
  });

  const killIfNotDead = () => {
    if (
      currentWorker &&
      currentWorker.isConnected() &&
      !currentWorker.isDead()
    ) {
      log('Ending server worker');
      currentWorker.kill();
      currentWorker = null;
    }
  };

  interface ServerConfig {
    clientFiles: Array<string>;
    staticDir: string;
  }
  const start = (config: ServerConfig) => {
    killIfNotDead();

    log('Starting server worker');
    const worker = cluster.fork();

    worker.on('exit', (code, signal) => {
      currentWorker = null;
      if (code) {
        console.error('Server worker exited unexpectedly:', { code, signal });
      }
    });

    worker.on('online', () => {
      log(`Server worker online. ID: %s`, worker.id);
      currentWorker = worker;

      currentWorker.send(config);
    });
  };

  const send = (params: any) => {
    if (currentWorker) {
      currentWorker.send(params);
    }
  };

  return { start, send, kill: killIfNotDead };
}
