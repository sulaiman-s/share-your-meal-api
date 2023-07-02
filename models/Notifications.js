import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  user_email: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: false,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  notification_image: {
    type: String,
    required: false,
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("notification", NotificationSchema);
export default Notification;
