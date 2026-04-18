# Smart Version Control System (VCS)

Smart Version Control System is a MERN-based web app inspired by Git. It is designed to modernize the version control experience by predicting merge conflicts, auto-generating AI commit messages, and visualizing complex commit histories. This fully independent node-based tracking system improves collaboration, reduces conflicts, and helps developers understand project changes instantly.

## 🌟 Key Features
- **Custom Local CLI**: A fully functional command-line interface capable of initialization, staging, committing, and branching through a hidden `.vcs` directory.
- **AI Commit Generation**: Integrates with LLMs to automatically analyze your staged changes and generate clean, standardized commit messages.
- **Merge Conflict Prediction**: Analyzes active branches to alert developers to potential merge conflicts before they even initiate a merge.
- **RESTful Cloud Sync**: A custom Express/MongoDB backend allows pushing and pulling of code securely from the local machine to the cloud.
- **Interactive UI Dashboard**: Explore repositories, browse detailed commit metrics, and view real-time architectural graphs.

## 🏗️ Architecture Stack
- **Frontend**: React.js, Vite, TailwindCSS
- **Backend API**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **Local Storage**: Native File System (`fs/promises`), Cryptographic Hashing (`crypto`)

## 🛠️ Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Ensure you have your `.env` configured with your `MONGODB_URL` and `GROQ_API_KEY` for AI features.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Using the CLI
The core of this system operates via the Node-based CLI inside your backend folder. You can utilize the terminal to interact exactly like Git:

| Command | Action |
|---|---|
| `node index.js init` | Initializes the `.vcs` tracking directory locally. |
| `node index.js add <file>` | Stages a file for the next commit snapshot. |
| `node index.js commit "<message>"` | Snapshots the tracked files into the current branch history. |
| `node index.js status` | Checks modifications against the current commit head. |
| `node index.js push` | Pushes local history securely to the MongoDB remote. |
| `node index.js branch <name>` | Creates an independent development branch locally. |

## 🔗 Architecture Under the Hood
1. **Snapshots**: Every commit hashes all tracked files (SHA-256) and stores a physical copy of the exact file states in `.vcs/commits/<hash>/files`.
2. **Metadata Sync**: `push` requests transmit the commits to the Cloud. The backend verifies the target `repoName` and securely upserts the histories across the remote database.
3. **Restoration**: `revert` commands physically locate the older commit folders and overwrite the active workspace, securely rolling back developer errors.
