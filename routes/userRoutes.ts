import express, { Express, Request, Response, Router } from "express";
import {
  login,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  protect,
  testFunction,
} from "../controllers/authController";

import { getOne } from "../controllers/userController";

const userRouter: Router = Router();

userRouter.route("/signup").post(signup);
userRouter.route("/verify/:token").patch(verifyEmail);
userRouter.route("/login").post(login);
userRouter.route("/forgotPassword").post(forgotPassword);
userRouter.route("/resetPassword/:token").patch(resetPassword);
userRouter.route("/test").post(testFunction);

userRouter.use(protect);

userRouter.route("/:id").get(getOne);

export { userRouter };
