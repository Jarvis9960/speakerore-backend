import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  alphaUnqiueId: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
  googleId: {
    type: String,
  },
  role: {
    type: String,
    default: "Regular-user",
  },
  blocked: {
    type: Boolean,
    default: false,
  },
});

const UserModel = mongoose.model("user", UserSchema);

export default UserModel;
