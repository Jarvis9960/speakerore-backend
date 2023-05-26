import mongoose from "mongoose";

const speakeroreCategorySchema = new mongoose.Schema({
  Icon: {
    type: String,
    required: true,
  },
  CategoryName: {
    type: String,
    required: true,
  },
});

const speakeroreCategoryModel = mongoose.model(
  "speakerorecategory",
  speakeroreCategorySchema
);

export default speakeroreCategoryModel;
