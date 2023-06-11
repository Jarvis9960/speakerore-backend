import express from "express";
const router = express.Router();
import {
  blockRegularUser,
  getAdminBySearch,
  getAllRegularUser,
  getAllTeamMembers,
  getProfileForCurrentUser,
  getTeamMemberBySearch,
  getUserBySearch,
  makeRegularUser,
  makeTeamMemberToAdmin,
  makeUserToTeamMember,
  unBlockRegularUser,
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
router.patch("/unblockregularuser", protectedRouteOfAdmin, unBlockRegularUser);
router.get("/getuserbysearch", protectedRouteOfAdmin, getUserBySearch);
router.get("/getteammemberbysearch", protectedRouteOfAdmin, getTeamMemberBySearch);
router.get("/getadminbysearch", protectedRouteOfAdmin, getAdminBySearch);


// getting profile for current user
router.get("/getprofile", protectedRoute, getProfileForCurrentUser);

export default router;
