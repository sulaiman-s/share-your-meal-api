import Food from "../models/Food.js";
import Review from "../models/Reviews.js";
import User from "../models/Users.js";

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private

export const createReview = async (req, res) => {
  const { review, rating, user_email, ratedBy_email, order, food } = req.body;

  //get user id and rated by id
  const user = await User.findOne({ email: user_email });
  const ratedBy = await User.findOne({ email: ratedBy_email });

  //check with id if same user has reveiwed same food

  const checkReview = await Review.findOne({
    user: user,
    ratedBy: ratedBy,
    food: food,
  });

  if (checkReview) {
    res.status(400).json({
      message: "You have already reviewed this food",
      success: false,
    });

    return;
  }

  try {
    //create review
    const newReview = await Review.create({
      review,
      rating,
      user: user._id,
      user_email,
      ratedBy: ratedBy._id,
      ratedBy_email,
      food,
      order,
      ratedBy_avatar: ratedBy.user_avatar,
    });
    if (newReview) {
      //get average of all reviews of food shared by and update it on every food shared by that user
      const reviews = await Review.find({ user_email: user_email });
      if (reviews) {
        let total = 0;
        let average = 0;
        let count = 0;
        reviews.forEach((review) => {
          total += review.rating;
          count++;
        });
        average = total / count;

        //update all food_rating shared by this user
        const updatedFood = await Food.updateMany(
          { food_shared_by: user_email },
          { $set: { food_rating: average } }
        );

        if (updatedFood) {
          res.status(200).json({
            message: "Review added successfully",
            success: true,
            review: newReview,
          });
        }
      }
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

export const getReviewsByUser = async (req, res) => {
  const user_email = req.params.user;
  console.log(user_email);

  //get user id
  const user = await User.findOne({ email: user_email });

  try {
    const reviews = await Review.find({ user: user });

    if (reviews) {
      //take out average and send
      let total = 0;
      let average = 0;
      let count = 0;
      reviews.forEach((review) => {
        total += review.rating;
        count++;
      });

      average = total / count;
      res.status(200).json({
        reviews,
        average,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

export const getReviewsByRatedBy = async (req, res) => {
  const ratedBy_email = req.params.ratedBy;
  console.log(ratedBy_email);

  //get user id
  const ratedBy = await User.findOne({ email: ratedBy_email });

  try {
    const reviews = await Review.find({ ratedBy: ratedBy });
    if (reviews) {
      res.status(200).json({ reviews });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

//get reviews of ordered food
export const getReviewsByFood = async (req, res) => {
  const food_id = req.params.food;
  console.log(food_id);

  try {
    const reviews = await Review.find({ food: food_id });
    if (reviews) {
      res.status(200).json({ reviews });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};
