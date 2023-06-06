import express from "express";
const router = express.Router();
import {
  facebookAuth,
  facebookAuthCallback,
  facebookRedirectCallback,
} from "../Controllers/facebookAuthController.js";
import { protectedRoute } from "../Middlewares/protectedMiddleware.js";


router.get("/auth/facebook", facebookAuth);


router.get("/auth/facebook/callback", facebookAuthCallback, facebookRedirectCallback);


export default router;