import axios from "axios";
import { encrypt } from "./ccavutil.js";
import qs from "querystring";

export const postStatusApi = async (request, response) => {
  try {
    // #####################################
    const orderId = request.params["order_id"];
    const referenceNo = request.params["reference_no"] || "";
    const access_code = "AVCF77KF59BD18FCDB";
    const params = { order_no: orderId, reference_no: referenceNo };
    const paramsString = JSON.stringify(params);
    const encReq = encrypt(paramsString);
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
    return response.status(500).send(error);
  }
};
