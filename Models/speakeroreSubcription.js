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
  order_id: {
    type: String,
    required: true,
  },
  tracking_id: {
    type: String,
    required: true,
  },
  bank_ref_no: {
    type: String,
    required: true,
  },
});

const subcriptionModel = mongoose.model("Subcription", subcriptionSchema);

export default subcriptionModel;
