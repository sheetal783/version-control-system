import fs from 'fs/promises';
import path from 'path';
import { validateVcsRepo, resolveHead } from '../utils/vcs.js';

export async function getLog() {
    await validateVcsRepo();

    const repoPath = path.resolve(process.cwd(), '.vcs');
    const commitsPath = path.join(repoPath, 'commits');
    const logs = [];
    const visited = new Set();

    try {
        const { commitId: headCommitId } = await resolveHead();
        if (!headCommitId) {
            console.log("No commits found in this repository.");
            return [];
        }

        let currentCommitId = headCommitId;

        while (currentCommitId) {
            // Cycle detection
            if (visited.has(currentCommitId)) {
                console.warn("Cycle detected at commit:", currentCommitId);
                break;
            }
            visited.add(currentCommitId);

            const commitJsonPath = path.join(commitsPath, currentCommitId, 'commit.json');
            try {
                const commitData = JSON.parse(await fs.readFile(commitJsonPath, 'utf8'));
                logs.push({
                    hash: currentCommitId,
                    message: commitData.message,
                    author: commitData.author || "Unknown",
                    timestamp: commitData.timestamp,
                    parent: commitData.parent || null,
                });
                
                // Format and print log to console (CLI behavior)
                console.log(`\nCommit: ${currentCommitId}`);
                console.log(`Author: ${commitData.author || "Unknown"}`);
                console.log(`Date:   ${new Date(commitData.timestamp).toLocaleString()}`);
                console.log(`\n    ${commitData.message}\n`);

                currentCommitId = commitData.parent || null;
            } catch (err) {
                console.error(`Error: Failed to read commit ${currentCommitId}:`, err.message);
                break;
            }
        }
        return logs;

    } catch (err) {
        console.error("Error fetching log:", err.message);
        return [];
    }
}
