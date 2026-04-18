import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { validateVcsRepo, resolveHead } from '../utils/vcs.js';

export async function commitRepo(message) {
    await validateVcsRepo();

    const repoPath = path.resolve(process.cwd(), '.vcs');
    const indexPath = path.join(repoPath, 'index.json');
    const headPath = path.join(repoPath, 'HEAD');
    const stagingPath = path.join(repoPath, 'staging');

    try {
        // Read index.json to get tracked files
        let indexData;
        try {
            const indexContent = await fs.readFile(indexPath, 'utf8');
            indexData = JSON.parse(indexContent);
        } catch (error) {
            console.error("No files staged for commit. Run 'vcs add' first.");
            return;
        }

        if (!indexData.tracked || Object.keys(indexData.tracked).length === 0) {
            console.error("No files staged for commit. Run 'vcs add' first.");
            return;
        }

        // Get current branch and parent commit using resolveHead
        const { commitId: parentCommit, branchName: currentBranch } = await resolveHead();

        if (!currentBranch) {
            console.error("Could not determine current branch.");
            return;
        }

        // Generate commit hash using crypto
        const commitData = {
            message,
            timestamp: new Date().toISOString(),
            author: process.env.USER || process.env.USERNAME || 'unknown',
            parent: parentCommit,
            branch: currentBranch,
            files: indexData.tracked
        };

        const commitString = JSON.stringify(commitData);
        const commitHash = crypto.createHash('sha256').update(commitString).digest('hex').substring(0, 8);

        // Create commit directory
        const commitsPath = path.join(repoPath, 'commits');
        const commitDir = path.join(commitsPath, commitHash);
        const commitFilesDir = path.join(commitDir, 'files');

        await fs.mkdir(commitFilesDir, { recursive: true });

        // Copy staged files to commit
        const trackedFiles = Object.keys(indexData.tracked);
        for (const file of trackedFiles) {
            const sourcePath = path.join(stagingPath, file);
            const destPath = path.join(commitFilesDir, file);

            try {
                // Ensure destination directory exists
                await fs.mkdir(path.dirname(destPath), { recursive: true });
                await fs.copyFile(sourcePath, destPath);
            } catch (error) {
                console.error(`Error copying ${file} to commit:`, error.message);
                continue;
            }
        }

        // Write commit metadata (renamed from meta.json to commit.json)
        await fs.writeFile(path.join(commitDir, 'commit.json'), JSON.stringify(commitData, null, 2));

        // Update branch head
        const branchPath = path.join(repoPath, 'branches', `${currentBranch}.json`);
        let branchData = { name: currentBranch, head: commitHash };
        try {
            const existingBranchData = JSON.parse(await fs.readFile(branchPath, 'utf8'));
            branchData = { ...existingBranchData, head: commitHash };
        } catch (error) {
            // Branch file doesn't exist yet
        }

        await fs.writeFile(branchPath, JSON.stringify(branchData, null, 2));

        // Clear staging area after commit (optional, but good practice)
        // For now, we'll just keep it as is since that's the current behavior.

        console.log(`Committed: ${commitHash} — ${message}`);

    } catch (err) {
        console.error("Error during commit:", err.message);
    }
}
