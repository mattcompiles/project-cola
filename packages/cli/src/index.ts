import { start } from '@cola/core';
import yargs from 'yargs';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs(process.argv.slice(2))
  .scriptName('cola')
  .command({
    command: 'start',
    builder: () => yargs.options({}),
    handler: async () => {
      await start();
    },
  })
  .help()
  .wrap(72).argv;
