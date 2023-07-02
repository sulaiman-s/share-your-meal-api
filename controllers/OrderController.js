import Food from "../models/Food.js";
import Users from "../models/Users.js";
import Order from "../models/Order.js";
import Notifications from "../models/Notifications.js";

// @desc    Get all ordered food by a user
// @route   GET /api/food/ordered
// @access  Public

export const getOrderedFood = async (req, res) => {
  try {
    const order = await Order.find({ ordered_by: req.params.ordered_by });
    if (order) {
      res.status(200).json({
        message: "Order found",
        success: true,
        order,
      });
    } else {
      res.status(400);
      throw new Error("Order not found");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

// @desc order food
// @route   POST /api/food/order
// @access  Public

export const orderFood = async (req, res) => {
  try {
    const { order_food_id, order_quantity, ordered_by } = req.body;

    const food = await Food.findById({ _id: order_food_id });

    if (order_quantity <= 0) {
      res.status(400);
      throw new Error("Order quantity cannot be 0");
    }

    if (food) {
      //check if the food_shared_by is same as ordered_by
      if (food.food_shared_by == ordered_by) {
        res.status(400);
        throw new Error("You cannot order your own food");
      }

      //check quantity
      if (food.food_quantity >= order_quantity) {
        //check if food is free

        //check if user has already requested for the food
        const order = await Order.findOne({
          order_food_id: order_food_id,
          ordered_by: ordered_by,
          // order_status not equal to ",
        });

        if (order?.order_status == "pending") {
          res.status(400);
          throw new Error(
            "You have already requested for this food Please wait for the owner to accept your request"
          );
        } else {
          //place order by pending status
          const order = new Order({
            order_food_id,
            order_name: food.food_name,
            order_description: food.food_description,
            order_price: 0,
            order_image: food.food_image,
            order_category: food.food_category,
            order_quantity,
            order_shared_by: food.food_shared_by,
            order_location: food.food_location,
            is_free: food.is_free,
            is_active: true,
            ordered_by,
            order_status: "pending",
            is_pickup: false,
          });
          order.save();

          // issue a notification here
          // send notification to ordered by

          const notifyToSharedBy = new Notifications({
            user_email: food.food_shared_by,
            message: "You have a new order request for your food item",
            title: "New Order Request",
            notification_image: order.order_image,
          });

          notifyToSharedBy.save();

          //send notification to orderedby

          const notifyToOrderedBy = new Notifications({
            user_email: ordered_by,
            message: "Your order request has been placed successfully",
            title: "Order Requested",
            notification_image: order.order_image,
          });

          notifyToOrderedBy.save();

          res.status(200).json({
            message: "Order Requested successfully",
            success: true,
            order,
          });
        }
      } else {
        res.status(400);
        throw new Error("Insufficient quantity");
      }
    } else {
      res.status(400);
      throw new Error("Invalid food data");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

// @desc    accept order
// @route   POST /api/food/acceptorder
// @access  Public

export const acceptOrder = async (req, res) => {
  try {
    const { order_id, order_food_id, order_quantity, ordered_by } = req.body;

    const order = await Order.findById({ _id: order_id });
    if (order) {
      //check if order is pending
      if (order.order_status === "pending") {
        //check if food quantity is sufficient
        const food = await Food.findById({ _id: order_food_id });
        if (food) {
          if (food.food_quantity >= order_quantity) {
            //deduct food quantity
            food.food_quantity = food.food_quantity - order_quantity;
            food.save();
            //update order status to placed
            order.order_status = "placed";
            order.save();

            //send a notification to ordered_by

            const notifyToOrderedBy = new Notifications({
              user_email: order.ordered_by,
              message: "Your order has been accepted successfully",
              title: "Order Accepted",
              notification_image: order.order_image,
            });
            await notifyToOrderedBy.save();

            //notify to order shared by
            const notifyToSharedBy = new Notifications({
              user_email: order.order_shared_by,
              message: "You have Accepted The Order of " + ordered_by,
              title: "Order Accepted",
              notification_image: order.order_image,
            });

            await notifyToSharedBy.save();

            res.status(200).json({
              message: "Order accepted successfully",
              success: true,
              order,
            });
          } else {
            res.status(400);
            throw new Error("Insufficient quantity");
          }
        } else {
          res.status(400);
          throw new Error("Invalid food data");
        }
      } else {
        res.status(400);
        throw new Error("Order already accepted");
      }
    } else {
      res.status(400);
      throw new Error("Invalid order data");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

// @desc    reject order
// @route   POST /api/food/rejectorder
// @access  Public

export const rejectOrder = async (req, res) => {
  try {
    const { order_id, order_food_id, order_quantity, ordered_by } = req.body;

    const order = await Order.findById({ _id: order_id });
    if (order) {
      //check if order is pending
      if (order.order_status === "pending") {
        //update order status to rejected
        order.order_status = "rejected";
        order.is_active = false;
        order.save();

        //send a notification to ordered_by

        const notifyToOrderedBy = new Notifications({
          user_email: order.ordered_by,
          message: "Your order has been rejected",
          title: "Order Rejected",
          notification_image: order.order_image,
        });
        await notifyToOrderedBy.save();
        //send a notification to ordered_to
        const notifyToOrderedTo = new Notifications({
          user_email: order.order_shared_by,
          message: "You have rejected the order of " + ordered_by,
          title: "Order Rejected",
        });

        await notifyToOrderedTo.save();

        res.status(200).json({
          message: "Order rejected successfully",
          success: true,
          order,
        });
      } else {
        res.status(400);
        throw new Error("Order already " + order.order_status);
      }
    } else {
      res.status(400);
      throw new Error("Invalid order data");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

//get all pending requests by order shared by a user
export const getPendingRequests = async (req, res) => {
  try {
    //get all requests shared by whos status is pending or placed
    const order = await Order.find({
      order_shared_by: req.params.order_shared_by,
      $or: [{ order_status: "pending" }, { order_status: "placed" }],
    });

    if (order) {
      res.status(200).json({
        message: "Order found",
        success: true,
        order,
      });
    } else {
      res.status(400);
      throw new Error("Order not found");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

//get rejected requests by order shared by a user
export const getRejectedRequests = async (req, res) => {
  try {
    const order = await Order.find({
      order_shared_by: req.params.order_shared_by,
    });
    if (order) {
      res.status(200).json({
        message: "Order found",
        success: true,
        order,
      });
    } else {
      res.status(400);
      throw new Error("Order not found");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};
//cenceled order and revert food quantity
export const cancelOrder = async (req, res) => {
  try {
    const { order_id, order_food_id, order_quantity, order_shared_by } =
      req.body;

    const order = await Order.findById({ _id: order_id });
    if (order) {
      //check if order is pending
      if (order.order_status === "placed" || order.order_status === "pending") {
        //check if food quantity is sufficient
        const food = await Food.findById({ _id: order_food_id });
        if (food) {
          //add food quantity
          food.food_quantity = food.food_quantity + order_quantity;
          food.save();
          //update order status to placed
          order.order_status = "cancelled";
          order.is_active = false;
          order.save();

          //send a notification to ordered_by

          const notifyToOrderedBy = new Notifications({
            user_email: order.ordered_by,
            message: "Your order has been cancelled successfully",
            title: "Order Cancelled",
            notification_image: order.order_image,
          });
          await notifyToOrderedBy.save();

          //notify to order shared by
          const notifyToSharedBy = new Notifications({
            user_email: order.order_shared_by,
            message: "You have cancelled The Order of " + order_shared_by,
            title: "Order Cancelled",
            notification_image: order.order_image,
          });

          await notifyToSharedBy.save();

          res.status(200).json({
            message: "Order cancelled successfully",
            success: true,
            order,
          });
        } else {
          res.status(400);
          throw new Error("Invalid food data");
        }
      } else {
        if (order.order_status === "cancelled") {
          res.status(400);
          throw new Error("Order already cancelled");
        } else {
          res.status(400);
          throw new Error("Order cannot be cancelled");
        }
      }
    } else {
      res.status(400);
      throw new Error("Invalid order data");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

// order picked up
export const orderPickedUp = async (req, res) => {
  try {
    const { order_id, order_shared_by } = req.body;

    const order = await Order.findById({ _id: order_id });
    if (order) {
      //check if order is pending
      if (order.order_status === "placed") {
        //update order status to picked up
        order.is_pickup = true;
        order.is_active = false;
        order.save();
        console.log(order, "order picked up");
        //send a notification to ordered_by

        const notifyToOrderedBy = new Notifications({
          user_email: order.ordered_by,
          message: "Your order has been picked up",
          title: "Order Picked Up",
          notification_image: order.order_image,
        });
        await notifyToOrderedBy.save();
        //send a notification to ordered_to
        const notifyToOrderedTo = new Notifications({
          user_email: order.order_shared_by,
          message: "You have picked up the order of " + order_shared_by,
          title: "Order Picked Up",
        });

        await notifyToOrderedTo.save();

        res.status(200).json({
          message: "Order picked up successfully",
          success: true,
          order,
        });
      } else {
        res.status(400);
        throw new Error("Order already " + order.order_status);
      }
    } else {
      res.status(400);
      throw new Error("Invalid order data");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};
