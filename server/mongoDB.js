import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("====== Database Connected ======");
    console.log("Welcome champ, Enjoy your learning process");
  } catch (error) {
    console.log(error);
  }
};
