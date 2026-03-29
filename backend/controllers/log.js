import fs from 'fs/promises';
import path from 'path';
import { resolveHead } from './commit.js';

export async function getLog() {
    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const commitsPath = path.join(repoPath, 'commits');
    const logs = [];

    try {
        const { commitId: headCommitId } = await resolveHead();
        let currentCommitId = headCommitId;

        while (currentCommitId) {
            const commitJsonPath = path.join(commitsPath, currentCommitId, 'commit.json');
            try {
                const commitData = JSON.parse(await fs.readFile(commitJsonPath, 'utf8'));
                logs.push({
                    hash: currentCommitId,
                    message: commitData.message,
                    author: commitData.author || "Unknown",
                    timestamp: commitData.timestamp,
                    parent: commitData.parent
                });
                currentCommitId = commitData.parent;
            } catch (err) {
                break;
            }
        }
        return logs;
    } catch (err) {
        console.error("Error fetching log:", err.message);
        return [];
    }
}

