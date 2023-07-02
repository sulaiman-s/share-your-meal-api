// Create User Controller
import User from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Review from "../models/Reviews.js";
import Food from "../models/Food.js";
// @desc    Register a new user
// @route   POST http://localhost:8000/api/users/signup
// @access  Public
export const registerUser = async (req, res) => {
  const {
    first_name,
    email,
    password,
    confirm_password,
    accounttype,
    phone_number,
  } = req.body;

  try {
    // check if confirm password matches password else throw error

    if (password !== confirm_password) {
      throw new Error("Passwords do not match");
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // create password hash for the user
    const password_salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, password_salt);

    const user = await User.create({
      first_name,
      email,
      password: password_hash,
      accounttype,
      coord: { lat: 0, lng: 0 },
      location_name: "",
      phone_number,
    });

    // create token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    if (user) {
      res.status(200).json({
        message: "User created successfully",
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          accounttype: user.accounttype,
          phone_number: user.phone_number,
        },
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

// @desc    updated user profile
// @route   PUT /api/users/profile
// @access  Public
export const updateUserProfile = async (req, res) => {
  const { first_name, last_name, user_avatar, email } = req.body;

  try {
    // Check if user exists then update user phone number, first name, last name and user avatar
    const user = await User.findOne({ email: email });
    if (user) {
      (user.first_name = first_name),
        (user.last_name = last_name),
        (user.user_avatar = user_avatar);
      const updatedUser = await user.save();

      //update food_shared_by avatar
      const updatedFood = await Food.updateMany(
        { food_shared_by: email },
        { $set: { food_shared_by_avatar: user_avatar } }
      );

      //update reviews by rated by

      const reviews = await Review.updateMany(
        {
          ratedBy_email: email,
        },
        //$set avatar
        { $set: { ratedBy_avatar: user_avatar } }
      );

      console.log(updatedFood, reviews);

      res.status(200).json({
        message: "User updated successfully",
        success: true,
        user: updatedUser,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // create token for the user
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      res.status(200).json({
        message: "User logged in successfully",
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          location_name: user.location_name,
          coord: user.coord,
          accounttype: user.accounttype,
          first_name: user.first_name,
          last_name: user.last_name,
          emailVerified: user.emailVerified,
          phone_number: user.phone_number,
          user_avatar: user.user_avatar,
        },
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

// @desc    forgot password
// @route   POST /api/users/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (user) {
      // create token for the user
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      // send email to user
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/users/resetpassword/${token}`;

      const message = ` Please make a PUT request to: \n\n ${resetUrl}`;

      try {
        await sendEmail({
          email: user.email,
          subject: "Password reset token",
          message,
        });

        res.status(200).json({
          message: "Email sent",
          success: true,
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(500);
        throw new Error("Email could not be sent");
      }
    } else {
      res.status(401);
      throw new Error("Invalid email");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

// @desc    reset password
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
  const { password, confirm_password } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  try {
    // Check if user exists
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (user) {
      // set new password
      user.password = req.body.password;
      user.confirm_password = req.body.confirm_password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      // create password hash for the user
      const password_salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(user.password, password_salt);

      user.password = password_hash;

      await user.save();

      res.status(200).json({
        message: "Password reset success",
        success: true,
      });
    } else {
      res.status(401);
      throw new Error("Invalid token");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

// @desc    change password
// @route   PUT /api/users/changepassword
// @access  Private
export const changePassword = async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;

  try {
    // Check if password matches else throw error
    if (confirm_password !== new_password) {
      throw new Error("Passwords do not match");
    }

    // Check if user exists
    const user = await User.findById(req.user.id).select("+password");

    if (user && (await bcrypt.compare(current_password, user.password))) {
      // set new password
      user.password = new_password;
      user.confirm_password = confirm_password;

      // create password hash for the user
      const password_salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(user.password, password_salt);

      user.password = password_hash;

      await user.save();

      res.status(200).json({
        message: "Password changed successfully",
        success: true,
      });
    } else {
      res.status(401);
      throw new Error("Invalid current password");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

// @desc forget password
// @route POST /api/users/forgotpassword
// @access Public
// forget password by providing otp to the user

//  @desc send otp for email verification
//  @route POST /api/users/sendotp
//  @access Public
export const sendOtpforEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const otp = Math.floor(10000 + Math.random() * 90000);
      const message = `OTP for Account Verification. Your OTP is ${otp}`;
      try {
        await sendEmail({
          email: user.email,
          subject: "OTP for Account Verification",
          message,
        });
        user.token = otp;
        await user.save();
        res.status(200).json({
          message: "OTP sent to your email",
          success: true,
          email: user.email,
        });
      } catch (error) {
        res.status(500).json({
          message: "Email could not be sent",
          success: false,
        });
      }
    } else {
      res.status(401).json({
        message: "Invalid email",
        success: false,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

//  @desc verify otp for email verification
//  @route POST /api/users/verifyotpforemail
//  @access Public
export const verifyOtpForEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      if (user.token === otp) {
        user.emailVerified = true;
        user.token = "";
        await user.save();
        res.status(200).json({
          message: "Email verified successfully",
          success: true,
        });
      } else {
        res.status(401).json({
          message: "Invalid OTP",
          success: false,
        });
      }
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const otp = Math.floor(10000 + Math.random() * 90000);
      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Your OTP is ${otp}`;
      try {
        await sendEmail({
          email: user.email,
          subject: "OTP for Password Reset",
          message,
        });
        user.token = otp;
        await user.save();
        res.status(200).json({
          message: "OTP sent to your email",
          success: true,
          email: user.email,
        });
      } catch (error) {
        res.status(500);
        throw new Error("Email could not be sent");
      }
    } else {
      res.status(401);
      throw new Error("This Email Does not Exist");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

// send email function to send email by nodemailer
const sendEmail = async (options) => {
  console.log(options);

  const transporter = nodemailer.createTransport({
    service: "gmail",

    host: "smtp.gmail.com",

    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

// @desc reset password
// @route PUT /api/users/resetpassword
// @access Public
// reset password by providing otp to the user
export const reset_Password = async (req, res) => {
  const { email, otp, password, confirm_password } = req.body;
  try {
    const user = await User.findOne({ email });
    //if otp is expired then throw error

    if (user.token == otp) {
      if (password === confirm_password) {
        const password_salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, password_salt);
        user.password = password_hash;
        user.confirm_password = password_hash;
        user.token = "";
        await user.save();
        res.status(200).json({
          message: "Password reset success",
          success: true,
        });
      } else {
        res.status(401);
        throw new Error("Password and Confirm Password does not match");
      }
    } else {
      res.status(401);
      throw new Error("Invalid OTP");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

//verify otp
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      if (user.token == otp) {
        res.status(200).json({
          message: "OTP verified",
          success: true,
          otp: user.token,
        });
      } else {
        res.status(401);
        throw new Error("Invalid OTP");
      }
    } else {
      res.status(401);
      throw new Error("This Email Does not Exist");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};

// @desc update user profile
// @route PUT /api/users/addlocation
// @access Private

export const addLocation = async (req, res) => {
  const { user_id, location_name, coord } = req.body;
  console.log(user_id, location_name, coord);
  try {
    const user = await User.findById({ _id: user_id });
    if (user) {
      user.location_name = location_name;
      user.coord = coord;
      await user.save();
      res.status(200).json({
        message: "Location added successfully",
        success: true,
        user: {
          id: user._id,
          email: user.email,
          location_name: user.location_name,
          coord: user.coord,
          accounttype: user.accounttype,
          first_name: user.first_name,
          emailVerified: user.emailVerified,
        },
      });
    } else {
      res.status(401);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      success: false,
      message: error.message,
    });
  }
};
