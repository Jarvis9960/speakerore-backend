import { encrypt, decrypt } from "./ccavutil.js";
import crypto from "crypto";

export const postReq = async function (req, res) {
  var body = "",
    workingKey = "4B15E8BCD619A91BB671A1A953AC8119", //Put in the 32-Bit key shared by CCAvenues.
    accessCode = "AVCF77KF59BD18FCDB", //Put in the Access Code shared by CCAvenues.
    encRequest = "",
    formbody = "";

  //Generate Md5 hash for the key and then convert in base64 string
  var md5 = crypto.createHash("md5").update(workingKey).digest();
  var keyBase64 = Buffer.from(md5).toString("base64");

  //Initializing Vector and then convert in base64 string
  var ivBase64 = Buffer.from([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString("base64");

  body = JSON.stringify(req.body);
  // body += req.body
  encRequest = encrypt(body, keyBase64, ivBase64);
  var ccavResponse = decrypt(encRequest, keyBase64, ivBase64);
  console.log(ccavResponse);

  formbody =
    "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction" +
    "&encRequest=" +
    encodeURIComponent(encRequest) +
    "&access_code=" +
    accessCode;

  res.redirect(formbody);
};
