import express from "express";
import issueController from "../controllers/issueControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
const issueRouter = express.Router();

issueRouter.post("/issue/create", authMiddleware, issueController.createIssue);
issueRouter.get("/issue/all", issueController.getAllIssues);
issueRouter.get("/issue/:id", issueController.getIssueById);
issueRouter.put("/issue/update/:id", authMiddleware, issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", authMiddleware, issueController.deleteIssueById);

export default issueRouter;