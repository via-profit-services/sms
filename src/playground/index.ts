/* eslint-disable no-console */
import { factory } from '@via-profit-services/core';
import express from 'express';
import { createServer } from 'http';

import * as sms from '../index';
import schema from './schema';

(async () => {

  const port = 9005;
  const app = express();
  const server = createServer(app);
  const smsMiddleware = sms.factory({
    // provider: 'smsc.ru',
    // login: '',
    // password: '',

    provider: 'sms.ru',
    apiID: '',
  });

  const { graphQLExpress } = await factory({
    server,
    schema,
    debug: true,
    middleware: [smsMiddleware],
  });

  app.use(graphQLExpress);
  server.listen(port, () => {
    console.log(`Started at http://localhost:${port}/graphql`);
  });
})();
// import SMS from '../index';

// (async () => {
//   const smsService = new SMS({
//     smsc: {
//       login: 'via-profit',
//       password: 'nonprofitproject',
//     },
//   });

//   const res = await smsService.send('smsc', {
//     phones: ['79122129984'],
//     message: 'test',
//   });

//   console.log({ res });
// })();