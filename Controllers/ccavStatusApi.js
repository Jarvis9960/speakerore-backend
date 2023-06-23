import axios from "axios";
import { encrypt } from "./ccavutil.js";
import qs from "querystring";
import crypto from "crypto";

export const postStatusApi = async (request, response) => {
  try {
    // #####################################
    const orderId = request.query.order_no;
    const referenceNo = request.query.reference_no || "";
    const access_code = "AVCF77KF59BD18FCDB";
    const workingKey = "4B15E8BCD619A91BB671A1A953AC8119";
    const params = { order_no: orderId, reference_no: referenceNo };
    console.log(params);

    var md5 = crypto.createHash("md5").update(workingKey).digest();
    var keyBase64 = Buffer.from(md5).toString("base64");

    //Initializing Vector and then convert in base64 string
    var ivBase64 = Buffer.from([
      0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
      0x0c, 0x0d, 0x0e, 0x0f,
    ]).toString("base64");

    const paramsString = JSON.stringify(params);
    const encReq = encrypt(paramsString, keyBase64, ivBase64);
    const final_data = qs.stringify({
      enc_request: encReq,
      access_code: access_code,
      command: "orderStatusTracker",
      request_type: "JSON",
      response_type: "JSON",
    });
    const ccavenue_res = await axios.post(
      `https://apitest.ccavenue.com/apis/servlet/DoWebTrans`,
      final_data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const info = qs.parse(ccavenue_res.data);
    console.log("INFo : ", info);
    const payment_status = decrypt(info.enc_response);
    console.log("PS : ", payment_status);
    response.send(payment_status);
  } catch (error) {
    console.log(error);
    return response.status(500).send(error);
  }
};
