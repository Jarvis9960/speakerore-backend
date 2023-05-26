import speakeroreCategoryModel from "../Models/speakeroreCategory.js";

export const createSpeakeroreCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        status: false,
        message: "Admin are allowed to add categories",
      });
    }

    const { icon, category } = req.body;

    if (!icon || !category) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const newCategory = new speakeroreCategoryModel({
      Icon: icon,
      CategoryName: category,
    });

    const savedResponse = await newCategory.save();

    if (savedResponse) {
      return res.status(201).json({
        status: true,
        message: "category created successfully",
        savedResponse,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getAllCategoryList = async (req, res) => {
  try {
    const savedCategoryList = await speakeroreCategoryModel.find({});

    if (savedCategoryList.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: "No category are listed in database" });
    }

    return res.status(202).json({
      status: true,
      message: "your category list are successfully fetched",
      categorylist: savedCategoryList,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const updateCategoryList = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        status: false,
        message: "Admin can only update category list",
      });
    }

    const { categoryId, icon, category } = req.body;

    if (!categoryId) {
      return res.status(422).json({
        status: false,
        message: "Please provide category id to update",
      });
    }

    if (!icon || !category) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const updatedResponse = await speakeroreCategoryModel.updateOne(
      { _id: categoryId },
      { $set: { Icon: icon, CategoryName: category } }
    );

    if (updatedResponse.acknowledged) {
      return res
        .status(201)
        .json({ status: true, message: "Category updated successfully" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const deleteCategories = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        status: false,
        message: "Admin can only update category list",
      });
    }

    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(422).json({
        status: false,
        message: "Please provide category id to delete",
      });
    }

    const deleteCategory = await speakeroreCategoryModel.deleteOne({
      _id: categoryId,
    });

    if (deleteCategory.acknowledged) {
      return res
        .status(201)
        .json({ status: true, message: "category deleted successfully" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
