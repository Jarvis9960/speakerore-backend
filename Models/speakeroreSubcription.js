import mongoose, { mongo } from "mongoose";

const subcriptionSchema = new mongoose.Schema(
 {
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
    },
    EndDate: {
      type: Date,
    },
    Active: {
      type: Boolean,
      default: false,
    },
    order_id: {
      type: String,
      unique: true,
      required: true,
    },
    tracking_id: {
      type: String,
    },
    bank_ref_no: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const subcriptionModel = mongoose.model("Subcription", subcriptionSchema);

export default subcriptionModel;
