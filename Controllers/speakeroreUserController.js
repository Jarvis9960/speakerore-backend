import UserModel from "../Models/UserModel";

export const getAllRegularUser = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;

    const totalCount = await UserModel.find({
      role: "Regular-user",
    }).countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const savedUser = await UserModel.find({ role: "Regular-user" })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedUser.length < 1) {
      return res
        .status(404)
        .json({ status: false, message: "No User are present in database" });
    }

    return res.status(202).json({
      status: false,
      message: "successfully fetched regular user",
      savedUser: savedUser,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getAllTeamMembers = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;

    const totalCount = await UserModel.find({
      role: "Team-members",
    }).countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const savedTeamMember = await UserModel.find({ role: "Team-members" })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedTeamMember.length < 1) {
      return res.status(404).json({
        status: true,
        message: "No Team members are present in database",
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched team member",
      savedTeamMember: savedTeamMember,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
