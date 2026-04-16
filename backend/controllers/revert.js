import fs from 'fs/promises';
import path from 'path';

export async function revertRepo(commitId) {
    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const commitPath = path.join(repoPath, 'commit');
    const commitDir = path.join(commitPath, commitId);
    const parentDir = path.resolve(repoPath, '..');

    try {
        const stats = await fs.stat(commitDir);
        if (!stats.isDirectory()) {
            throw new Error(`Commit path is not a directory: ${commitDir}`);
        }

        const files = await fs.readdir(commitDir);
        if (files.length === 0) {
            console.log(`Commit ${commitId} has no files to restore.`);
            return;
        }

        for (const file of files) {
            if (file === 'commit.json') continue;
            await fs.copyFile(path.join(commitDir, file), path.join(parentDir, file));
        }

        console.log(`Commit ${commitId} reverted successfully.`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Unable to revert: commit '${commitId}' does not exist.`);
        } else {
            console.error('Unable to revert:', error.message);
        }
        process.exitCode = 1;
    }
}
