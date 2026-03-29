import fs from 'fs/promises';
import path from 'path';
import { resolveHead } from './commit.js';
import { revertRepo } from './revert.js';

/**
 * Creates a new branch pointing to the current commit
 */
export async function createBranch(branchName) {
    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const branchPath = path.join(repoPath, 'refs', 'heads', branchName);

    try {
        // Check if branch already exists
        try {
            await fs.access(branchPath);
            console.error(`Error: Branch '${branchName}' already exists.`);
            return;
        } catch {}

        // Get current commit ID
        const { commitId } = await resolveHead();
        
        // Create the branch pointer
        await fs.writeFile(branchPath, commitId || '');
        console.log(`Branch '${branchName}' created successfully.`);
    } catch (err) {
        console.error("Error creating branch:", err.message);
    }
}

/**
 * Switches to a different branch and restores its latest commit
 */
export async function switchBranch(branchName) {
    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const headPath = path.join(repoPath, 'HEAD');
    const branchPath = path.join(repoPath, 'refs', 'heads', branchName);

    try {
        // 1. Verify target branch exists
        try {
            await fs.access(branchPath);
        } catch (err) {
            console.error(`Error: Branch '${branchName}' does not exist.`);
            return;
        }

        // 2. Update HEAD (symbolic reference)
        await fs.writeFile(headPath, `ref: refs/heads/${branchName}`);

        // 3. Get the latest commit of the target branch
        const commitId = (await fs.readFile(branchPath, 'utf8')).trim();

        // 4. Restore workspace to that commit
        if (commitId) {
            await revertRepo(commitId);
        } else {
            console.log(`Switched to empty branch '${branchName}'. Workspace remains unchanged.`);
        }

        console.log(`Switched to branch '${branchName}'.`);
    } catch (err) {
        console.error("Error switching branch:", err.message);
    }
}

/**
 * Lists all local branches
 */
export async function listBranches() {
    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const branchesPath = path.join(repoPath, 'refs', 'heads');

    try {
        const { branchName: currentBranch } = await resolveHead();
        const branches = await fs.readdir(branchesPath);

        console.log("--- Local Branches ---");
        for (const branch of branches) {
            const prefix = branch === currentBranch ? '* ' : '  ';
            console.log(`${prefix}${branch}`);
        }
    } catch (err) {
        console.error("Error listing branches:", err.message);
    }
}
