# 🛠️ VCS CLI Commands Reference

To use these commands, navigate to the `backend` directory and run them using `node index.js`.

| Command | Usage | Description |
| :--- | :--- | :--- |
| **init** | `node index.js init` | Initializes a new VCS repository (creates `.vcs` folder). |
| **add** | `node index.js add <file_path>` | Stages a specific file for the next commit. |
| **commit** | `node index.js commit "<message>"` | Takes a snapshot of staged files and saves it with a message. |
| **push** | `node index.js push` | Uploads local commits to the server and syncs metadata. |
| **pull** | `node index.js pull` | Downloads commits from the server to your local machine. |
| **revert** | `node index.js revert <commitId>` | Overwrites your current working files with the versions from a specific commit. |
| **log** | `node index.js log` | Displays the history of all commits made in this repository. |
| **status** | `node index.js status` | Shows which files are changed, staged, or untracked. |
| **branch** | `node index.js branch <name>` | Creates a new branch for parallel development. |
| **merge** | `node index.js merge <branch>` | Merges changes from another branch into your current one. |

---

## 💡 Quick Start Example

```bash
# 1. Start a project
node index.js init

# 2. Create a file
echo "Hello VCS" > hello.txt

# 3. Save your progress
node index.js add hello.txt
node index.js commit "Initial commit"

# 4. Sync with the cloud
node index.js push
```

> [!NOTE]
> Make sure your server is running (`npm run dev` in backend) for `push` and `pull` to work correctly.

