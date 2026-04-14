import Commit from "../Models/commitModel.js";

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
