#!/usr/bin/env node

import { initRepo } from "../backend/controllers/init.js";
import { addRepo } from "../backend/controllers/add.js";
import { commitRepo } from "../backend/controllers/commit.js";
import { Push } from "../backend/controllers/push.js";
import { Pull } from "../backend/controllers/pull.js";
import { revertRepo } from "../backend/controllers/revert.js";
import { remoteAdd } from "../backend/controllers/remote.js";
import { getStatus } from "../backend/controllers/status.js";
import { getLog } from "../backend/controllers/log.js";
import { createBranch, switchBranch, listBranches } from "../backend/controllers/branch.js";
import { mergeBranches } from "../backend/controllers/merge.js";

const [,, command, ...args] = process.argv;

function showHelp() {
  console.log("vcs help - list available commands");
  console.log("Usage: vcs <command> [options]");
  console.log("Available commands:");
  console.log("  init              - Initialize a new repository");
  console.log("  add <file>        - Add file to staging area");
  console.log("  commit <message>  - Commit staged changes");
  console.log("  status            - Show working directory status");
  console.log("  log               - Show commit history");
  console.log("  push              - Push to remote repository");
  console.log("  pull              - Pull from remote repository");
  console.log("  revert <commitId> - Revert to specific commit");
  console.log("  remote add origin <repoName> - Set remote repository name");
  console.log("  branch <name>     - Create a new branch");
  console.log("  branch list       - List all branches");
  console.log("  checkout <name>   - Switch to a branch");
  console.log("  merge <branch>    - Merge a branch into current branch");
}

if (!command) {
  showHelp();
  process.exit(0);
}

switch (command) {
  case "init":
    await initRepo();
    break;
  case "add":
    if (args.length === 0) {
      console.error("Usage: vcs add <file>");
      process.exit(1);
    }
    await addRepo(args[0]);
    break;
  case "commit":
    if (args.length === 0) {
      console.error("Usage: vcs commit <message>");
      process.exit(1);
    }
    await commitRepo(args.join(" "));
    break;
  case "status":
    await getStatus();
    break;
  case "log":
    await getLog();
    break;
  case "push":
    await Push();
    break;
  case "pull":
    await Pull();
    break;
  case "revert":
    if (args.length === 0) {
      console.error("Usage: vcs revert <commitId>");
      process.exit(1);
    }
    await revertRepo(args[0]);
    break;
  case "remote":
    if (args.length < 3 || args[0] !== "add") {
      console.error("Usage: vcs remote add origin <repoName>");
      process.exit(1);
    }
    await remoteAdd(args[1], args[2]);
    break;
  case "branch":
    if (args.length === 0) {
      console.error("Usage: vcs branch <name> or vcs branch list");
      process.exit(1);
    }
    if (args[0] === "list") {
      await listBranches();
    } else {
      await createBranch(args[0]);
    }
    break;
  case "checkout":
    if (args.length === 0) {
      console.error("Usage: vcs checkout <branchName>");
      process.exit(1);
    }
    await switchBranch(args[0]);
    break;
  case "merge":
    if (args.length === 0) {
      console.error("Usage: vcs merge <branchName>");
      process.exit(1);
    }
    await mergeBranches(args[0]);
    break;
  case "help":
    showHelp();
    break;
  default:
    console.log(`Unknown command: ${command}`);
    showHelp();
}
