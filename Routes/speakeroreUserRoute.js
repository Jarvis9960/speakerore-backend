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
import { protectedRoute } from "../Middlewares/protectedMiddleware.js";

router.get("/getallregularuser", protectedRoute, getAllRegularUser);
router.get("/getallteammembers", protectedRoute, getAllTeamMembers);
router.patch("/makeusertoteammember", protectedRoute, makeUserToTeamMember);
router.patch("/maketeammembertouser", protectedRoute, makeRegularUser);
router.patch("/maketeammembertoadmin", protectedRoute, makeTeamMemberToAdmin);
router.patch("/blockregularuser", protectedRoute, blockRegularUser);

export default router;
