import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { validateVcsRepo, resolveHead } from '../utils/vcs.js';

/**
 * Calculates SHA-256 hash of a file's content (Standardized to SHA-256 used in commit.js)
 */
async function getFileHash(filePath) {
    try {
        const content = await fs.readFile(filePath);
        return crypto.createHash('sha256').update(content).digest('hex');
    } catch (err) {
        return null;
    }
}

/**
 * Recursively gets all files in a directory, ignoring system and VCS directories
 */
async function getAllFiles(dir, allFiles = []) {
    try {
        const files = await fs.readdir(dir);
        for (const file of files) {
            if (file === '.vcs' || file === 'node_modules' || file === '.git') continue;
            
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isDirectory()) {
                await getAllFiles(filePath, allFiles);
            } else {
                allFiles.push(path.relative(process.cwd(), filePath));
            }
        }
    } catch (err) {
        // Directory might not exist or be inaccessible
    }
    return allFiles;
}

export async function getStatus() {
    await validateVcsRepo();

    const repoPath = path.resolve(process.cwd(), '.vcs');
    const commitsPath = path.join(repoPath, 'commits');

    try {
        // 1. Get the latest commit metadata using resolveHead
        let latestFiles = {};
        const { commitId: latestCommitId, branchName } = await resolveHead();
        
        if (latestCommitId) {
            const commitJsonPath = path.join(commitsPath, latestCommitId, 'commit.json');
            try {
                const commitData = JSON.parse(await fs.readFile(commitJsonPath, 'utf8'));
                latestFiles = commitData.files || {};
            } catch (err) {
                console.error(`Warning: Could not read commit data for ${latestCommitId}`);
            }
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
        console.log(`--- VCS Status (Branch: ${branchName || 'Initial'}) ---`);
        
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
