import { exec } from 'child_process';

export function runTreeCommand(rootPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec('tree -L 8 --gitignore', { cwd: rootPath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing tree: ${error}`);
                reject(`Error executing tree: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(`stderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
}
