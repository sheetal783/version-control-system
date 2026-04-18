import fs from 'fs/promises';
import path from 'path';

/**
 * Checks if the current directory is a VCS repository.
 * @returns {Promise<boolean>}
 */
export async function isVcsRepo() {
    const repoPath = path.join(process.cwd(), '.vcs');
    try {
        await fs.access(repoPath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Ensures the command is running inside a VCS repository.
 * If not, prints an error and exits (or returns false).
 * @param {boolean} exitOnFailure 
 * @returns {Promise<boolean>}
 */
export async function validateVcsRepo(exitOnFailure = true) {
    if (!(await isVcsRepo())) {
        console.error("Error: Not a vcs repository. Run 'vcs init' first.");
        if (exitOnFailure) process.exit(1);
        return false;
    }
    return true;
}

/**
 * Resolves the current HEAD to get the commit hash and branch name.
 * @returns {Promise<{ commitId: string|null, branchName: string|null }>}
 */
export async function resolveHead() {
    const repoPath = path.join(process.cwd(), '.vcs');
    const headPath = path.join(repoPath, 'HEAD');

    try {
        const branchName = (await fs.readFile(headPath, 'utf8')).trim();
        const branchPath = path.join(repoPath, 'branches', `${branchName}.json`);
        
        try {
            const branchData = JSON.parse(await fs.readFile(branchPath, 'utf8'));
            return {
                commitId: branchData.head,
                branchName: branchName
            };
        } catch (err) {
            // Branch file might not exist yet (initial state)
            return {
                commitId: null,
                branchName: branchName
            };
        }
    } catch (err) {
        // HEAD doesn't exist or is unreadable
        return {
            commitId: null,
            branchName: null
        };
    }
}

/**
 * Reads the repository configuration.
 * @returns {Promise<Object|null>}
 */
export async function getRepoConfig() {
    const configPath = path.join(process.cwd(), '.vcs', 'config.json');
    try {
        const content = await fs.readFile(configPath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        return null;
    }
}

/**
 * Validates that a remote repository name is set in the config.
 * @returns {Promise<string|null>} The repoName if set, otherwise null.
 */
export async function validateRepoName() {
    const config = await getRepoConfig();
    if (!config || !config.repoName || config.repoName.trim() === '') {
        console.error("Error: No remote repository linked. Run: vcs remote add origin <repoName>");
        return null;
    }
    return config.repoName;
}

/**
 * Handles API errors consistently.
 * @param {Response} response 
 * @param {string} actionDescription 
 */
export async function handleApiError(response, actionDescription) {
    if (response.status === 404) {
        console.error(`Error: Repo not found (404) during ${actionDescription}.`);
    } else if (response.status === 500) {
        console.error(`Error: Server error (500) during ${actionDescription}.`);
    } else {
        try {
            const data = await response.json();
            console.error(`Error during ${actionDescription}: ${data.error || response.statusText}`);
        } catch (e) {
            console.error(`Error during ${actionDescription}: ${response.statusText}`);
        }
    }
}
