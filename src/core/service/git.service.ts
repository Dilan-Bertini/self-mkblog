import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { basename, join, normalize } from "path";
import execAsync from "../util/exec_async";

@Injectable()
export class GitService {
    constructor(private readonly configService: ConfigService) { }

    async updateRepository() {
        const inputFolderPath = this.configService.get('markdown.input');
        const repository = this.configService.get('github.repository');

        // Check if the input folder exist if it's not clone the repository, otherwise update it
        // And get the updated files (or all of them if it didn't exist before)
        let toConvertFiles = [];
        let toDelete = [];
        if (!existsSync(normalize(join(inputFolderPath, '.git')))) {
            await execAsync(`cd ${normalize(join(inputFolderPath, '..'))} && git clone ${repository} ${inputFolderPath} `)
            toConvertFiles = (await readdir(inputFolderPath)).filter(v => v.endsWith('.md'));
        } else {
            await execAsync(`cd ${inputFolderPath} && git pull`);
            let res = await execAsync(`cd ${inputFolderPath} && git diff --diff-filter=AM --name-only HEAD^ HEAD -- '*.md'`)
            toConvertFiles = res.stdout.split('\n').filter(file => file.trim() !== '');
            res = await execAsync(`cd ${inputFolderPath} && git diff --diff-filter=D --name-only HEAD^ HEAD`)
            toDelete = res.stdout.split('\n').filter(file => file.trim() !== '');
        }

        return {
            toConvertFiles,
            toDelete,
        }
    }

    async getLastCommitDate(fileName: string) {
        const inputFolderPath = this.configService.get('markdown.input');
        const response = await execAsync(`cd ${inputFolderPath} && git log -1 --format=%cd --date=format-local:"%Y-%m-%d %H:%M:%S" -- ${fileName}`); 
        return response.stdout;
    }

    async getIndexData() {
        const inputFolderPath = this.configService.get('markdown.input');
        const toConvertFiles = (await readdir(inputFolderPath)).filter(v => v.endsWith('.md'));

        const indexData: Record<string, Array<{title: string, url: string}>> = {};

        for (const file of toConvertFiles) {

            const filename = basename(join(inputFolderPath, file), '.md').toLowerCase().trim();
            if (filename == 'index') continue;
            if (filename == '404') continue;

            const title = filename.charAt(0).toUpperCase() + filename.slice(1);
            const htmlFileName = filename.replace(/[^\w\d]+/gm, '-') + '.html';

            const commitDate = await this.getLastCommitDate(file);
            // Buld index data
            if (!(commitDate in indexData))
                indexData[commitDate] = [];
            
            indexData[commitDate].push({
                title,
                url: htmlFileName
            });

        }

        return indexData;
    }

}