import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import User from "../models/Images.js";
import multerImageHandler from "../multer.js";
import cloudinary from "../cloudinaryUploader.js";

const router = express.Router();
const DIR = "./public/";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});
// var upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     if (
//       file.mimetype == "image/png" ||
//       file.mimetype == "image/jpg" ||
//       file.mimetype == "image/jpeg"
//     ) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//       return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
//     }
//   },
// });
// User model

router.post(
  "/food-image",
  multerImageHandler.single("profileImg"),
  async (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");

    const newurl = await cloudinary.v2.uploader
      .upload(req.file.path)
      .catch((err) => console.log(err));

    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      profileImg: newurl.secure_url,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "Image Uploaded successfully!",
          userCreated: {
            _id: result._id,
            profileImg: result.profileImg,
          },
        });
      })
      .catch((err) => {
        console.log(err),
          res.status(500).json({
            error: err,
          });
      });
  }
);
router.get("/", (req, res, next) => {
  User.find().then((data) => {
    res.status(200).json({
      message: "User list retrieved successfully!",
      users: data,
    });
  });
});
export default router;
