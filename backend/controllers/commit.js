// #region agent log
fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'controllers/commit.js:1', message: 'commit.js module loading', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
// #endregion
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function commitRepo(message) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'controllers/commit.js:5', message: 'commitRepo function entry', data: { message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
    // #endregion
    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const stagePath = path.join(repoPath, "staging");
    const commitPath = path.join(repoPath, "commit");


    try {
        const commitId = uuidv4();
        const commitDir = path.join(commitPath, commitId);
        await fs.mkdir(commitDir, { recursive: true });

        const files = await fs.readdir(stagePath);
        for (const file of files) {
            await fs.copyFile(path.join(stagePath, file), path.join(commitDir, file));
        }

        await fs.writeFile(path.join(commitDir, "commit.json"),
            JSON.stringify({ message, timestamp: new Date().toISOString() }));
        console.log(`Committed with ID: ${commitId} created with message: "${message}"`);
    }
    catch (err) {
        console.error("Error during commit:", err);
    }
}
