import express from "express";
const router = express.Router();
import {
  blockRegularUser,
  getAllRegularUser,
  getAllTeamMembers,
  makeRegularUser,
  makeTeamMemberToAdmin,
  makeUserToTeamMember,
} from "../Controllers/speakeroreUserController.js";
import {
  protectedRoute,
  protectedRouteOfAdmin,
} from "../Middlewares/protectedMiddleware.js";

// getting all user for admin
router.get("/getallregularuser", protectedRouteOfAdmin, getAllRegularUser);
router.get("/getallteammembers", protectedRouteOfAdmin, getAllTeamMembers);
router.patch(
  "/makeusertoteammember",
  protectedRouteOfAdmin,
  makeUserToTeamMember
);
router.patch("/maketeammembertouser", protectedRouteOfAdmin, makeRegularUser);
router.patch(
  "/maketeammembertoadmin",
  protectedRouteOfAdmin,
  makeTeamMemberToAdmin
);
router.patch("/blockregularuser", protectedRouteOfAdmin, blockRegularUser);


// getting profile for current user
router.get("/getprofile", protectedRoute)

export default router;
