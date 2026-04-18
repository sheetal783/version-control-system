import fs from 'fs/promises';
import path from 'path';

export async function initRepo() {
    const cwd = process.cwd();
    const repoName = path.basename(cwd);
    const vcsRoot = path.join(cwd, ".vcs");
    const branchesDir = path.join(vcsRoot, "branches");
    const commitsDir = path.join(vcsRoot, "commits");
    const headPath = path.join(vcsRoot, "HEAD");
    const configPath = path.join(vcsRoot, "config.json");
    const indexPath = path.join(vcsRoot, "index.json");
    const mainBranchPath = path.join(branchesDir, "main.json");

    try {
        await fs.access(vcsRoot);
        console.error("Already a vcs repository");
        return;
    } catch (err) {
        if (err.code !== "ENOENT") {
            console.error("Failed to check repo state:", err.message);
            return;
        }
    }

    try {
        await fs.mkdir(vcsRoot, { recursive: true });
        await fs.mkdir(branchesDir, { recursive: true });
        await fs.mkdir(commitsDir, { recursive: true });

        await fs.writeFile(headPath, "main", "utf8");
        await fs.writeFile(configPath, JSON.stringify({
            repoName,
            remote: "http://localhost:5000",
            created: new Date().toISOString(),
            author: process.env.USER || process.env.USERNAME || "unknown"
        }, null, 2), "utf8");
        await fs.writeFile(indexPath, JSON.stringify({ tracked: {} }, null, 2), "utf8");
        await fs.writeFile(mainBranchPath, JSON.stringify({ name: "main", head: null }, null, 2), "utf8");

        console.log(`Initialized empty vcs repository in ${vcsRoot}`);
    } catch (writeError) {
        console.error("Failed to initialize repository:", writeError.message);
    }
}
