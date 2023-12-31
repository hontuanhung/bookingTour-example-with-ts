import { Request, Response, NextFunction } from "express";

import multer from "multer";
import sharp from "sharp";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";
import { Tour } from "../models/tourModel";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

import getTourStatsFeat from "./tourFeatues/getTourStats";
import getMonthlyPlanFeat from "./tourFeatues/getMonthlyPlan";
import getToursWithinFeat from "./tourFeatues/getToursWithin";
import getDistancesFeat from "./tourFeatues/getDistances";
import { validate } from "./validateController";

const multerStorage = multer.memoryStorage();

const muterFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: any
): void => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload: multer.Multer = multer({
  storage: multerStorage,
  fileFilter: muterFilter,
});

export const uploadTourImgs: any = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// interface CustomRequest extends Request {
//   user?: any;
// }

export const resizeTourImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let files = req.files as { [fieldname: string]: Express.Multer.File[] } | any;
  if (!files) {
    return next();
  }
  if (files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/image-Cover/${req.body.imageCover}`);
  }

  if (files.images) {
    req.body.images = [];
    await Promise.all(
      files.images.map(async (file: Express.Multer.File, i: number) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/images/${filename}`);
        req.body.images.push(filename);
      })
    );
  }

  console.log(req.body);
  next();
};

export const validateBeforeCreateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    validate("createTour", req.body, next);
    if (req.body.startLocation) {
      req.body.startLocation = JSON.parse(req.body.startLocation);
    }
    if (req.body.locations) {
      req.body.locations = req.body.locations.map((el: any) => JSON.parse(el));
    }

    next();
  }
);

export const validateBeforeUpdateTour = catchAsync(async (req, res, next) => {
  validate("updateTour", req.body, next);

  if (req.body.startLocation) {
    req.body.startLocation = JSON.parse(req.body.startLocation);
  }
  if (req.body.locations) {
    req.body.locations = req.body.locations.map((el: any) => JSON.parse(el));
  }
  next();
});

export const getAllTours = getAll(Tour);
export const getTour = getOne(Tour, { path: "reviews" });
export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);

export const getTourStats = catchAsync(getTourStatsFeat);
export const getMonthlyPlan = catchAsync(getMonthlyPlanFeat);
export const getToursWithin = catchAsync(getToursWithinFeat);
export const getDistances = catchAsync(getDistancesFeat);

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};
