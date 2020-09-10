import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
    constructor(private webhookService: WebhookService) {}

    @Post()
    handleWebhook(@Body() webhookDto: any) {
        return this.webhookService.handleWebhook(webhookDto);
    }
}
