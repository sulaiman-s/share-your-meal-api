import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  order_name: {
    type: String,
    required: true,
    trim: true,
  },

  order_food_id: {
    type: String,
    required: true,
    trim: true,
  },

  order_description: {
    type: String,
    required: true,
    trim: true,
  },
  order_price: {
    type: Number,
    required: true,
    trim: true,
  },
  order_image: {
    type: String,
    required: true,
    trim: true,
  },
  order_category: {
    type: String,
    required: true,
    trim: true,
  },
  order_quantity: {
    type: Number,
    required: true,
    trim: true,
  },

  order_price: {
    type: Number,
    required: true,
    trim: true,
  },

  order_shared_by: {
    type: String,
    required: true,
    trim: true,
  },
  order_location: {
    type: String,
    required: true,
    trim: true,
  },
  is_free: {
    type: Boolean,
    required: true,
    trim: true,
  },
  is_active: {
    type: Boolean,
    required: true,
    trim: true,
  },
  is_pickup: {
    type: Boolean,
    required: true,
    trim: true,
  },
  order_status: {
    type: String,
    required: true,
    trim: true,
  },

  ordered_by: {
    type: String,
    required: true,
    trim: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
