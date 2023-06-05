import subcriptionModel from "../Models/speakeroreSubcription.js";
import UserModel from "../Models/UserModel.js";

export const checkSubcription = async (req, res, next) => {
  try {
    if (req.user.role === "admin" || req.user.role === "Team-member") {
      next();
    } else {
      const loggedUser = await UserModel.findOne({
        _id: req.user._id,
      }).populate("subcription");

      if (!loggedUser.subcription) {
        return res.status(401).json({
          status: false,
          message: "User is not subcribed to view this page",
        });
      }

      const checkSubcriptionIsActive = await subcriptionModel.findOne({
        _id: loggedUser.subcription,
      });

      if (!checkSubcriptionIsActive) {
        return res.status(401).json({
          status: false,
          message: "User is not subcribed to view this page",
        });
      }

      let currentDate = new Date();
      if (checkSubcriptionIsActive.EndDate > currentDate) {
        const updateSubcription = await subcriptionModel.updateOne(
          { _id: loggedUser.subcription },
          { $set: { Active: false } }
        );

        return res.status(401).json({
          status: false,
          message: "User Subcription is ended. Please renew your subcription",
        });
      }

      if (checkSubcriptionIsActive.Active) {
        next();
      } else {
        return res.status(401).json({
          status: false,
          message: "User Subcription is ended. Please renew your subcription",
        });
      }
    }
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "User is not subcribed to view this page",
      err: error,
    });
  }
};
