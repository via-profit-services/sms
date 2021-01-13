import { Logger } from '@via-profit-services/core';
import { SendParams, SendResult, Configuration } from '@via-profit-services/sms';

import ProviderSMSC from './providers/ProviderSMSC';
import ProviderSMSRU from './providers/ProviderSMSRU';


class SMSService {
  provider: ProviderSMSC | ProviderSMSRU;
  logger: Logger;

  constructor(ProviderInstance: any, props: Configuration, logger: Logger) {
    this.provider = new ProviderInstance(props, logger) as ProviderSMSC;
    this.logger = logger;
  }

  public async send (params: SendParams): Promise<SendResult> {
    const { emulate } = params;
    const result = await this.provider.send(params);
    if (emulate) {
      // eslint-disable-next-line no-console
      console.log('SMS Emulation', { result });
    }

    return result;
  }
}

export default SMSService;
