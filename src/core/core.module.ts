import { Module } from "@nestjs/common";
import { GitService } from "./service/git.service";
import { HbsService } from "./service/hbs.service";
import { MarkedService } from "./service/marked.service";

@Module({
    providers: [
        GitService,
        MarkedService,
        HbsService
    ],
    exports: [
        GitService,
        MarkedService,
        HbsService
    ],
})
export class CoreModule { } 