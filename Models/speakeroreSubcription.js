import mongoose, { mongo } from "mongoose";

const subcriptionSchema = new mongoose.Schema({
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  Subcription_Type: {
    type: String,
    required: true,
  },
  StartDate: {
    type: Date,
    required: true,
  },
  EndDate: {
    type: Date,
    required: true,
  },
  Active: {
    type: Boolean,
    default: false,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },
});

const subcriptionModel = mongoose.model("Subcription", subcriptionSchema);

export default subcriptionModel;
