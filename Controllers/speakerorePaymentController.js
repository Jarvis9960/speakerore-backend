import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname } from "path";
import subcriptionModel from "../Models/speakeroreSubcription.js";
import UserModel from "../Models/UserModel.js";
let fileName = fileURLToPath(import.meta.url);
let __dirname = dirname(fileName);
let breakIndex = __dirname.lastIndexOf("\\") + 1;
let result = __dirname.substring(0, breakIndex);

dotenv.config({ path: `${result}config.env` });

let instance = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});

export const checkout = async (req, res) => {
  try {
    const { amount, subcriptionType, couponCode } = req.body;

    const options = {
      amount: 100, // amount in the smallest currency unit
      currency: "INR",
      notes: {
        subcriptionType: subcriptionType,
        couponCode: couponCode,
      },
    };

    const order = await instance.orders.create(options);

    if (order) {
      return res
        .status(201)
        .json({ status: true, message: "order created", order });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { subscriptionType, couponCode } = req.query;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    let body = razorpay_order_id + "|" + razorpay_payment_id;

    var expectedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const verifyPayment = expectedSignature === razorpay_signature;

    if (verifyPayment) {
      // Subcription saved here

      const startDate = new Date();
      let endDate = new Date(startDate);

      // Calculate the start and end dates for different subscription durations
      if (subscriptionType === "Quaterly") {
        endDate.setMonth(startDate.getMonth() + 3);
      } else if (subscriptionType === "Half Yearly") {
        endDate.setMonth(startDate.getMonth() + 6);
      } else if (subscriptionType === "Yearly") {
        endDate.setMonth(startDate.getMonth() + 12);
      }

      const newSubcription = new subcriptionModel({
        User: req.user._id,
        Subcription_Type: subscriptionType,
        StartDate: startDate,
        EndDate: endDate,
        Active: true,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        razorpay_signature: razorpay_signature,
      });

      const savedSubcription = await newSubcription.save();

      if (savedSubcription) {
        let updateUserMode = await UserModel.updateOne(
          { _id: req.user._id },
          { $set: { subcription: savedSubcription._id } }
        );

        if(updateUserMode.acknowledged){
            res.status(201).json({status: true, message: "Payment Done"})
        }
      }
    } else {
      res.status(422).json({ status: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
