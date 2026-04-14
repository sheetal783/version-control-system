import express from "express";
import * as userController from "../controllers/userControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
const userRouter = express.Router();

userRouter.get("/user/all", userController.getAllUsers);
userRouter.post("/user/signup", userController.signup);
userRouter.post("/user/login", userController.login);
userRouter.get("/userProfile/:id", authMiddleware, userController.getUserProfile);
userRouter.put("/userProfile/:id", authMiddleware, userController.updateUserProfile);
userRouter.delete("/userProfile/:id", authMiddleware, userController.deleteUserProfile);
userRouter.post("/user/logout", authMiddleware, userController.logout);
userRouter.post("/user/follow", authMiddleware, userController.followUser);
userRouter.post("/user/unfollow", authMiddleware, userController.unfollowUser);
userRouter.post("/user/star", authMiddleware, userController.starRepo);
userRouter.post("/user/unstar", authMiddleware, userController.unstarRepo);
userRouter.post("/user/forgot-password", userController.forgotPassword);
userRouter.post("/user/reset-password/:token", userController.resetPassword);

export default userRouter;