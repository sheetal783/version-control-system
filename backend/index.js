import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
dotenv.config();

import express from "express";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { initRepo } from "./controllers/init.js";
import { addRepo } from "./controllers/add.js";
import { commitRepo } from "./controllers/commit.js";
import { Push } from "./controllers/push.js";
import { Pull } from "./controllers/pull.js";
import { revertRepo } from "./controllers/revert.js";
import mainRouter from "./Routs/mainRouter.js";
// CLI commands
yargs(hideBin(process.argv))
  .command("start", "start a new server", {}, startServer)
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
    (argv) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'index.js:39', message: 'add command called', data: { file: argv.file }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      try {
        addRepo(argv.file);
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'index.js:39', message: 'add command error', data: { error: error.message, stack: error.stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
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
    (argv) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'index.js:52', message: 'commit command called', data: { message: argv.message, messege: argv.messege }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion
      try {
        commitRepo(argv.message);
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'index.js:52', message: 'commit command error', data: { error: error.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
        // #endregion
        console.error('Error in commit command:', error);
      }
    }
  )
  .command("push", "push changes to remote repository", {}, (argv) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'index.js:55', message: 'push command called', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
    // #endregion
    try {
      Push();
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'index.js:55', message: 'push command error', data: { error: error.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion
      console.error('Error in push command:', error);
    }
  })
  .command("pull", "pull changes from remote repository", {}, (argv) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'index.js:56', message: 'pull command called', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
    // #endregion
    try {
      Pull();
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/bc8ed9df-e2f0-4adf-b6b1-e9c446f62c5f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'index.js:56', message: 'pull command error', data: { error: error.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
      // #endregion
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
    (argv) => {
      try {
        revertRepo(argv.commitId);
      } catch (error) {
        console.error('Error in revert command:', error);
      }
    }
  )
  .demandCommand(1, "You need at least one command before moving forward")
  .help().argv;

function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(bodyParser.json());
  app.use(express.json());

  const mongoUrl = process.env.MONGODB_URL;

  mongoose.connect(mongoUrl)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });

  app.use(cors({ origin: "*" }));

  app.use("/", mainRouter);


  let user = "test";
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],

    },
  });



  io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
      user = userID;
      console.log("====");
      console.log(user);
      console.log("====");
      socket.join(userID);
    });
  });

  const db = mongoose.connection;

  db.once("open", async () => {
    console.log("CRUD operations called");
    //CRUD operations

  });

  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

