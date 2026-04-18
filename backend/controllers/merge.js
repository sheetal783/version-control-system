import fs from 'fs/promises';
import path from 'path';
import { validateVcsRepo, resolveHead } from '../utils/vcs.js';
import { commitRepo } from './commit.js';

/**
 * Gets all parent commit IDs for a given commit
 */
async function getHistory(commitId) {
    const commitsPath = path.join(process.cwd(), '.vcs', 'commits');
    const history = new Set();
    const queue = [commitId];

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current || history.has(current)) continue;
        
        history.add(current);
        const commitJsonPath = path.join(commitsPath, current, 'commit.json');
        
        try {
            const data = JSON.parse(await fs.readFile(commitJsonPath, 'utf8'));
            const parents = data.parents || (data.parent ? [data.parent] : []);
            queue.push(...parents);
        } catch (err) {}
    }
    return history;
}

/**
 * Finds the common ancestor (base) between two commits
 */
async function findBaseCommit(id1, id2) {
    const history1 = await getHistory(id1);
    const commitsPath = path.join(process.cwd(), '.vcs', 'commits');
    
    // Breadth-first search from id2 to find the first commit that is also in history1
    const queue = [id2];
    const visited = new Set();

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current || visited.has(current)) continue;
        
        if (history1.has(current)) return current;
        
        visited.add(current);
        try {
            const data = JSON.parse(await fs.readFile(path.join(commitsPath, current, 'commit.json'), 'utf8'));
            const parents = data.parents || (data.parent ? [data.parent] : []);
            queue.push(...parents);
        } catch (err) {}
    }
    return null;
}

/**
 * Performs a 3-way merge on line-by-line basis
 */
function mergeContent(base, target, source, targetBranch, sourceBranch) {
    if (target === source) return { merged: target, conflict: false };
    
    const targetChanged = target !== base;
    const sourceChanged = source !== base;
    
    if (targetChanged && sourceChanged) {
        let result = [];
        result.push(`<<<<<<< ${targetBranch}`);
        result.push(target);
        result.push("=======");
        result.push(source);
        result.push(`>>>>>>> ${sourceBranch}`);
        return { merged: result.join('\n'), conflict: true };
    }
    
    return { merged: targetChanged ? target : source, conflict: false };
}

/**
 * Merges source branch into current branch
 */
export async function mergeBranches(sourceBranchName) {
    await validateVcsRepo();

    const repoPath = path.resolve(process.cwd(), '.vcs');
    const stagingPath = path.join(repoPath, 'staging');

    try {
        const { commitId: targetId, branchName: targetBranch } = await resolveHead();
        const sourceBranchPath = path.join(repoPath, 'branches', `${sourceBranchName}.json`);
        
        let sourceId;
        try {
            const sourceBranchData = JSON.parse(await fs.readFile(sourceBranchPath, 'utf8'));
            sourceId = sourceBranchData.head;
        } catch (err) {
            throw new Error(`Source branch '${sourceBranchName}' not found or invalid.`);
        }

        if (!sourceId) {
            throw new Error("Source branch is empty.");
        }

        const baseId = await findBaseCommit(targetId, sourceId);
        
        const getFiles = async (cid) => {
            if (!cid) return {};
            const data = JSON.parse(await fs.readFile(path.join(repoPath, 'commits', cid, 'commit.json'), 'utf8'));
            return data.files || {}; // This is a mapping of relativePath -> hash
        };

        const baseFiles = await getFiles(baseId);
        const targetFiles = await getFiles(targetId);
        const sourceFiles = await getFiles(sourceId);

        const allFileNames = new Set([
            ...Object.keys(baseFiles),
            ...Object.keys(targetFiles),
            ...Object.keys(sourceFiles)
        ]);

        const conflicts = [];
        const mergedFiles = {};

        for (const file of allFileNames) {
            const B = baseFiles[file]; // hash
            const T = targetFiles[file]; // hash
            const S = sourceFiles[file]; // hash

            if (T === S) {
                if (T) mergedFiles[file] = T;
                continue;
            }

            if (T === B) {
                if (S) mergedFiles[file] = S;
                continue;
            }

            if (S === B) {
                if (T) mergedFiles[file] = T;
                continue;
            }

            // Conflict detected - both changed from base
            // In our .vcs system, we store file content in commits/<hash>/files/<path>
            const readFileFromCommit = async (cid, filePath) => {
                if (!cid) return "";
                try {
                    return await fs.readFile(path.join(repoPath, 'commits', cid, 'files', filePath), 'utf8');
                } catch (err) {
                    return "";
                }
            };

            const baseContent = await readFileFromCommit(baseId, file);
            const targetContent = await readFileFromCommit(targetId, file);
            const sourceContent = await readFileFromCommit(sourceId, file);

            const { merged, conflict } = mergeContent(baseContent, targetContent, sourceContent, targetBranch, sourceBranchName);
            
            if (conflict) {
                conflicts.push({
                    file,
                    content: merged,
                    targetContent,
                    sourceContent,
                    targetBranch,
                    sourceBranch: sourceBranchName
                });
            } else {
                // Not a conflict, but we need the content to save it
                // For now, we'll just use the hash from the one that changed
                // (This is a simplification; in a real merge we'd re-hash the merged content)
                mergedFiles[file] = T !== B ? T : S;
            }
        }

        if (conflicts.length > 0) {
            const conflictsPath = path.join(repoPath, 'MERGE_CONFLICTS.json');
            await fs.writeFile(conflictsPath, JSON.stringify(conflicts, null, 2), 'utf8');
            console.log(`Merge conflicts detected in: ${conflicts.map(c => c.file).join(', ')}`);
            console.log("Please resolve them in the working directory.");
            
            // Write conflicted files to working directory
            for (const conflict of conflicts) {
                const workingPath = path.join(process.cwd(), conflict.file);
                await fs.mkdir(path.dirname(workingPath), { recursive: true });
                await fs.writeFile(workingPath, conflict.content, 'utf8');
            }
            
            return { success: false, conflicts };
        }

        // Finalize Merge (no conflicts)
        for (const [file, hash] of Object.entries(mergedFiles)) {
            // Find which commit has this hash for this file to copy it
            const commitIdWithFile = targetFiles[file] === hash ? targetId : sourceId;
            const sourcePath = path.join(repoPath, 'commits', commitIdWithFile, 'files', file);
            const workingPath = path.join(process.cwd(), file);
            const stageFilePath = path.join(stagingPath, file);

            await fs.mkdir(path.dirname(workingPath), { recursive: true });
            await fs.mkdir(path.dirname(stageFilePath), { recursive: true });
            
            await fs.copyFile(sourcePath, workingPath);
            await fs.copyFile(sourcePath, stageFilePath);
        }

        // Handle deleted files
        for (const file in targetFiles) {
            if (!mergedFiles[file]) {
                try {
                    await fs.unlink(path.join(process.cwd(), file));
                } catch (err) {}
            }
        }

        await commitRepo(`Merge branch '${sourceBranchName}' into ${targetBranch}`);
        console.log(`Successfully merged '${sourceBranchName}' into '${targetBranch}'.`);
        return { success: true };

    } catch (err) {
        console.error("Merge error:", err.message);
        throw err;
    }
}
