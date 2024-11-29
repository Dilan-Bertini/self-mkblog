import { join, normalize } from "path";
import { isValidGitSSH } from "../util/git";

export default () => {
    const IS_DEV = process.env.NODE_ENV !== 'prod';
    const DATA_PATH = normalize(join(__dirname, '..', '..', '..', 'data'));
    const LAYOUT_PATH = normalize(join(DATA_PATH, 'hbs', 'layout.hbs'));
    const INDEX_PATH = normalize(join(DATA_PATH, 'hbs', 'index.hbs'));
    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
    if (GITHUB_REPOSITORY == undefined)
        throw new InvalidGitHubUrlException()

    const validGitUrl = isValidGitSSH(GITHUB_REPOSITORY);

    if (!validGitUrl.valid)
        throw new InvalidGitHubUrlException()

    return {
        port: 8080,
        isDev: IS_DEV,
        markdown: {
            input: normalize(join(DATA_PATH, 'markdown')),
            output: normalize(join(DATA_PATH, 'html')),
            static: normalize(join(DATA_PATH, 'static')),
        },
        github: {
            repository: process.env.GITHUB_REPOSITORY,
            secret: process.env.GITHUB_SECRET
        },
        handlebars: {
            index: INDEX_PATH,
            layout: LAYOUT_PATH,
        }
    };
};
