import { decrypt } from "./ccavutil.js";
import qs from "querystring";
import crypto from "crypto";

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

  ccavEncResponse += req.body;
  ccavPOST = qs.parse(ccavEncResponse);
  var encryption = ccavPOST.encResp;
  ccavResponse = decrypt(encryption, keyBase64, ivBase64);

  var pData = "";
  pData = "<table border=1 cellspacing=2 cellpadding=2><tr><td>";
  pData = pData + ccavResponse.replace(/=/gi, "</td><td>");
  pData = pData.replace(/&/gi, "</td></tr><tr><td>");
  pData = pData + "</td></tr></table>";
  htmlcode =
    '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Response Handler</title></head><body><center><font size="4" color="blue"><b>Response Page</b></font><br>' +
    pData +
    "</center><br></body></html>";
  res.writeHeader(200, { "Content-Type": "text/html" });
  res.write(htmlcode);
  res.end();
};
