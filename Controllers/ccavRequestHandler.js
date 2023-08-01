import { encrypt, decrypt } from "./ccavutil.js";
import crypto from "crypto";
import qs from "querystring";

export const postReq = async function (req, res) {
  var body = "",
    workingKey = "4B15E8BCD619A91BB671A1A953AC8119", //Put in the 32-Bit key shared by CCAvenues.
    accessCode = "AVCF77KF59BD18FCDB", //Put in the Access Code shared by CCAvenues.
    encRequest = "",
    formbody = "";

  const { order_id, currency, amount, merchant_param1, merchant_param2 } =
    req.session;

  //Generate Md5 hash for the key and then convert in base64 string
  var md5 = crypto.createHash("md5").update(workingKey).digest();
  var keyBase64 = Buffer.from(md5).toString("base64");

  //Initializing Vector and then convert in base64 string
  var ivBase64 = Buffer.from([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString("base64");

 
  if (
    req.body.order_id !== order_id ||
    req.body.currency !== currency ||
    +req.body.amount !== amount ||
    req.body.merchant_param1 !== merchant_param1 ||
    req.body.merchant_param2 !== merchant_param2
  ) {

    const htmlcode = `
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Response Handler</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f4f4f4;
        }
    
        .container {
          text-align: center;
          background-color: #fff;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 90%;
          margin: 20px;
        }
    
        .title {
          font-size: 24px;
          color: blue;
          margin-bottom: 10px;
        }
    
        .content {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }
    
        .content div {
          margin-bottom: 10px;
          font-size: 16px;
        }
    
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: #fff;
          text-decoration: none;
          border: none;
          border-radius: 5px;
          transition: background-color 0.3s ease;
          font-size: 16px;
          margin-top: 10px;
        }
    
        .button:hover {
          background-color: #45a049;
        }
    
        .button:active {
          background-color: #3e8e41;
        }
    
        .button .animation {
          animation: pulse 1s infinite;
        }
    
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title">Payment Status</div>
        <div class="content">
          <div>
            <strong>Parameter tampering:</strong> We couldn't process your payment.
          </div>
        <button class="button"><span class="animation">Go to website</span></button>
      </div>
    
      <script>
        document.querySelector('.button').addEventListener('click', function() {
          window.location.href = 'https://speakerore.com/event';
        });
      </script>
    </body>
    </html>
    `;

    req.session.order_id = null;
    req.session.currency = null;
    req.session.amount = null;
    req.session.merchant_param1 = null;
    req.session.merchant_param2 = null;

    
    return res.send(htmlcode);
  }

  body = qs.stringify(req.body);
  // body += req.body

  encRequest = encrypt(body, keyBase64, ivBase64);

  

  formbody =
    "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction" +
    "&encRequest=" +
    encodeURIComponent(encRequest) +
    "&access_code=" +
    accessCode;

  return res.redirect(formbody);
};
