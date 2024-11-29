
export const isValidGitSSH = (sshUrl: string): { valid: boolean, username?: string, project?: string } => {
    const regex = /git@[\w\.]+:([\w\d-]+)\/([\w\d-]+)\.git/gm;

    const result = regex.exec(sshUrl);
    if (!result) return { valid: false };

    return { valid: true, username: result[1], project: result[2] }
}
