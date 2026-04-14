// #region agent log
fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'controllers/init.js:1', message: 'init.js module loading', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
// #endregion
import fs from 'fs/promises';
import path from 'path';


export async function initRepo() {
    // Safety check: Ensure we are in the backend directory
    if (!process.cwd().endsWith('backend')) {
        console.error("❌ Error: ApnaGit commands must be run from inside the 'backend' folder.");
        return;
    }

    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const commitsPath = path.join(repoPath, 'commit');
    const stagingPath = path.join(repoPath, 'staging');

    try {
        await fs.mkdir(repoPath, { recursive: true });
        await fs.mkdir(commitsPath, { recursive: true });
        await fs.mkdir(stagingPath, { recursive: true });
        console.log("✅ Initialized a new empty repository in " + process.cwd());
    } catch (err) {
        console.error("❌ Error initializing repository:", err.message);
    }
}
