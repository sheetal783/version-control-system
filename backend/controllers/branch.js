import fs from 'fs/promises';
import path from 'path';
import { validateVcsRepo, resolveHead } from '../utils/vcs.js';
import { revertRepo } from './revert.js';

/**
 * Creates a new branch pointing to the current commit
 */
export async function createBranch(branchName) {
    await validateVcsRepo();

    const repoPath = path.resolve(process.cwd(), '.vcs');
    const branchPath = path.join(repoPath, 'branches', `${branchName}.json`);

    try {
        // Check if branch already exists
        try {
            await fs.access(branchPath);
            console.error(`Error: Branch '${branchName}' already exists.`);
            return;
        } catch {}

        // Get current commit ID
        const { commitId } = await resolveHead();
        
        // Create the branch pointer in the .vcs/branches/*.json format
        const branchData = {
            name: branchName,
            head: commitId || null
        };

        await fs.writeFile(branchPath, JSON.stringify(branchData, null, 2));
        console.log(`Branch '${branchName}' created successfully.`);
    } catch (err) {
        console.error("Error creating branch:", err.message);
    }
}

/**
 * Switches to a different branch and restores its latest commit
 */
export async function switchBranch(branchName) {
    await validateVcsRepo();

    const repoPath = path.resolve(process.cwd(), '.vcs');
    const headPath = path.join(repoPath, 'HEAD');
    const branchPath = path.join(repoPath, 'branches', `${branchName}.json`);

    try {
        // 1. Verify target branch exists
        try {
            await fs.access(branchPath);
        } catch (err) {
            console.error(`Error: Branch '${branchName}' does not exist.`);
            return;
        }

        // 2. Update HEAD to point to the new branch
        await fs.writeFile(headPath, branchName, 'utf8');

        // 3. Get the latest commit of the target branch
        const branchData = JSON.parse(await fs.readFile(branchPath, 'utf8'));
        const commitId = branchData.head;

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
    await validateVcsRepo();

    const repoPath = path.resolve(process.cwd(), '.vcs');
    const branchesPath = path.join(repoPath, 'branches');

    try {
        const { branchName: currentBranch } = await resolveHead();
        const branchFiles = await fs.readdir(branchesPath);

        console.log("--- Local Branches ---");
        for (const file of branchFiles) {
            if (!file.endsWith('.json')) continue;
            
            const branchName = path.basename(file, '.json');
            const prefix = branchName === currentBranch ? '* ' : '  ';
            console.log(`${prefix}${branchName}`);
        }
    } catch (err) {
        console.error("Error listing branches:", err.message);
    }
}
