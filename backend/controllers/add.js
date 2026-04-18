import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { validateVcsRepo } from '../utils/vcs.js';

const IGNORED_DIRS = ['node_modules', '.git', '.vcs'];

async function hashFile(filePath) {
  try {
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    console.error(`Error hashing file ${filePath}:`, error.message);
    return null;
  }
}

async function getAllFiles(dirPath, relativeTo = dirPath) {
  const files = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(relativeTo, fullPath);

      // Skip ignored directories
      if (entry.isDirectory() && IGNORED_DIRS.includes(entry.name)) {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = await getAllFiles(fullPath, relativeTo);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }

  return files;
}

async function updateIndex(repoPath, filesToAdd) {
  const indexPath = path.join(repoPath, 'index.json');

  let indexData = { tracked: {} };

  try {
    const indexContent = await fs.readFile(indexPath, 'utf8');
    indexData = JSON.parse(indexContent);
  } catch (error) {
    // Index doesn't exist yet, use default
  }

  for (const file of filesToAdd) {
    const filePath = path.join(process.cwd(), file);
    const hash = await hashFile(filePath);
    if (hash) {
      indexData.tracked[file] = hash;
    }
  }

  await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));
}

export async function addRepo(filePath) {
    await validateVcsRepo();
    
    const repoPath = path.join(process.cwd(), '.vcs');
    const stagingPath = path.join(repoPath, 'staging');

    try {
        await fs.mkdir(stagingPath, { recursive: true });

        let filesToAdd = [];

        if (filePath === '.') {
            // Add all files in current directory
            filesToAdd = await getAllFiles(process.cwd());
        } else {
            // Check if file exists
            const fullFilePath = path.resolve(filePath);
            try {
                await fs.access(fullFilePath);
                filesToAdd = [path.relative(process.cwd(), fullFilePath)];
            } catch (error) {
                console.error(`File not found: ${filePath}`);
                return;
            }
        }

        // Copy files to staging and update index
        for (const file of filesToAdd) {
            const sourcePath = path.join(process.cwd(), file);
            const destPath = path.join(stagingPath, file);

            try {
                // Ensure destination directory exists
                await fs.mkdir(path.dirname(destPath), { recursive: true });
                await fs.copyFile(sourcePath, destPath);
            } catch (error) {
                console.error(`Error copying ${file}:`, error.message);
                continue;
            }
        }

        // Update index with file hashes
        await updateIndex(repoPath, filesToAdd);

        console.log(`Added ${filesToAdd.length} file(s) to staging area.`);
    } catch (error) {
        console.error("Error adding file:", error.message);
    }
}
