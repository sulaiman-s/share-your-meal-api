import mongoose from "mongoose";

// User Schema Definition
const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: false,
    trim: true,
  },
  last_name: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },

  coord: {
    type: Object,
    required: false,
    trim: true,
  },

  location_name: {
    type: String,
    required: false,
    trim: true,
  },

  accounttype: {
    type: String,
    required: true,
    trim: true,
  },

  emailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user_avatar: {
    type: String,
    required: false,
    trim: true,
  },

  phone_number: {
    type: String,
    required: true,
    trim: true,
  },

  token: {
    type: String,
    required: false,
    default: "",
    expires: 60,
  },
});

// Define User Model
const User = mongoose.model("user", UserSchema);

export default User;
