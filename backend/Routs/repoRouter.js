import express from "express";
import * as repoController from "../controllers/repoControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
const repoRouter = express.Router();

repoRouter.post("/repo/create", authMiddleware, repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", authMiddleware, repoController.fetchRepositoriesForCurrentUser);
repoRouter.put("/repo/update/:id", authMiddleware, repoController.updateRepositoryById);
repoRouter.patch("/repo/toggle/:id", authMiddleware, repoController.toggleVisibilityById);
repoRouter.delete("/repo/delete/:id", authMiddleware, repoController.deleteRepositoryById);

export default repoRouter;