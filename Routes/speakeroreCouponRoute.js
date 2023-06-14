import express from "express";
const router = express.Router();
import {
  createCoupon,
  getAllCoupon,
  applyCouponCode,
  getCouponBySearch,
  getCouponOfCurrentUserAffilate,
  createAffilateCoupon,
} from "../Controllers/speakerCouponController.js";
import {
  protectedRoute,
  protectedRouteOfAdmin,
} from "../Middlewares/protectedMiddleware.js";

router.post("/createcoupon", protectedRouteOfAdmin, createCoupon);

router.get("/getallcoupons", protectedRouteOfAdmin, getAllCoupon);

router.get("/applycouponcode", protectedRoute, applyCouponCode);

router.get("/getcouponbyquery", protectedRouteOfAdmin, getCouponBySearch);

router.get(
  "/getaffilatecoupon",
  protectedRoute,
  getCouponOfCurrentUserAffilate
);

router.post("/createaffilatecoupon", protectedRoute, createAffilateCoupon);

export default router;
