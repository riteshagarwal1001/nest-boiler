import { Injectable, NotImplementedException } from '@nestjs/common';
import { Logger } from '../logger/logger';

@Injectable()
export class WebhookService {
    private readonly logger = Logger.getInstance();

    async handleWebhook(webhookDto: any) {
        const { event } = webhookDto;
        switch (event) {
            default:
                this.logger.error(
                    {
                        method: `handleWebhook`,
                        message: new NotImplementedException(),
                    },
                    null,
                    WebhookService.name,
                );
        }
    }
}
