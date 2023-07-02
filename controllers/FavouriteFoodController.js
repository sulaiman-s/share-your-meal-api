import User from "../models/Users";
import Food from "../models/Food";
import FavouriteFood from "../models/Favourites";

// @desc    add food to favourite
// @route   POST /api/food/favourite
// @access  Public

export const addFavouriteFood = async (req, res) => {
  const { food_id, favourite_of } = req.body;
  try {
    const food = await Food.findById({ _id: food_id });
    if (food) {
      FavouriteFood.Create({
        food_id: food_id,
        favourite_of: favourite_of,
      });
      res.status(200).json({
        message: "Food added to favourites",
        success: true,
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

// @desc    remove food from favourite
// @route   POST /api/food/unfavourite
// @access  Public

export const removeFavouriteFood = async (req, res) => {
  const { food_id, favourite_of } = req.body;
  try {
    const favouriteFood = await findById({ _id: food_id });
    if (favouriteFood) {
      FavouriteFood.findByIdAndDelete({ _id: food_id });
      res.status(200).json({
        message: "Food removed from favourites",
        success: true,
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

// @desc    Get all favourite food by user

// @route   GET /api/food/favourite/:favourite_of

// @access  Public

export const getFavouriteFoodByUser = async (req, res) => {
  try {
    const { favourite_of } = req.params;
    const favouriteFood = await FavouriteFood.find({
      favourite_of: favourite_of,
    });
    if (favouriteFood) {
      res.status(200).json({
        message: "Favourite food fetched successfully",
        success: true,
        favouriteFood,
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
