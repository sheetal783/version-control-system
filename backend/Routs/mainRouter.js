import express from "express";
import userRouter from "./userRouter.js";
import repoRouter from "./repoRouter.js";
import issueRouter from "./issueRouter.js";

const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);

mainRouter.get("/", (req, res) => {
    res.send("welcome");
});

export default mainRouter;