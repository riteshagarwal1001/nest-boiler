import { Injectable, HttpService } from '@nestjs/common';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { Agent } from 'https';
import { Logger } from '../../logger/logger';

@Injectable()
export class NetworkService {
    private readonly logger = Logger.getInstance();

    private readonly httpsAgent = new Agent({
        keepAlive: true,
        rejectUnauthorized: false,
    });

    constructor(private httpService: HttpService) {}

    post(url: string, data: any, config: AxiosRequestConfig) {
        this.setHttpAgent(config);

        this.logger.log(
            { label: `Request ${url}`, method: this.post.name, message: data },
            NetworkService.name,
        );

        return this.httpService
            .post(url, data, config)
            .toPromise()
            .then((value: AxiosResponse) => {
                this.logger.log(
                    {
                        label: `Success ${url}`,
                        method: this.post.name,
                        message: value.data,
                    },
                    NetworkService.name,
                );

                return value.data;
            })
            .catch(reason => {
                const error =
                    (reason && reason.response && reason.response.data) ||
                    'Network failure';

                this.logger.error(
                    {
                        label: `Failure ${url}`,
                        method: this.post.name,
                        message: error,
                    },
                    null,
                    NetworkService.name,
                );

                throw { url, error, method: this.post.name };
            });
    }

    get(url: string, config: AxiosRequestConfig) {
        this.setHttpAgent(config);

        this.logger.log(
            { label: `Request ${url}`, method: this.get.name, message: null },
            NetworkService.name,
        );

        return this.httpService
            .get(url, config)
            .toPromise()
            .then((value: AxiosResponse) => {
                this.logger.log(
                    {
                        label: `Success ${url}`,
                        method: this.get.name,
                        message: value.data,
                    },
                    NetworkService.name,
                );

                return value.data;
            })
            .catch(reason => {
                const error =
                    (reason && reason.response && reason.response.data) ||
                    'Network failure';

                this.logger.error(
                    {
                        label: `Failure ${url}`,
                        method: this.get.name,
                        message: error,
                    },
                    reason,
                    NetworkService.name,
                );

                throw { url, error, method: this.get.name };
            });
    }

    private setHttpAgent(config: AxiosRequestConfig) {
        config = config || {};
        config.httpsAgent = this.httpsAgent;
    }
}
