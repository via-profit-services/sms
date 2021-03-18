import { Middleware } from '@via-profit-services/core';
import type { Configuration, MiddlewareFactory } from '@via-profit-services/sms';

import { ProviderSMSC, ProviderSMSRU } from './providers';
import smsLogger from './sms-logger';
import SMSService from './SMSService';

const middlewareFactory: MiddlewareFactory = (configuration) => {
  const { provider } = configuration;

  const middleware: Middleware = ({ context, config }) => {
    const { logDir } = config;
    const logger = smsLogger({ logDir });

    context.logger.sms = logger;

    const providerConfig: Configuration = {
      provider,
      ...configuration,
    };

    switch (provider) {
      case 'sms.ru':
        context.services.sms = new SMSService(ProviderSMSRU, providerConfig, logger);
        break;

      case 'smsc.ru':
        default:
          context.services.sms = new SMSService(ProviderSMSC, providerConfig, logger);
        break;
    }


    return {
      context,
    };
  };

  return middleware;
};

export default middlewareFactory;
