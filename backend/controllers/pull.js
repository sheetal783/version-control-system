import fs from 'fs/promises';
import path from 'path';
import { validateVcsRepo, validateRepoName, handleApiError } from '../utils/vcs.js';

const API_URL = process.env.FRONTEND_URL?.replace('5173', '5000') || 'http://localhost:5000';

export async function Pull() {
  await validateVcsRepo();
  const repoName = await validateRepoName();
  if (!repoName) return;

  const repoPath = path.resolve(process.cwd(), '.vcs');
  const commitsPath = path.join(repoPath, 'commits');

  try {
    // GET commits from API
    const url = `${API_URL}/api/commit/all?repoName=${encodeURIComponent(repoName)}`;
    
    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      console.error(`Error: Connection failed during pull. (${error.message})`);
      return;
    }

    if (!response.ok) {
      await handleApiError(response, "pull");
      return;
    }

    let commits;
    try {
      commits = await response.json();
    } catch (error) {
      console.error("Error during pull: Invalid response from remote server.");
      return;
    }

    if (!Array.isArray(commits)) {
      console.error("Error during pull: Expected array of commits from remote.");
      return;
    }

    let pulledCount = 0;

    // Process each commit
    for (const commit of commits) {
      const commitHash = commit.commitHash || commit.id;
      const commitDir = path.join(commitsPath, commitHash);
      const commitFilesDir = path.join(commitDir, 'files');

      // Check if commit already exists locally
      try {
        await fs.access(commitDir);
        continue; // Skip existing commits
      } catch (error) {
        // Commit doesn't exist, proceed to create it
      }

      try {
        // Create commit directory
        await fs.mkdir(commitFilesDir, { recursive: true });

        // Write commit metadata (standardized to commit.json)
        const commitData = {
          message: commit.message || '',
          timestamp: commit.timestamp || new Date().toISOString(),
          author: commit.author || 'unknown',
          parent: commit.parent || null,
          branch: commit.branch || 'main',
          files: commit.files || {}
        };

        await fs.writeFile(path.join(commitDir, 'commit.json'), JSON.stringify(commitData, null, 2));

        pulledCount++;
        console.log(`Pulled commit: ${commitHash}`);

      } catch (error) {
        console.error(`Error saving commit ${commitHash}:`, error.message);
      }
    }

    if (pulledCount === 0) {
      console.log("No new commits to pull");
    } else {
      console.log(`Pulled ${pulledCount} new commits`);
    }

  } catch (err) {
    console.error("Error during pull:", err.message);
  }
}
