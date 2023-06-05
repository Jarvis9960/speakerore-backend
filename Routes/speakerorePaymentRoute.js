import express from "express";
const router = express.Router();
import {
  paymentVerification,
  checkout,
} from "../Controllers/speakerorePaymentController.js";
import { protectedRoute } from "../Middlewares/protectedMiddleware.js";

router.post("/create/order", protectedRoute, checkout);
router.post("/payment/verify", protectedRoute, paymentVerification);

export default router;
