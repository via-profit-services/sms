import { Logger } from '@via-profit-services/core';
import type { Provider, SendResult, SendParams, ProviderSMSRUProps, SendResultError, SendResultSuccess } from '@via-profit-services/sms';
import type { IncomingMessage } from 'http';
import https, { RequestOptions } from 'https';
import { URL } from 'url';

const URL_SEND = 'https://sms.ru/sms/send';

const codes: Record<string, string> = {
  '-1': 'Message not found',
  100: 'the Request is fulfilled or the message is in our queue',
  101: 'the Message is passed to the operator',
  102: 'the Message is sent (in transit)',
  103: 'Message delivered',
  104: 'could Not be delivered to: life time expired',
  105: 'could Not be delivered to: removed statement',
  106: 'could Not be delivered: a glitch in the phone',
  107: 'could Not be delivered: unknown reason',
  108: 'could Not be delivered: rejected',
  110: 'the Message has been read (for Viber, unemployed)',
  150: 'could Not be delivered: no route found for this number',
  200: 'Invalid api_id',
  201: 'Not enough funds on the personal account',
  202: 'Incorrectly specified recipient\'s phone number or he doesn\'t have a route',
  203: 'No message text',
  204: 'sender Name is not consistent with the administration',
  205: 'the Message is too long (more than 8 SMS)',
  206: 'The daily limit for sending messages will be exceeded or has already been exceeded',
  207: 'There is no route for delivering messages to this number',
  208: 'The time parameter is specified incorrectly',
  209: 'You added this number (or one of the numbers) to the stop list',
  210: 'is Used GET where you want to use POST',
  211: 'Method not found',
  212: 'the message Text should be passed in UTF-8 (you gave in another encoding)',
  213: 'there are more than 100 numbers in the recipient list',
  220: 'the Service is temporarily unavailable, please try later',
  230: 'you have Exceeded the total limit of the number of messages to this number on the day',
  231: 'you have Exceeded the limit of identical messages to this number per minute',
  232: 'you have Exceeded the limit of identical messages to this number on the day of',
  233: 'The limit for sending repeated messages with a code to this number in a short period of time has been exceeded ("fraud protection", you can disable it in the "Settings" section)',
  300: 'Incorrect token (it may have expired, or your IP has changed)',
  301: 'Incorrect api_id, or username / password',
  302: 'The user is logged in, but the account is not confirmed (the user did not enter the code sent in the registration sms)',
  303: 'The confirmation code is incorrect',
  304: 'Too many confirmation codes were sent. Please repeat the request later',
  305: 'Too many incorrect code entries, please try again later',
  500: 'Server error. Repeat the request.',
  901: 'Callback: URL invalid (does not start with http://)',
  902: 'Callback: Handler not found (may have been deleted earlier)',
}

interface Response {
  status: 'OK';
  status_code: number;
  balance: number;
  sms: Record<string, {
    status: 'OK';
    status_code: number;
    sms_id: string;
  }>;
}


class ProviderSMSRU implements Provider {

  props: ProviderSMSRUProps;
  logger: Logger;

  constructor(props: ProviderSMSRUProps, logger: Logger) {
    this.props = props;
    this.logger = logger;
  }

  public async send(params: SendParams): Promise<SendResult> {
    const { phones, message, sender } = params;
    const { apiID } = this.props;

    const url = new URL(URL_SEND);
    url.searchParams.append('api_id', apiID);
    url.searchParams.append('json', '1');
    phones.forEach((phone) => {
      url.searchParams.append(`to[${phone}]`, message);
    });

    if (sender) {
      url.searchParams.append('from', sender);
    }

    const response = await this.sendRequest(url);
    let parsedResponse: Response;

    try {
      parsedResponse = JSON.parse(response);
    } catch (err) {

      this.logger.error('Failed to parse server response', { err });

      return phones.map((phone) => ({
        phone,
        result: false,
        error: {
          msg: 'Failed to parse server response',
          code: 0,
        },
      }));
    }


    const resData = Object.entries(parsedResponse.sms).map(([phone, data]) => {

      if (data.status === 'OK') {
        this.logger.debug(`sms.ru / Message for «${phone}» sent successfully`);

        return {
          phone,
          result: true,
        } as SendResultSuccess;
      }

      const statusCode = data.status_code;
      const errorMessage = statusCode in codes ? codes[statusCode] : 'Unknown Error';
      this.logger.error(errorMessage);

      return {
        result: false,
        error: {
          msg: errorMessage,
          code: statusCode,
        },
      } as SendResultError
    });

    return resData;
  }

  public sendRequest(params: RequestOptions): Promise<string> {

    return new Promise((resolve, reject) => {
      const callback = (response: IncomingMessage) => {
        let str = '';

        // another chunk of data has been received, so append it to `str`
        response.on('data', (chunk) => {
          str += chunk;
        });

        //the whole response has been received, so we just print it out here
        response.on('end', () => {
          resolve(str);
        });

        // the whole response has been received, so we just print it out here
        response.on('error', (err) => {
          reject(err);
        });
      }

      const request = https.request(params, callback);

      request.end();
    });
  }
}

export default ProviderSMSRU;
