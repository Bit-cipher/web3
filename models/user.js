import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
  },
  privateKey: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
