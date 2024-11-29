import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";
import { MarkedService } from "src/core/service/marked.service";

@Injectable()
export class WebhookService {

    constructor(private readonly configService: ConfigService, private readonly markedService: MarkedService) { }

    isValidSignature(payload: string, signature: string) {
        const hmac = createHmac('sha256', this.configService.get('github.secret'));
        const digest = `sha256=${hmac.update(payload).digest('hex')}`;
        return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    }

    async updateMarkdown() {
        return this.markedService.updateMarkdown();
    }

}