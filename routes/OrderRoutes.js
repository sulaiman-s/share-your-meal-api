// Create User Routes
import express from "express";
import {
  orderFood,
  getOrderedFood,
  acceptOrder,
  rejectOrder,
  getPendingRequests,
  getRejectedRequests,
  cancelOrder,
  orderPickedUp,
} from "../controllers/OrderController.js";
const router = express.Router();

// PUBLIC ROUTES
// @desc    Add a new food
// @route   POST /api/food/add
// @access  Public

router.route("/orderfood").post(orderFood);

// @desc    Get all food
// @route   GET /api/food/get
// @access  Public

router.route("/getorderedfood/:ordered_by").get(getOrderedFood);

// @desc    accept order
// @route   PUT /api/food/acceptorder
// @access  Public

router.route("/acceptorder").put(acceptOrder);

// @desc    reject order

// @route   PUT /api/food/rejectorder

// @access  Public

router.route("/rejectorder").put(rejectOrder);

// @desc    cancel order

// @route   PUT /api/food/cancelorder

// @access  Public

router.route("/cancelorder").put(cancelOrder);

// @desc    order picked up

// @route   PUT /api/food/orderpickedup

// @access  Public

router.route("/orderpickedup").put(orderPickedUp);

// @desc    Get all pending requests
// @route   GET /api/food/getpendingrequests

// @access  Public

router.route("/getpendingrequests/:order_shared_by").get(getPendingRequests);

// @desc    Get all rejected requests

// @route   GET /api/food/getrejectedrequests

// @access  Public

router.route("/getrejectedrequests/:order_shared_by").get(getRejectedRequests);

export default router;
