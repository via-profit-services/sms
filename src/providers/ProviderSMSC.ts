import { Logger } from '@via-profit-services/core';
import type { Provider, SendResult, SendParams, ProviderSMSCProps, SendResultError, SendResultSuccess } from '@via-profit-services/sms';
import type { IncomingMessage } from 'http';
import https, { RequestOptions } from 'https';
import { URL } from 'url';


interface ResponseError {
  error: string;
  error_code: number;
}

interface ResponseSuccess {
  id: string;
  cnt: number;
  cost: string;
  balance: string;
}

const URL_SEND = 'https://smsc.ru/sys/send.php';

class ProviderSMSC implements Provider {

  props: ProviderSMSCProps;
  logger: Logger;

  constructor(props: ProviderSMSCProps, logger: Logger) {
    this.props = props;
    this.logger = logger;
  }

  private isSuccessResponse(
    response: ResponseError | ResponseSuccess): response is ResponseSuccess {
    return (response as ResponseError).error === undefined;
  }


  public async send(params: SendParams): Promise<SendResult> {
    const { phones, message, sender, emulate } = params;
    const { login, password } = this.props;

    if (emulate) {

      return phones.map((phone) => ({
        phone,
        result: true,
      }));
    }

    const url = new URL(URL_SEND);
    url.searchParams.append('login', login);
    url.searchParams.append('psw', password);
    url.searchParams.append('charset', 'utf-8');
    url.searchParams.append('fmt', '3');
    url.searchParams.append('cost', '3');
    url.searchParams.append('phones', phones.join(','));
    url.searchParams.append('mes', message);

    if (sender) {
      url.searchParams.append('sender', sender);
    }

    const response = await this.sendRequest(url);
    let parsedResponse: ResponseSuccess | ResponseError;

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

    const retData: SendResult = phones.map((phone) => {

      if (this.isSuccessResponse(parsedResponse)) {
        this.logger.debug(
          `smsc.ru / Message for «${phone}» sent successfully. Cost(RUB): ${parsedResponse.cost}. Chunks: ${parsedResponse.cnt}`,
        );

        return {
          phone,
          result: true,
        } as SendResultSuccess
      }

      this.logger.debug(
        `smsc.ru / Message for «${phone}» sent failed`, { err: parsedResponse.error },
      );

      return {
        phone,
        result: false,
        error: {
          msg: parsedResponse.error,
          code: parsedResponse.error_code,
        },
      } as SendResultError;
    });

    return retData;
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

export default ProviderSMSC;
