import UserModel from "../Models/UserModel.js";
import Coupon from "../Models/speakeroreCoupon.js";

export const createCoupon = async (req, res) => {
  try {
    const { couponCode, subcriptionType, discount, expiryDate, maxUsage } =
      req.body;

    if (
      !couponCode ||
      !subcriptionType ||
      !discount ||
      !expiryDate ||
      !maxUsage
    ) {
      return res.status(422).json({
        status: false,
        message: "Please all the required field properly",
      });
    }

    const coupon_codeExists = await Coupon.findOne({ coupon_code: couponCode });

    if (coupon_codeExists) {
      return res.status(422).json({
        status: false,
        message: "Coupon code already exist please create a new code",
      });
    }

    const newCoupon = new Coupon({
      coupon_code: couponCode,
      subscription_type: subcriptionType,
      discount: discount,
      expiration_date: expiryDate,
      max_usages: maxUsage,
    });

    const savedResponse = await newCoupon.save();

    return res.status(201).json({
      status: true,
      message: "Coupon successfully created",
      savedResponse: savedResponse,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const createAffilateCoupon = async (req, res) => {
  try {
    const email = req.user.email;

    if (!email) {
      return res
        .status(422)
        .json({ status: false, message: "Logged user doesn't have email" });
    }

    const UserIsSubcribedorNot = await UserModel.findOne({ email: email });

    if (UserIsSubcribedorNot.subcription) {
      const createAffilateCoupon = new Coupon({
        coupon_code: UserIsSubcribedorNot.alphaUnqiueId,
        subscription_type: "Affilate",
        discount: 10,
        isActive: true,
        isAffilate: true,
      });

      const savedCoupon = await createAffilateCoupon.save();

      if (savedCoupon) {
        return res.status(201).json({
          status: true,
          message: "Affilate coupon successfully created",
        });
      }
    } else {
      const createAffilateCoupon = new Coupon({
        coupon_code: UserIsSubcribedorNot.alphaUnqiueId,
        subscription_type: "Affilate",
        discount: 5,
        isActive: true,
        isAffilate: true,
      });

      const savedCoupon = await createAffilateCoupon.save();

      if (savedCoupon) {
        return res.status(201).json({
          status: true,
          message: "Affilate coupon successfully created",
        });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getAllCoupon = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;

    const totalCount = await Coupon.find({}).countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const savedCoupon = await Coupon.find({})
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedCoupon.length < 1) {
      return res
        .status(404)
        .json({ status: false, message: "no coupons are present in database" });
    }

    return res.status(202).json({
      status: false,
      message: "successfully fetched coupons",
      savedCoupon: savedCoupon,
      totalPages: totalPages,
      CurrentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getCouponOfCurrentUserAffilate = async (req, res) => {
  try {
    const email = req.user.email;

    const existUser = await UserModel.findOne({ email: email });

    const affilateCoupon = await Coupon.findOne({
      coupon_code: existUser.alphaUnqiueId,
    });

    if (!affilateCoupon) {
      return res
        .status(404)
        .json({ status: true, message: "Affilate coupon did not created" });
    }

    return res.status(202).json({
      status: true,
      message: "Here your affilate coupon",
      affilateCoupon: affilateCoupon,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const applyCouponCode = async (req, res) => {
  try {
    const { couponCode, amount, subcriptionType } = req.query;

    if (!couponCode || !amount || !subcriptionType) {
      return res.status(422).json({
        status: false,
        message:
          "Please provide couponcode, amount and subcription type to check validation and give discount",
      });
    }

    const coupon_codeExists = await Coupon.findOne({ coupon_code: couponCode });

    if (!coupon_codeExists) {
      return res
        .status(422)
        .json({ status: false, message: "Code is not valid" });
    }

    const checkAffilateCoupon = await UserModel.findOne({
      alphaUnqiueId: coupon_codeExists.coupon_code,
    });

    if (checkAffilateCoupon) {
      
      const checkSubcription = await UserModel.findOne({
        alphaUnqiueId: coupon_codeExists.coupon_code,
      }).populate("subcription");

      if (checkSubcription.subcription.Active) {
        if (!coupon_codeExists.isActive) {
          return res
            .status(422)
            .json({ status: false, message: "Coupon code is not active" });
        }

        // Discount amount = Original price × (Discount percentage / 100)
        let calculateDiscountAmount =
          amount * (coupon_codeExists.discount / 100);

        // Final price = Original price - Discount amount = $100 - $20 = $80
        let finalPrice = amount - calculateDiscountAmount;

        return res.status(201).json({
          status: false,
          message: "successfully done coupon validation",
          finalPrice: finalPrice,
          discount: coupon_codeExists.discount,
          code: coupon_codeExists.coupon_code,
        });
      }
    } else {
      if (!coupon_codeExists.subscription_type.includes(subcriptionType)) {
        return res.status(422).json({
          status: false,
          message: `This code is valid for only ${coupon_codeExists.subscription_type} subscription`,
        });
      }

      const currentDate = new Date();

      if (currentDate > coupon_codeExists.expiration_date) {
        return res
          .status(422)
          .json({ status: false, message: "Coupon code is expired" });
      }

      if (coupon_codeExists.usage_count > coupon_codeExists.max_usages) {
        return res.status(422).json({
          status: false,
          message: "Coupon code has been used till its limit",
        });
      }

      if (!coupon_codeExists.isActive) {
        return res
          .status(422)
          .json({ status: false, message: "Coupon code is not active" });
      }

      // Discount amount = Original price × (Discount percentage / 100)
      let calculateDiscountAmount = amount * (coupon_codeExists.discount / 100);

      // Final price = Original price - Discount amount = $100 - $20 = $80
      let finalPrice = amount - calculateDiscountAmount;

      return res.status(201).json({
        status: true,
        message: "successfully done coupon validation",
        finalPrice: finalPrice,
        discount: coupon_codeExists.discount,
        code: coupon_codeExists.coupon_code,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getCouponBySearch = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;

    const totalCount = await Coupon.find({
      $or: [
        { coupon_code: { $regex: new RegExp(keyword, "i") } },
        { subscription_type: { $regex: new RegExp(keyword, "i") } },
      ],
    }).countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const queryResult = await Coupon.find({
      $or: [
        { coupon_code: { $regex: new RegExp(keyword, "i") } },
        { subscription_type: { $regex: new RegExp(keyword, "i") } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit);

    if (queryResult.length < 1) {
      return res.status(404).json({
        status: true,
        message: "No data present for given search query",
      });
    }

    return res.status(201).json({
      status: true,
      message: "successfully fetched query",
      queryResult: queryResult,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
