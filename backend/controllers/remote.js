import fs from 'fs/promises';
import path from 'path';
import { validateVcsRepo } from '../utils/vcs.js';

export async function remoteAdd(remoteName, repoName) {
  await validateVcsRepo();

  const repoPath = path.resolve(process.cwd(), '.vcs');
  const configPath = path.join(repoPath, 'config.json');

  try {
    // Read config file
    let configData;
    try {
      const configContent = await fs.readFile(configPath, 'utf8');
      configData = JSON.parse(configContent);
    } catch (error) {
      console.error("Error: Could not read repository config.");
      return;
    }

    // Update repoName
    configData.repoName = repoName;

    // Save updated config
    await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf8');

    console.log(`Remote '${remoteName}' set to '${repoName}'`);
  } catch (err) {
    console.error("Error setting remote:", err.message);
  }
}
