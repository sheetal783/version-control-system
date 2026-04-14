import fs from 'fs/promises';
import path from 'path';
import { resolveHead } from './commit.js';

export async function getLog() {
    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const commitsPath = path.join(repoPath, 'commits');
    const logs = [];
    const visited = new Set();

    try {
        const { commitId: headCommitId } = await resolveHead();
        if (!headCommitId) return []; // empty repo guard

        let currentCommitId = headCommitId;

        while (currentCommitId) {
            // Cycle detection
            if (visited.has(currentCommitId)) {
                console.warn("Cycle detected at:", currentCommitId);
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
                    parent: commitData.parent || null, // explicit null
                });
                currentCommitId = commitData.parent || null;
            } catch (err) {
                console.error(`Failed to read commit ${currentCommitId}:`, err.message);
                break;
            }
        }
        return logs;

    } catch (err) {
        console.error("Error fetching log:", err.message);
        return [];
    }
}

