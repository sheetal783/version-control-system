# 📑 VCS CLI Architecture & Recent Updates

This document explains the recent architectural changes made to the VCS CLI and how the core commands function under the hood.

## 🚀 Key Architectural Changes

### 1. Unified Repository Structure (`.vcs`)
We have standardized the repository directory across all commands and layers.
- **Old**: Used both `.apnagit` and `.vcs` inconsistently.
- **New**: Exclusively uses `.vcs` in the project root.
- **Impact**: No more directory mismatch errors between backend and CLI.

### 2. Centralized Validation Utility
A new shared utility module was introduced in `backend/utils/vcs.js`.
- **Validation**: All repository-dependent commands now call `validateVcsRepo()` to ensure they are being run inside a valid VCS repository.
- **RepoName Check**: `push` and `pull` now verify if a remote repository name is set in `config.json` before attempting synchronization.
- **Why?**: This prevents "silent failures" and provides clear, actionable error messages to the user.

### 3. Missing Functionality Restored
- **`resolveHead()`**: Correctly implemented to walk the `.vcs/HEAD` and `.vcs/branches/*.json` files to determine current state.
- **Consistant Commands**: Added missing CLI commands (`status`, `log`, `branch`, `checkout`, `merge`) to the main entry point.

---

## 🛠️ How it Works (Under the Hood)

### 1. Initialization (`vcs init`)
Creates the root `.vcs` folder and populates it with:
- `branches/`: JSON files for each branch (e.g., `main.json`).
- `commits/`: Individual folders for every commit hash.
- `HEAD`: Points to the active branch name.
- `index.json`: The "Staging area" tracking file fingerprints (SHA-256).
- `config.json`: Stores local/remote settings.

### 2. Staging (`vcs add`)
1. Fingerprints the file content using **SHA-256**.
2. Saves a copy of the file to `.vcs/staging/`.
3. Updates `index.json` with the file path and its unique hash.

### 3. Committing (`vcs commit`)
1. Captures the current state of `index.json`.
2. Generates a new **SHA-256 Commit Hash** from the metadata (message, timestamp, parent, files).
3. Moves staged files into `.vcs/commits/<hash>/files/`.
4. Writes `commit.json` metadata file.
5. Updates the current branch's `.json` file in `branches/` with the new head hash.

### 4. Synchronization (`vcs push` & `pull`)
- **Push**: Identifies commits that haven't been synced (using `lastPushed` flag) and sends the metadata and files to the server API.
- **Pull**: Fetches the entire repository history from the remote server, filling in any missing local commits.
- **Error Handling**: 
    - `404`: Tells you the remote Repo name was not found on the server.
    - `500`: Indicates a server-side problem.
    - `Connection Failed`: Handled gracefully if the server is offline.

### 5. Branching & Merging
- **Branch/Checkout**: Simply updates the `HEAD` file and the JSON pointers in `branches/`.
- **Merge**: Performs a **3-Way Merge** by finding the "Base" (Common Ancestor) between two branches and comparing line-by-line changes. If conflicts are found, it writes conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) directly into your working files.

---

## 🛡️ Error Handling Summary

| Scenario | Behavior |
| :--- | :--- |
| **No .vcs folder** | Shows: `Error: Not a vcs repository. Run 'vcs init' first.` |
| **No Remote Set** | Shows: `Error: No remote repository linked. Run: vcs remote add origin <repoName>` |
| **Commit Not Found** | Shows: `Error: Commit <id> not found` |
| **Server Offline** | Shows: `Error: Connection failed during push/pull` |
