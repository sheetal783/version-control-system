import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);


export async function revertRepo(commitId) {
    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const commitPath = path.join(repoPath, 'commit');


    try {
        const commitDir = path.join(commitPath, commitId);

        const files = await readdir(commitDir);
        const parentDir = path.resolve(repoPath, "..");

        for (const file of files) {
            await copyFile(path.join(commitDir, file), path.join(parentDir, file));

        }
        console.log(`commit ${commitId}  revert successfully`);
    }
    catch (error) {
        console.log("unable to revert", error);
    }

}
