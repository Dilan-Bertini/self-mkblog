import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { readFile } from "fs/promises";
import Handlebars from "handlebars";
import { formatDate } from "../util/date";

@Injectable()
export class HbsService {
    private indexTemplate: HandlebarsTemplateDelegate
    private layoutTemplate: HandlebarsTemplateDelegate;

    constructor(private readonly configService: ConfigService) { }

    private async loadIndexTemplate() {
        const data = await readFile(this.configService.get('handlebars.index'), { encoding: "utf8" });
        this.indexTemplate = Handlebars.compile(data);
    }

    private async loadLayoutTemplate() {
        const data = await readFile(this.configService.get('handlebars.layout'), { encoding: "utf8" });
        this.layoutTemplate = Handlebars.compile(data);
    }

    async injectIndex(title: string, content: string) {
        if (!this.indexTemplate)
            await this.loadIndexTemplate();

        // YYYY MM DD 
        const compileDate = formatDate(new Date());

        return this.indexTemplate({
            title,
            content,
            compileDate,
        })

    }

    async injectLayout(title: string, content: string) {
        if (!this.layoutTemplate)
            await this.loadLayoutTemplate();

        // YYYY MM DD 
        const compileDate = formatDate(new Date());

        return this.layoutTemplate({
            title,
            content,
            compileDate,
        });
    }

}