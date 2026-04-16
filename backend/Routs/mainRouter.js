import express from "express";
import userRouter from "./userRouter.js";
import repoRouter from "./repoRouter.js";
import issueRouter from "./issueRouter.js";
import commitRouter from "./commitRouter.js";
import { generateCommitMessageController } from "../controllers/aiController.js";

const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);
mainRouter.use(commitRouter);

mainRouter.post("/generate-commit-message", generateCommitMessageController);

mainRouter.get("/", (req, res) => {
    res.send("welcome");
});

export default mainRouter;