import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { cp, mkdir, readFile, rm, writeFile } from "fs/promises";
import { marked } from "marked";
import { basename, dirname, join, normalize } from "path";
import { GitService } from "./git.service";
import { HbsService } from "./hbs.service";

@Injectable()
export class MarkedService {
    constructor(private readonly configService: ConfigService, private readonly gitService: GitService, private readonly hbsService: HbsService) { }

    async updateMarkdown() {
        const startTime = performance.now();

        const outputFolderPath = this.configService.get('markdown.output');
        const inputFolderPath = this.configService.get('markdown.input');

        await mkdir(outputFolderPath, { recursive: true }) // Create the folder if it not exist

        const { toConvertFiles, toDelete } = await this.gitService.updateRepository();

        console.log('Files to convert:', toConvertFiles);
        console.log('Files to delete:', toDelete);

        await Promise.all(toDelete.map(async (file: string) => {
            if (file.endsWith('index.md')) return;

            if (file.endsWith('.md')) {
                const index = file.lastIndexOf('.md')
                if (index != -1) {
                    file = file.slice(0, index) + '.html';
                }
            }
            const fullPath = normalize(join(outputFolderPath, file));

            // Avoid exceptions like rm -rf <file>
            try {
                await rm(fullPath, {
                    force: true,
                    recursive: true
                });
            } catch (e) { }
        }));

        // Convert all file from markdown to html
        await Promise.all(toConvertFiles.map(async (file: string) => {
            // Get the full path basesd on the input folder (so where the markdown lives)
            const fullPath = join(inputFolderPath, file);

            // Check if the .md file is inside a sub-folder, if it is skip it
            const dir = dirname(fullPath);
            if (basename(dir) != basename(inputFolderPath)) return;

            // Get the file name, put it in lowercase and trim it
            const filename = basename(fullPath, '.md').toLowerCase().trim()

            // If it's index.md or any other type of IndEx.md they will interfere with the actual index page
            if (file.endsWith('index')) return;

            // Read the markdown & parse it
            const markdownContent = await readFile(fullPath, 'utf8');
            const htmlContent = await marked.parse(markdownContent);

            // retrive-a-cooler-name-like-this.html
            const htmlFileName = filename.replace(/[^\w\d]+/gm, '-') + '.html';

            // Take the title of the first page and convert it with the first letter in uppercase
            const title = filename.charAt(0).toUpperCase() + filename.slice(1);

            // Inject into the layout html template
            const injectedContent = await this.hbsService.injectLayout(title, htmlContent)

            // Save the compiled HTML to a destination folder
            const outputPath = join(outputFolderPath, htmlFileName);
            await writeFile(outputPath, injectedContent, 'utf8');
            console.log(`Compiled and saved: ${outputPath}`);
        }));

        // Copy all the static files
        await this.copyStatic();

        return {
            ms: performance.now() - startTime,
            deleted: toDelete,
            converted: toConvertFiles
        }
    }

    async copyStatic() {
        const staticFolderPath = this.configService.get('markdown.static');
        const inputFolderPath = this.configService.get('markdown.input');

        await cp(normalize(join(inputFolderPath, 'static')), staticFolderPath, {
            recursive: true,
            force: true,
        })
    }

}