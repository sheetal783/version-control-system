# VCS Command Line Cheat Sheet

Here are all the available commands for your custom Version Control System (VCS). You can run these using `node index.js <command>` (or `vcs <command>` if you have aliased it globally).

## 🚀 Core Commands

| Command | Description | Example |
|---|---|---|
| **`init`** | Initializes a new empty VCS repository in the current directory. Creates the `.vcs` folder and sets up the branches, commits, and config. | `vcs init` |
| **`add <file>`** | Adds a specific file to the staging area to prepare it for committing. | `vcs add all.txt` |
| **`commit <message>`** | Commits all added/staged changes to the local history with a descriptive message. | `vcs commit "Initial commit"` |
| **`status`** | Shows the current repository status (e.g. what files are staged or modified). | `vcs status` |
| **`log`** | Shows the commit log/history for the current branch. | `vcs log` |

## 🌐 Remote Synchronization

| Command | Description | Example |
|---|---|---|
| **`push`** | Pushes all local commits to your remote MongoDB Atlas backend. | `vcs push` |
| **`pull`** | Pulls the latest commits/changes from your remote MongoDB Atlas backend to your local workspace. | `vcs pull` |

## 🌿 Branching & Reverting

| Command | Description | Example |
|---|---|---|
| **`branch <name>`** | Creates a new branch with the given name from your current state. | `vcs branch feature-login` |
| **`merge <branch>`** | Merges the specified branch into your current branch. | `vcs merge feature-login` |
| **`revert <commitId>`** | Reverts your workspace backward in time to exactly match a specific past commit hash. | `vcs revert 53500c76` |

---
**How pushing works under the hood:**
When you run `push`, the system checks your `.vcs/config.json` for the `repoName`. It then queries your backend API (`http://localhost:5000/api/commit/sync`) and inserts the new commits under that exact repository's ID in MongoDB. If the name inside `config.json` does not match the name you are viewing on your dashboard, the commits will go to the wrong place or return a 404 error!
