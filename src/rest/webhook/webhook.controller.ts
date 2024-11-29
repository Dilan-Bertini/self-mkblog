import { Body, Controller, Get, Headers, Post, UnauthorizedException } from "@nestjs/common";
import { WebhookService } from "./webhook.service";

@Controller('webhook')
export class WebhookController {

    constructor(private readonly webhookService: WebhookService) { }

    @Post()
    async handlePush(@Headers('x-hub-signature-256') signature: string, @Body() body) {
        const payload = JSON.stringify(body);

        if (!this.webhookService.isValidSignature(payload, signature)) {
            throw new UnauthorizedException();
        }

        return this.webhookService.updateMarkdown();
    }

    @Get('force')
    async forceUpdate() {
        return this.webhookService.updateMarkdown();
    }
}