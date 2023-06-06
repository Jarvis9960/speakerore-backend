import UserModel from "../Models/UserModel.js";

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

export const makeUserToTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(422).json({
        status: false,
        message: "No userid is giving to make team member",
      });
    }

    const userExists = await UserModel.findOne({ _id: userId });

    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "no such user is present in database",
      });
    }

    const updateUserToMemberResponse = await UserModel.updateOne(
      { _id: userId },
      { $set: { role: "Team-member" } }
    );

    if (updateUserToMemberResponse.acknowledged) {
      return res.status(201).json({
        status: true,
        message: "User have successfully made a team member",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const makeRegularUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(422).json({
        status: false,
        message: "team member id is not given to make user",
      });
    }

    const userExists = await UserModel.findOne({ _id: userId });

    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "no such user is present in database",
      });
    }

    const updateTeamMemberToUser = await UserModel.updateOne(
      { _id: userId },
      { $set: { role: "Regular-user" } }
    );

    if (updateTeamMemberToUser.acknowledged) {
      return res.status(201).json({
        status: true,
        message: "Team member has been made regular user successfully",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const makeTeamMemberToAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(422).json({
        status: false,
        message: "team member id is not given to make admin",
      });
    }

    const userExists = await UserModel.findOne({ _id: userId });

    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "no such user is present in database",
      });
    }

    const updateToAdminResponse = await UserModel.updateOne(
      { _id: userId },
      { $set: { role: "admin" } }
    );

    if (updateToAdminResponse.acknowledged) {
      return res
        .status(201)
        .json({ status: true, message: "team member has now became admin" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const blockRegularUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(422)
        .json({ status: false, message: "no user id is given to block" });
    }

    const isUserExists = await UserModel.findOne({ _id: userId });

    if (!isUserExists) {
      return res
        .status(404)
        .json({ status: false, message: "there no such user to block" });
    }

    const blockedUserResponse = await UserModel.updateOne(
      { _id: userId },
      { $set: { blocked: true } }
    );

    if (blockedUserResponse.acknowledged) {
      return res.status(201).json({ status: true, message: "user is blocked" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getProfileForCurrentUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const savedUser = await UserModel.findById(currentUserId)
      .select("-googleId", "-blocked")
      .populate("subcription");

    if (!savedUser) {
      return res.status(422).json({ status: false, message: "Invalid Id" });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched single user profile",
      response: savedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getUserBySearch = async (req, res) => {
  try {
    const { keyword } = req.query;
    const page = req.query.page || 1;
    const limit = 9;

    if (!keyword) {
      return res
        .status(422)
        .json({ status: false, message: "No keyword is provided to query" });
    }

    const totalCount = await UserModel.find({
      $and: [
        {
          $or: [
            { alphaUnqiueId: { $regex: new RegExp(keyword, "i") } },
            { first_name: { $regex: new RegExp(keyword, "i") } },
            { last_name: { $regex: new RegExp(keyword, "i") } },
            { email: { $regex: new RegExp(keyword, "i") } },
          ],
        },
        { role: { $ne: "admin" } },
        { role: { $ne: "Team-member" } },
      ],
    }).countDocuments();
    const totalPage = Math.ceil(totalCount / limit);

    const queryResult = await UserModel.find({
      $and: [
        {
          $or: [
            { alphaUnqiueId: { $regex: new RegExp(keyword, "i") } },
            { first_name: { $regex: new RegExp(keyword, "i") } },
            { last_name: { $regex: new RegExp(keyword, "i") } },
            { email: { $regex: new RegExp(keyword, "i") } },
          ],
        },
        { role: { $ne: "admin" } },
        { role: { $ne: "Team-member" } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit);

    if (queryResult.length < 1) {
      return res.status(404).json({
        status: true,
        message: "NO data is present with given query keyword",
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfully query data",
      queryResult: queryResult,
      totalPage: totalPage,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getTeamMemberBySearch = async (req, res) => {
  try {
    const { keyword } = req.query;
    const page = req.query.page || 1;
    const limit = 9;

    if (!keyword) {
      return res
        .status(422)
        .json({ status: false, message: "No keyword is provided to query" });
    }

    const totalCount = await UserModel.find({
      $and: [
        {
          $or: [
            { alphaUnqiueId: { $regex: new RegExp(keyword, "i") } },
            { first_name: { $regex: new RegExp(keyword, "i") } },
            { last_name: { $regex: new RegExp(keyword, "i") } },
            { email: { $regex: new RegExp(keyword, "i") } },
          ],
        },
        { role: { $ne: "admin" } },
        { role: { $ne: "Regular-user" } },
      ],
    }).countDocuments();
    const totalPage = Math.ceil(totalCount / limit);

    const queryResult = await UserModel.find({
      $and: [
        {
          $or: [
            { alphaUnqiueId: { $regex: new RegExp(keyword, "i") } },
            { first_name: { $regex: new RegExp(keyword, "i") } },
            { last_name: { $regex: new RegExp(keyword, "i") } },
            { email: { $regex: new RegExp(keyword, "i") } },
          ],
        },
        { role: { $ne: "admin" } },
        { role: { $ne: "Regular-user" } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit);

    if (queryResult.length < 1) {
      return res.status(404).json({
        status: true,
        message: "NO data is present with given query keyword",
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfully query data",
      queryResult: queryResult,
      totalPage: totalPage,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};


export const getAdminBySearch = async (req, res) => {
  try {
    const { keyword } = req.query;
    const page = req.query.page || 1;
    const limit = 9;

    if (!keyword) {
      return res
        .status(422)
        .json({ status: false, message: "No keyword is provided to query" });
    }

    const totalCount = await UserModel.find({
      $and: [
        {
          $or: [
            { alphaUnqiueId: { $regex: new RegExp(keyword, "i") } },
            { first_name: { $regex: new RegExp(keyword, "i") } },
            { last_name: { $regex: new RegExp(keyword, "i") } },
            { email: { $regex: new RegExp(keyword, "i") } },
          ],
        },
        { role: { $ne: "Team-member" } },
        { role: { $ne: "Regular-user" } },
      ],
    }).countDocuments();
    const totalPage = Math.ceil(totalCount / limit);

    const queryResult = await UserModel.find({
      $and: [
        {
          $or: [
            { alphaUnqiueId: { $regex: new RegExp(keyword, "i") } },
            { first_name: { $regex: new RegExp(keyword, "i") } },
            { last_name: { $regex: new RegExp(keyword, "i") } },
            { email: { $regex: new RegExp(keyword, "i") } },
          ],
        },
        { role: { $ne: "Team-member" } },
        { role: { $ne: "Regular-user" } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit);

    if (queryResult.length < 1) {
      return res.status(404).json({
        status: true,
        message: "NO data is present with given query keyword",
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfully query data",
      queryResult: queryResult,
      totalPage: totalPage,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
}
 
