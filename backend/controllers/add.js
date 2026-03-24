// #region agent log
fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'controllers/add.js:1', message: 'add.js module loading', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
// #endregion
import fs from 'fs/promises';
import path from 'path';

export async function addRepo(filePath) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'controllers/add.js:4', message: 'addRepo function entry', data: { filePath }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
    // #endregion
    const repoPath = path.join(process.cwd(), '.apnagit');
    const stageingPath = path.join(repoPath, 'staging');
    console.log("add command executed");

    try {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'controllers/add.js:10', message: 'before fs.mkdir', data: { stageingPath }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        await fs.mkdir(stageingPath, { recursive: true });
        const filename = path.basename(filePath);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'controllers/add.js:12', message: 'before fs.copyFile', data: { filePath, filename }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        await fs.copyFile(filePath, path.join(stageingPath, filename));
        console.log(`File ${filename} added to staging area.`);
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'controllers/add.js:14', message: 'addRepo error', data: { error: error.message, stack: error.stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        console.error("Error adding file:", error.message);
    }

}
