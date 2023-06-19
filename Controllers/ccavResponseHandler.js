import { decrypt } from "./ccavutil.js";
import qs from "querystring";
import crypto from "crypto";
import Coupon from "../Models/speakeroreCoupon.js";
import subcriptionModel from "../Models/speakeroreSubcription.js";
import UserModel from "../Models/UserModel.js";

export const postRes = async function (req, res) {
  var ccavEncResponse = "",
    ccavResponse = "",
    workingKey = "4B15E8BCD619A91BB671A1A953AC8119", //Put in the 32-Bit key shared by CCAvenues.
    ccavPOST = "";

  //Generate Md5 hash for the key and then convert in base64 string
  var md5 = crypto.createHash("md5").update(workingKey).digest();
  var keyBase64 = Buffer.from(md5).toString("base64");

  //Initializing Vector and then convert in base64 string
  var ivBase64 = Buffer.from([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString("base64");

  ccavEncResponse = req.body.encResp;
  // ccavPOST = qs.parse(ccavEncResponse);
  // var encryption = ccavPOST.encResp;
  ccavResponse = decrypt(ccavEncResponse, keyBase64, ivBase64);

  const data = {};
  ccavResponse.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    data[key] = value;
  });

  if (data.order_status === "Success") {
    const startDate = new Date();
    let endDate = new Date(startDate);

    // Calculate the start and end dates for different subscription durations
    if (data.merchant_param1 === "Quaterly") {
      endDate.setMonth(startDate.getMonth() + 3);
    } else if (data.merchant_param1 === "Half Yearly") {
      endDate.setMonth(startDate.getMonth() + 6);
    } else if (data.merchant_param1 === "Yearly") {
      endDate.setMonth(startDate.getMonth() + 12);
    }

    if (data.merchant_param2 !== "No Coupon Code") {
      const updateCouponUsage = await Coupon.updateOne(
        { coupon_code: data.merchant_param2 },
        { $inc: { usage_count: 1 } }
      );
    }

    const newSubcription = new subcriptionModel({
      User: req.user._id,
      Subcription_Type: data.merchant_param1,
      StartDate: startDate,
      EndDate: endDate,
      Active: true,
      order_id: data.order_id,
      tracking_id: data.tracking_id,
      bank_ref_no: data.bank_ref_no,
    });

    const savedSubcription = await newSubcription.save();

    if (savedSubcription) {
      let updateUserMode = await UserModel.updateOne(
        { _id: req.user._id },
        { $set: { subcription: savedSubcription._id } }
      );

      if (updateUserMode.acknowledged) {
        const pData = `<table border="1" cellspacing="2" cellpadding="2"><tr><td>${ccavResponse
          .replace(/=/gi, "</td><td>")
          .replace(/&/gi, "</td></tr><tr><td>")}</td></tr></table>`;

        const htmlcode = `
          <html>
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <title>Response Handler</title>
            </head>
            <body>
              <center>
                <font size="4" color="blue"><b>Payment Status</b></font>
                <br>
                ${pData}
              </center>
              <br>
              <a href="https://speakerore.com/event">Go to website</a>
            </body>
          </html>
        `;

        res.send(htmlcode);
      }
    }
  }
};
