import mongoose from "mongoose";

const FavouritesSchema = new mongoose.Schema({
  food_id: {
    type: String,
    required: true,
    trim: true,
  },
  favourite_of: {
    type: String,
    required: true,
    trim: true,
  },
});

const Favourites = mongoose.model("Favourites", FavouritesSchema);
