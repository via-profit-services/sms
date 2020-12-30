import { Middleware } from '@via-profit-services/core';
import { Configuration } from '@via-profit-services/sms';

import { ProviderSMSC, ProviderSMSRU } from './providers';
import smsLogger from './sms-logger';
import SMSService from './SMSService';

const middlewareFactory = (configuration: Configuration): Middleware => {
  const { provider } = configuration;
  const pool: ReturnType<Middleware> = {
    context: null,
  };

  const middleware: Middleware = ({ context, config }) => {

    const { logDir } = config;

    if (pool.context) {
      return pool;
    }


    const logger = smsLogger({ logDir });

    pool.context = context;
    pool.context.logger.sms = logger;

    const providerConfig: Configuration = {
      provider,
      ...configuration,
    };

    switch (provider) {
      case 'sms.ru':
        pool.context.services.sms = new SMSService(ProviderSMSRU, providerConfig, logger);
        break;

      case 'smsc.ru':
        default:
          pool.context.services.sms = new SMSService(ProviderSMSC, providerConfig, logger);
        break;
    }


    return pool;
  };

  return middleware;
};

export default middlewareFactory;
