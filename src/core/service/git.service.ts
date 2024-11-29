import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { join, normalize } from "path";
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

}