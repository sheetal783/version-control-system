import Commit from "../Models/commitModel.js";
import Repository from "../Models/repoModel.js";

// POST /api/commit/sync — Sync commits from CLI push
export async function syncCommits(req, res) {
    const { repoName, commits } = req.body;

    try {
        if (!repoName || !commits || !Array.isArray(commits)) {
            return res.status(400).json({ error: "repoName and commits array are required." });
        }

        // Verify repository exists
        const repo = await Repository.findOne({ name: repoName });
        if (!repo) {
            return res.status(404).json({ error: `Repository '${repoName}' not found.` });
        }

        // Store commits
        const savedCommits = [];
        for (const commit of commits) {
            try {
                const savedCommit = await Commit.findOneAndUpdate(
                    { commitId: commit.commitHash },
                    {
                        commitId: commit.commitHash,
                        repoName,
                        message: commit.message || '',
                        author: commit.author || 'unknown',
                        timestamp: commit.timestamp || new Date().toISOString(),
                        files: commit.files || [],
                        parent: commit.parent,
                        branch: commit.branch
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                savedCommits.push(savedCommit);
            } catch (error) {
                console.error(`Error saving commit ${commit.commitHash}:`, error.message);
            }
        }

        res.status(201).json({
            message: `Synced ${savedCommits.length} commits for repository '${repoName}'.`,
            commits: savedCommits
        });
    } catch (err) {
        console.error("Error syncing commits:", err.message);
        res.status(500).json({ error: "Server error." });
    }
}

// POST /api/commits — Save a commit to MongoDB (called by CLI push)
export async function saveCommit(req, res) {
    const { commitId, repoName, message, author, timestamp, files } = req.body;

    try {
        if (!commitId || !repoName) {
            return res.status(400).json({ message: "commitId and repoName are required." });
        }

        // Upsert — don't duplicate if pushed again
        const commit = await Commit.findOneAndUpdate(
            { commitId },
            { commitId, repoName, message, author, timestamp, files },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ message: "Commit saved to database.", commit });
    } catch (err) {
        console.error("Error saving commit:", err.message);
        res.status(500).json({ message: "Server error." });
    }
}

// GET /api/commit/all — Fetch commits by repoName (called by CLI pull)
export async function getCommitAll(req, res) {
    const { repoName } = req.query;

    try {
        if (!repoName) {
            return res.status(400).json({ error: "repoName query parameter is required." });
        }

        // Verify repository exists
        const repo = await Repository.findOne({ name: repoName });
        if (!repo) {
            return res.status(404).json({ error: `Repository '${repoName}' not found.` });
        }

        // Fetch all commits for this repository
        const commits = await Commit.find({ repoName }).sort({ timestamp: -1 });

        res.status(200).json(commits);
    } catch (err) {
        console.error("Error fetching commits:", err.message);
        res.status(500).json({ error: "Server error." });
    }
}

// GET /api/commits/:repoName — Fetch all commits for a repo
export async function getCommitsByRepo(req, res) {
    const { repoName } = req.params;

    try {
        const commits = await Commit.find({ repoName })
            .sort({ timestamp: -1 }); // newest first

        res.status(200).json(commits);
    } catch (err) {
        console.error("Error fetching commits:", err.message);
        res.status(500).json({ message: "Server error." });
    }
}

// GET /api/commits — Fetch all commits (for dashboard)
export async function getAllCommits(req, res) {
    try {
        const commits = await Commit.find()
            .sort({ timestamp: -1 });

        res.status(200).json(commits);
    } catch (err) {
        console.error("Error fetching all commits:", err.message);
        res.status(500).json({ message: "Server error." });
    }
}
