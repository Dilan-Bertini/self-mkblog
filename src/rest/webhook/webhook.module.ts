import { Module } from "@nestjs/common";
import { CoreModule } from "src/core/core.module";
import { WebhookController } from "./webhook.controller";
import { WebhookService } from "./webhook.service";

@Module({
    imports: [
        CoreModule,
    ],
    controllers: [
        WebhookController
    ],
    providers: [
        WebhookService,
    ],
})
export class WebhookModule { }