import express from "express";
const router = express.Router();
import { createCoupon, getAllCoupon, applyCouponCode, getCouponBySearch } from "../Controllers/speakerCouponController.js";
import { protectedRoute, protectedRouteOfAdmin } from "../Middlewares/protectedMiddleware.js"


router.post("/createcoupon", protectedRouteOfAdmin, createCoupon);

router.get("/getallcoupons", protectedRouteOfAdmin, getAllCoupon);

router.get("/applycouponcode", protectedRoute, applyCouponCode);

router.get("/getcouponbyquery", protectedRouteOfAdmin, getCouponBySearch);


export default router;