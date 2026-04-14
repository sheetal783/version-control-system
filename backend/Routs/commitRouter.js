import express from "express";
import * as commitController from "../controllers/commitControllers.js";

const commitRouter = express.Router();

commitRouter.post("/api/commits", commitController.saveCommit);
commitRouter.get("/api/commits", commitController.getAllCommits);
commitRouter.get("/api/commits/:repoName", commitController.getCommitsByRepo);

export default commitRouter;
