import UserModel from "../Models/UserModel.js";

export const protectedRoute = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const currentUserId = req.user._id;

    const savedUserModel = await UserModel.findById(currentUserId);

    if (!savedUserModel) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    if (savedUserModel.blocked) {
      return res.status(401).json({
        status: false,
        message: "User is blocked cannot access this website",
      });
    } else {
      return next();
    }
  }

  res.status(401).json({ error: "Unauthorized user please login first" });
};

export const protectedRouteOfTeamMember = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const currentUserId = req.user._id;

    const savedUser = await UserModel.findById(currentUserId);

    if (!savedUser) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    if (savedUser.role === "Team-member" || savedUser.role === "admin") {
      return next();
    } else {
      res.status(401).json({ error: "Only team-member can access this page" });
    }
  }

  return res
    .status(401)
    .json({ status: false, message: "Unauthorized user please login first" });
};

export const protectedRouteOfAdmin = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const currentUserId = req.user._id;

    const savedUser = await UserModel.findById(currentUserId);

    if (!savedUser) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    if (savedUser.role === "admin") {
      return next();
    } else {
      res.status(401).json({ error: "Only team-member can access this page" });
    }
  }

  return res
    .status(401)
    .json({ status: false, message: "Unauthorized user please login first" });
};
