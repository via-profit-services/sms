// Type definitions for @via-profit-services/sms
// Project: git@github.com:via-profit-services/sms
// Definitions by: Via Profit <https://github.com/via-profit-services>
// Warning: This is not autogenerated definitions!

/// <reference types="node" />
declare module '@via-profit-services/sms' {
  import { Logger, Middleware } from '@via-profit-services/core';

  export type ProviderName = 'smsc.ru' | 'sms.ru';

  export interface ProviderSMSCProps {
    provider: 'smsc.ru';
    login: string;
    password: string;
  }

  export interface ProviderSMSRUProps {
    provider: 'sms.ru';
    apiID: string;
  }

  export type Configuration = ProviderSMSCProps | ProviderSMSRUProps;

  export interface SendResultSuccess {
    phone: string;
    result: true;
  }

  export interface SendResultError {
    phone: string;
    result: false;
    error: {
      msg: string;
      code: number;
    };
  }

  export type SendResult = Array<SendResultSuccess | SendResultError>;

  export interface SendParams {
    phones: string[];
    message: string;
    sender?: string;
    emulate?: boolean;
  }

  export type MiddlewareFactory = (configuration: Configuration) => Middleware;

  export interface ProviderSMSRUProps {
    apiID: string;
  }

  export interface Provider {
    send(params: SendParams): Promise<SendResult>;
  }

  class ProviderSMSC implements Provider {
    constructor(props: ProviderSMSCProps, logger: Logger);
    send(params: SendParams): Promise<SendResult>;
  }

  class ProviderSMSRU implements Provider {
    constructor(props: ProviderSMSRUProps, logger: Logger);
    send(params: SendParams): Promise<SendResult>;
  }

  class SMSService {
    constructor(props: Configuration);
    send(params: SendParams): Promise<SendResult>;
  }


  export const factory: MiddlewareFactory;
}


declare module '@via-profit-services/core' {
  import { SMSService } from '@via-profit-services/sms';

  interface ServicesCollection {
    /**
     * SMS service
     */
    sms: SMSService;
  }

  interface LoggersCollection {
    /**
     * SMS service logger \
     * \
     * Transports:
     *  - `debug` - File transport
     *  - `error` - Console transport
     */
    sms: Logger;
  }
}