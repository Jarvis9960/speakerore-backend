import express from "express";
const router = express.Router();
import {
  createSpeakeroreCategory,
  getAllCategoryList,
  updateCategoryList,
  deleteCategories,
} from "../Controllers/speakeroreCategoryController.js";
import { protectedRoute } from "../Middlewares/protectedMiddleware.js"


router.post("/createcategory", protectedRoute, createSpeakeroreCategory);
router.get("/getcategories", getAllCategoryList);
router.put("/updatecategory", protectedRoute, updateCategoryList);
router.delete("/deletecategory", protectedRoute, deleteCategories);


export default router;
