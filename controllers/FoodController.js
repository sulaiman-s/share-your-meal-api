// Create User Controller
import Food from "../models/Food.js";
import User from "../models/Users.js";
import Users from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// @desc    Add a new food
// @route   POST http://localhost:8000/api/food/add
// @access  Public
export const addFood = async (req, res) => {
  const {
    food_name,
    food_description,
    food_price,
    food_image,
    food_category,
    food_quantity,
    food_shared_by,
    is_free,
    food_location,
    phone_number,
  } = req.body;
  try {
    const user = await Users.findOne({ email: req.body.food_shared_by });

    //check if the user has location name
    if (user.location_name.length === 0) {
      res.status(400);
      throw new Error("Please update your location");
    }

    const food = await Food.create({
      food_name,
      food_description,
      food_price,
      food_image,
      food_category,
      food_quantity,
      food_shared_by,
      is_free,
      is_active: true,
      is_deleted: false,
      food_location: user.location_name
        ? user.location_name
        : "Unknown Address",
      phone_number,
      food_shared_by_avatar: user.user_avatar,
    });

    if (food) {
      res.status(200).json({
        message: "Food added successfully",
        success: true,
        food: {
          id: food._id,
          food_name: food.food_name,
          food_description: food.food_description,
          food_price: food.food_price,
          food_image: food.food_image,
          food_category: food.food_category,
          food_quantity: food.food_quantity,
          food_shared_by: food.food_shared_by,
          is_free: food.is_free,
          is_active: food.is_active,
          is_available: food.is_available,
          food_location: food.food_location,
          phone_number: food.phone_number,
          food_shared_by_avatar: food.food_shared_by_avatar,
        },
      });
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

// @desc    Get all food
// @route   GET http://localhost:8080/api/food/getall
// @access  Public
export const getAllFood = async (req, res) => {
  //return all foods that are not deleted

  try {
    const food = await Food.find({ is_deleted: false });
    if (food) {
      res.status(200).json({
        message: "All food fetched successfully",
        success: true,
        food: food,
      });
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

// @desc    delete food
// @route   DELETE http://localhost:8000/api/food/delete
// @access  Public
export const deleteFood = async (req, res) => {
  //set is deleted to true where id = req.params.id

  console.log(req.params._id);
  try {
    const food = await Food.findById(req.params._id);
    if (food) {
      food.is_deleted = true;
      food.save();
      res.status(200).json({
        message: "Food deleted successfully",
        success: true,
        food: food,
      });
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

// @desc    Update a food
// @route   PUT http://localhost:8000/api/food/update
// @access  Public
export const updateFood = async (req, res) => {
  const {
    _id,
    food_name,
    food_description,
    food_price,
    food_image,
    food_category,
    food_quantity,
    food_shared_by,
    is_free,
    phone_number,
  } = req.body;
  try {
    const food = await Food.findById(_id);
    if (food) {
      food.food_name = food_name;
      food.food_description = food_description;
      food.food_price = food_price;
      food.food_image = food_image;
      food.food_category = food_category;
      food.food_quantity = food_quantity;
      food.food_shared_by = food_shared_by;
      food.is_free = is_free;
      food.is_active = true;
      food.is_deleted = false;
      food.phone_number = phone_number;
      food.save();
      res.status(200).json({
        message: "Food updated successfully",
        success: true,
        food: food,
      });
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

// @desc    getfoodbysharedby
// @route   GET http://localhost:8000/api/food/getfoodbysharedby
// @access  Public

//@desc getfoodbysharedby
// @route   GET /api/food/getfoodbysharedby
// @access  Public
export const getFoodBySharedBy = async (req, res) => {
  const { food_shared_by } = req.params;
  try {
    //return all foods shared by a particular user where is_deleted = false
    const food = await Food.find({
      food_shared_by: food_shared_by,
      is_deleted: false,
    });

    //if food is an empty array, then no food is shared by the user
    if (food) {
      res.status(200).json({
        message: "Food fetched successfully",
        success: true,
        food: food,
      });
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

// @desc    getfoodbytype
// @route   GET http://localhost:8000/api/food/getfoodbytype
// @access  Public
export const getFoodByType = async (req, res) => {
  const { is_free } = req.params;
  try {
    const food = await Food.find({
      is_free: is_free,
      is_deleted: false,
      is_active: true,
      food_quantity: { $gt: 0 },
    });
    if (food) {
      res.status(200).json({
        message: "Food fetched successfully",
        success: true,
        food: food,
      });
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

// @desc    getfoodbyquantityandisfree
// @route   GET http://localhost:8000/api/food/getfoodforcharitableorganization
// @access  Public
export const getFoodForCharitableOrganization = async (req, res) => {
  const { food_quantity, is_free } = req.params;
  try {
    //get all foods whose quantity is greater then or equal to food_quantity and is_free is true
    const food = await Food.find({
      food_quantity: { $gte: food_quantity },
      is_free: is_free,
    });
    if (food) {
      res.status(200).json({
        message: "Food fetched successfully",
        success: true,
        food: food,
      });
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

//Search foods by name like
// @desc    searchfoodbyname

// @route   GET http://localhost:8000/api/food/searchfoodbyname
// @access  Public
export const searchFoodByName = async (req, res) => {
  const { food_name, is_free } = req.params;
  try {
    const food = await Food.find({
      food_name: { $regex: food_name, $options: "i" },
      is_deleted: false,
      is_active: true,
      is_free: is_free,
    });
    if (food) {
      res.status(200).json({
        message: "Food fetched successfully",
        success: true,
        food: food,
      });
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
//get food by filter (category, food_quantity, rating, price)
// @desc    getfoodbyfilter
// @route   GET http://localhost:8000/api/food/getfoodbyfilter
// @access  Public
export const getFoodByFilter = async (req, res) => {
  const { food_category, food_quantity, food_price, food_rating, is_free } =
    req.params;
  try {
    let filter = {
      is_deleted: false,
      is_active: true,
      is_free: is_free,
    };

    if (food_category !== "all") {
      filter.food_category = food_category;
    }
    if (food_price !== "0") {
      filter.food_price = { $lte: food_price };
    }
    if (food_rating !== "0") {
      filter.food_rating = { $gte: food_rating };
    }
    if (food_quantity !== "0") {
      filter.food_quantity = { $gte: food_quantity };
    }

    console.log(filter);
    const food = await Food.find(filter);

    if (food) {
      res.status(200).json({
        message: "Food fetched successfully",
        success: true,
        food: food,
      });
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

//Order Food
// @desc    orderfood
// @route   POST http://localhost:8000/api/food/orderfood
// @access  Public
