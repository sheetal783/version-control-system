import express from "express";
import cors from "cors";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";

import mongoose from "mongoose";

import connectDB from "./config/db.js";
import { initRepo } from "./controllers/init.js";
import { addRepo } from "./controllers/add.js";
import { commitRepo } from "./controllers/commit.js";
import { Push } from "./controllers/push.js";
import { Pull } from "./controllers/pull.js";
import { revertRepo } from "./controllers/revert.js";
import { getStatus } from "./controllers/status.js";
import { getLog } from "./controllers/log.js";
import { createBranch, switchBranch, listBranches } from "./controllers/branch.js";
import { mergeBranches } from "./controllers/merge.js";
import mainRouter from "./Routs/mainRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    res.status(mongoose.connection.readyState === 1 ? 200 : 500).json({
        status: "OK",
        mongodb: dbStatus,
        message: mongoose.connection.readyState === 1 
            ? "Server and Database are healthy" 
            : "Server is up but Database is unreachable"
    });
});

app.use("/", mainRouter);

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

if (process.argv.length > 2) {
    yargs(hideBin(process.argv))
        .command("init", "Initialize a project", {}, initRepo)
        .command("add <file>", "Add a file to the repository", (yargs) => {
            yargs.positional("file", { describe: "file to add", type: "string" });
        }, (argv) => addRepo(argv.file))
        .command("commit <message>", "Commit changes", (yargs) => {
            yargs.positional("message", { describe: "commit message", type: "string" });
        }, (argv) => commitRepo(argv.message))
        .command("status", "Show repository status", {}, getStatus)
        .command("log", "Show commit log", {}, getLog)
        .command("push", "Push changes to remote", {}, Push)
        .command("pull", "Pull changes from remote", {}, Pull)
        .command("revert <commitId>", "Revert to a commit", (yargs) => {
            yargs.positional("commitId", { describe: "commit hash", type: "string" });
        }, (argv) => revertRepo(argv.commitId))
        .command("branch <name>", "Create a new branch", (yargs) => {
            yargs.positional("name", { describe: "branch name", type: "string" });
        }, (argv) => createBranch(argv.name))
        .command("merge <branch>", "Merge a branch", (yargs) => {
            yargs.positional("branch", { describe: "branch to merge", type: "string" });
        }, (argv) => mergeBranches(argv.branch))
        .help().argv;
}
