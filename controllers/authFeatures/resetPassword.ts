import { Request, Response, NextFunction } from "express";

import validator from "../../utils/validator";
import crypto from "crypto";
import { User } from "../../models/userModel";
import AppError from "../../utils/appError";
import { validate } from "../validateController";

export = async (req: Request, res: Response, next: NextFunction) => {
  validate("resetPassword", req.body, next);

  // 1) Get user based on the token
  const hashedToken: string = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user: any = await User.findOne({
    emailToken: hashedToken,
    emailTokenExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is an user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.emailToken = undefined;
  user.emailTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    status: "success",
  });
};
