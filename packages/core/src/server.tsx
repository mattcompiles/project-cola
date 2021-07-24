import express from 'express';
import path from 'path';
import React, { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import SharedEntry from './shared';

interface Config {
  clientFiles: Array<string>;
  staticDir: string;
}
const app = express();

const env = process.env.NODE_ENV || 'development';

if (env !== 'development') {
  // Disable x-powered-by header according to Express Best Practice
  // https://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable('x-powered-by');
}

interface HtmlProps {
  clientFiles: Array<string>;
  children: ReactNode;
}
function Html({ clientFiles, children }: HtmlProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Hello world</title>
      </head>
      <body>
        <div id="app">{children}</div>
        {clientFiles.map((file) => (
          <script key={file} src={file}></script>
        ))}
      </body>
    </html>
  );
}

process.on('message', (config: Config) => {
  console.log('Startup server with config:', config);

  app.use(express.static(config.staticDir));

  app.get('*', (req, res) => {
    const html = renderToString(
      <Html clientFiles={config.clientFiles}>
        <StaticRouter location={req.path}>
          <SharedEntry />
        </StaticRouter>
      </Html>,
    );

    res.send(html);
  });

  app.listen(8080);
});
