import { Request, Response, NextFunction } from "express";
import { User } from "../../models/userModel";
import validator from "../../utils/validator";
import AppError from "../../utils/appError";

interface CustomRequest extends Request {
  user?: any;
}

export = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const body: object = {
    currentPassword: req.body.currentPassword,
    password: req.body.newPassword,
    passwordConfirm: req.body.newPasswordConfirm,
  };
  validator(body, {
    currentPassword: { required: true, type: "string" },
    password: {
      required: true,
      type: "string",
      minlength: [8, "Your password must be at least 8 characters long."],
    },
    passwordConfirm: { required: true, type: "string" },
  });

  // 1) Check if POSTed current password is correct
  const user: any = await User.findById(req.user.id).select("+password");
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Your password is incorrect!", 401));
  }

  // 2) If so, update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  user.passwordChangedAt = Date.now();

  await user.save();

  res.status(200).json({
    status: "success",
  });
};
