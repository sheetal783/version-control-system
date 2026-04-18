# VCS CLI

This is the global CLI entry point for your custom version control system.

## Install globally

From the `cli` folder, run:

```powershell
cd "c:\Users\Sheetal\OneDrive\Desktop\version control system\cli"
npm link
```

This exposes the `vcs` command globally.

## Commands

- `vcs init`
  - Initialize a new repository in the current folder.
  - Creates `.vcs/` with `HEAD`, `config.json`, `index.json`, `commits/`, and `branches/main.json`.

- `vcs add <file>`
  - Stage a single file.
  - Example: `vcs add test.txt`

- `vcs add .`
  - Stage all files in the current folder.
  - Ignores `node_modules/`, `.git/`, and `.vcs/`.

- `vcs commit "<message>"`
  - Create a new commit from staged files.
  - Generates a commit hash and stores commit metadata in `.vcs/commits/<hash>/`.

- `vcs push`
  - Push new commits to remote via `http://localhost:5000/api/commit/sync`.
  - Updates `.vcs/config.json` with `lastPushed`.

- `vcs pull`
  - Fetch commits from remote via `http://localhost:5000/api/commit/all`.
  - Saves new commits into `.vcs/commits/`.

- `vcs revert <commitHash>`
  - Restore the working tree from a specific commit snapshot.
  - Updates the current branch head in `.vcs/branches/<current-branch>.json`.

## Example workflow

```powershell
mkdir test-repo
cd test-repo
vcs init
"hello" | Out-File test.txt
vcs add .
vcs commit "first commit"
vcs push
vcs revert <hash>
```

Replace `<hash>` with the actual commit ID printed by `vcs commit`.

## Notes

- Make sure the backend server is running on port `5000` before using `vcs push`.
- If you want to unlink the global CLI later:

```powershell
npm unlink -g vcs-cli
```
