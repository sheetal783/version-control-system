import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { resolveHead } from './commit.js';

/**
 * Calculates SHA-1 hash of a file's content
 */
async function getFileHash(filePath) {
    try {
        const content = await fs.readFile(filePath);
        return crypto.createHash('sha1').update(content).digest('hex');
    } catch (err) {
        return null;
    }
}

/**
 * Recursively gets all files in a directory, ignoring .apnagit and node_modules
 */
async function getAllFiles(dir, allFiles = []) {
    const files = await fs.readdir(dir);
    for (const file of files) {
        if (file === '.apnagit' || file === 'node_modules' || file === '.git') continue;
        
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isDirectory()) {
            await getAllFiles(filePath, allFiles);
        } else {
            allFiles.push(path.relative(process.cwd(), filePath));
        }
    }
    return allFiles;
}

export async function getStatus() {
    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const commitsPath = path.join(repoPath, 'commits');

    try {
        // 1. Get the latest commit metadata using resolveHead
        let latestFiles = {};
        const { commitId: latestCommitId, branchName } = await resolveHead();
        
        if (latestCommitId) {
            const commitJsonPath = path.join(commitsPath, latestCommitId, 'commit.json');
            const commitData = JSON.parse(await fs.readFile(commitJsonPath, 'utf8'));
            latestFiles = commitData.files || {};
        }

        // 2. Get current working directory files
        const currentFiles = await getAllFiles(process.cwd());
        
        const status = {
            new: [],
            modified: [],
            deleted: []
        };

        // 3. Compare current files with latest commit
        for (const file of currentFiles) {
            const currentHash = await getFileHash(path.join(process.cwd(), file));
            
            if (!latestFiles[file]) {
                status.new.push(file);
            } else if (latestFiles[file] !== currentHash) {
                status.modified.push(file);
            }
        }

        // 4. Check for deleted files
        for (const file in latestFiles) {
            if (!currentFiles.includes(file)) {
                status.deleted.push(file);
            }
        }

        // 5. Output results
        console.log(`--- VCS Status (Branch: ${branchName || 'Detached HEAD'}) ---`);
        
        if (status.modified.length > 0) {
            console.log("\nModified files:");
            status.modified.forEach(f => console.log(`  (modified) ${f}`));
        }
        
        if (status.new.length > 0) {
            console.log("\nNew files:");
            status.new.forEach(f => console.log(`  (new)      ${f}`));
        }
        
        if (status.deleted.length > 0) {
            console.log("\nDeleted files:");
            status.deleted.forEach(f => console.log(`  (deleted)  ${f}`));
        }
        
        if (status.modified.length === 0 && status.new.length === 0 && status.deleted.length === 0) {
            console.log("Working directory clean.");
        }
        
        console.log("\n--- End Status ---");

        return status;

    } catch (err) {
        console.error("Error getting status:", err.message);
    }
}
