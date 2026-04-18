import fs from 'fs/promises';
import path from 'path';
import { validateVcsRepo, validateRepoName, handleApiError, resolveHead } from '../utils/vcs.js';

const API_URL = process.env.FRONTEND_URL?.replace('5173', '5000') || 'http://localhost:5000';

export async function Push() {
  await validateVcsRepo();
  const repoName = await validateRepoName();
  if (!repoName) return;

  const repoPath = path.resolve(process.cwd(), '.vcs');
  const commitsPath = path.join(repoPath, 'commits');
  const configPath = path.join(repoPath, 'config.json');

  try {
    let configData = JSON.parse(await fs.readFile(configPath, 'utf8'));

    const { commitId: headCommitId } = await resolveHead();
    let currentHash = headCommitId;
    const commitsData = [];

    while (currentHash && currentHash !== configData.lastPushed) {
      const commitDir = path.join(commitsPath, currentHash);
      const commitJsonPath = path.join(commitDir, 'commit.json');

      try {
        const commitContent = await fs.readFile(commitJsonPath, 'utf8');
        const commitMeta = JSON.parse(commitContent);
        
        commitsData.push({
          commitHash: currentHash,
          ...commitMeta
        });

        currentHash = commitMeta.parent;
      } catch (error) {
        console.error(`Error reading commit ${currentHash}:`, error.message);
        break;
      }
    }

    // Reverse to push in chronological order
    commitsData.reverse();

    if (commitsData.length === 0) {
      console.log("No new commits to push");
      return;
    }

    // POST all commits to API
    try {
      const response = await fetch(`${API_URL}/api/commit/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          commits: commitsData
        })
      });

      if (response.ok) {
        const lastCommitHash = commitsData[commitsData.length - 1].commitHash;
        configData.lastPushed = lastCommitHash;
        await fs.writeFile(configPath, JSON.stringify(configData, null, 2));
        console.log(`Pushed ${commitsData.length} commits to remote`);
      } else {
        await handleApiError(response, "push");
      }
    } catch (error) {
      console.error(`Error: Connection failed during push. (${error.message})`);
    }

  } catch (err) {
    console.error("Error during push:", err.message);
  }
}
