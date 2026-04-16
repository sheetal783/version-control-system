import express from "express";
import cors from "cors";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { initRepo } from "./controllers/init.js";
import { addRepo } from "./controllers/add.js";
import { commitRepo } from "./controllers/commit.js";
import { Push } from "./controllers/push.js";
import { Pull } from "./controllers/pull.js";
import { revertRepo } from "./controllers/revert.js";
import mainRouter from "./Routs/mainRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/", mainRouter);

// Connect to MongoDB before starting the server
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

// Start HTTP server for API endpoints
startServer();

// Optional: CLI commands for local repository operations
// Only parse yargs if arguments are provided
if (process.argv.length > 2) {
  yargs(hideBin(process.argv))
    .command(
      "init",
      "initialize a project",
      {},
      initRepo
    )
    .command(
      "add <file>",
      "add a file to the repository",
      (yargs) => {
        yargs.positional("file", {
          describe: "file to add to the staging area",
          type: "string",
        });
      },
      async (argv) => {
        try {
          await addRepo(argv.file);
        } catch (error) {
          console.error('Error in add command:', error);
        }
      }
    )
    .command(
      "commit <message>",
      "commit changes to the repository",
      (yargs) => {
        yargs.positional("message", {
          describe: "commit message",
          type: "string",
        });
      },
      async (argv) => {
        try {
          await commitRepo(argv.message);
        } catch (error) {
          console.error('Error in commit command:', error);
        }
      }
    )
    .command("push", "push changes to remote repository", {}, async (argv) => {
      try {
        await Push();
      } catch (error) {
        console.error('Error in push command:', error);
      }
    })
    .command("pull", "pull changes from remote repository", {}, async (argv) => {
      try {
        await Pull();
      } catch (error) {
        console.error('Error in pull command:', error);
      }
    })
    .command(
      "revert <commitId>",
      "revert to a specific commit",
      (yargs) => {
        yargs.positional("commitId", {
          describe: "ID of the commit to revert to",
          type: "string",
        });
      },
      async (argv) => {
        try {
          await revertRepo(argv.commitId);
        } catch (error) {
          console.error('Error in revert command:', error);
        }
      }
    )
    .help().argv;
}

