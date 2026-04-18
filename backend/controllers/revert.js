import fs from 'fs/promises';
import path from 'path';
import { validateVcsRepo } from '../utils/vcs.js';

async function copyDirectoryContents(sourceDir, targetDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true });
      await copyDirectoryContents(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

export async function revertRepo(commitId) {
  await validateVcsRepo();

  const repoPath = path.resolve(process.cwd(), '.vcs');
  const commitFilesDir = path.join(repoPath, 'commits', commitId, 'files');
  const headPath = path.join(repoPath, 'HEAD');

  try {
    await fs.access(commitFilesDir);
  } catch (error) {
    console.error(`Error: Commit ${commitId} not found`);
    return;
  }

  try {
    // Restore files from the commit snapshot
    await copyDirectoryContents(commitFilesDir, process.cwd());

    // Determine current branch from HEAD
    let currentBranch = 'main';
    try {
      currentBranch = (await fs.readFile(headPath, 'utf8')).trim();
    } catch (err) {
      // If HEAD cannot be read, default to main
    }

    const branchPath = path.join(repoPath, 'branches', `${currentBranch}.json`);
    let branchData = { name: currentBranch, head: commitId };

    try {
      const branchContent = await fs.readFile(branchPath, 'utf8');
      branchData = JSON.parse(branchContent);
      branchData.head = commitId;
    } catch (err) {
      // Branch file might not exist or be invalid, use default branchData
    }

    await fs.writeFile(branchPath, JSON.stringify(branchData, null, 2), 'utf8');

    console.log(`Reverted to commit ${commitId}`);
  } catch (err) {
    console.error('Error: Unable to revert:', err.message);
    process.exitCode = 1;
  }
}
