import mongoose from "mongoose";

const dbConnection = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: process.env.DB_NAME,
    };
    await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log("Connected to database successfully");
  } catch (error) {
    console.log(error);
    throw new Error("Error connecting to database");
  }
};

export default dbConnection;
