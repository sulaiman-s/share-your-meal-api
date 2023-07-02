import Notification from "../models/Notifications.js";

// @desc    Get all notifications of a user
// @route   GET /api/notifications/:user_email
// @access  Public

export const getNotifications = async (req, res) => {
  try {
    const notification = await Notification.find({
      user_email: req.params.user_email,
    });
    if (notification) {
      res.status(200).json({
        message: "Notification found",
        success: true,
        notification,
      });
    } else {
      res.status(400);
      throw new Error("Notification not found");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};
