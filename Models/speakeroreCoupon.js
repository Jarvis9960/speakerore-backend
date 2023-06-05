import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  coupon_code: {
    type: String,
    required: true,
  },
  subscription_type: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  expiration_date: {
    type: Date,
    required: true,
  },
  usage_count: {
    type: Number,
    default: 0,
  },
  max_usages: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
