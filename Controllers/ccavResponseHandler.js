import { decrypt } from "./ccavutil.js";
import qs from "querystring";
import crypto from "crypto";
import Coupon from "../Models/speakeroreCoupon.js";
import subcriptionModel from "../Models/speakeroreSubcription.js";
import UserModel from "../Models/UserModel.js";
import Handlebars from "handlebars";

export const postRes = async function (req, res) {
  var ccavEncResponse = "",
    ccavResponse = "",
    workingKey = "83DF91CC0CCB955ADF79C73933B35506", //Put in the 32-Bit key shared by CCAvenues.
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

  if (!ccavResponse) {
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
            <strong>couldn't process payment Response:</strong> Response url malformed.
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

    return res.send(htmlcode);
  }

  const data = {};
  ccavResponse.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    data[key] = value;
  });

  if (data.order_status === "Success") {
    const getExistingSubcriptionId = req.user.subcription;

    if (data.merchant_param2 !== "No_Coupon_Code") {
      const updateCouponUsage = await Coupon.updateOne(
        { coupon_code: data.merchant_param2 },
        { $inc: { usage_count: 1 } }
      );

      if (updateCouponUsage) {
        console.log("Coupon is incremented to one");
      }
    }

    if (getExistingSubcriptionId) {
      // check if subcription is active or not

      const getSubcription = await subcriptionModel.findById(
        getExistingSubcriptionId
      );

      if (getSubcription.Active) {
        let endDate = getSubcription.EndDate;

        if (data.merchant_param1 === "Quaterly") {
          endDate.setMonth(endDate.getMonth() + 3);
        } else if (data.merchant_param1 === "HalfYearly") {
          endDate.setMonth(endDate.getMonth() + 6);
        } else if (data.merchant_param1 === "Yearly") {
          endDate.setMonth(endDate.getMonth() + 12);
        }

        const deleteExistOrderId = await subcriptionModel.deleteOne({
          order_id: data.order_id,
        });

        req.session.order_id = null;
        req.session.currency = null;
        req.session.amount = null;
        req.session.merchant_param1 = null;
        req.session.merchant_param2 = null;

        const updatingExistingSubcription = await subcriptionModel.updateOne(
          { _id: getExistingSubcriptionId },
          {
            $set: {
              Subcription_Type: data.merchant_param1,
              order_id: data.order_id,
              EndDate: endDate,
              tracking_id: data.tracking_id,
              bank_ref_no: data.bank_ref_no,
            },
          }
        );

        if (updatingExistingSubcription.acknowledged) {
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
                <strong>Order Status:</strong> ${data.order_status}
              </div>
              <div>
                <strong>Tracking ID:</strong> ${data.tracking_id}
              </div>
              <div>
                <strong>Order ID:</strong> ${data.order_id}
              </div>
              <div>
                <strong>Amount:</strong> ${data.amount}
              </div>
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

          return res.send(htmlcode);
        }
      }
    }

    const startDate = new Date();
    let endDate = new Date(startDate);

    // Calculate the start and end dates for different subscription durations
    if (data.merchant_param1 === "Quaterly") {
      endDate.setMonth(startDate.getMonth() + 3);
    } else if (data.merchant_param1 === "HalfYearly") {
      endDate.setMonth(startDate.getMonth() + 6);
    } else if (data.merchant_param1 === "Yearly") {
      endDate.setMonth(startDate.getMonth() + 12);
    }

    req.session.order_id = null;
    req.session.currency = null;
    req.session.amount = null;
    req.session.merchant_param1 = null;
    req.session.merchant_param2 = null;

    const updateSubcriptionStatus = await subcriptionModel.updateOne(
      { order_id: data.order_id },
      {
        $set: {
          User: req.user._id,
          StartDate: startDate,
          EndDate: endDate,
          Active: true,
          tracking_id: data.tracking_id,
          bank_ref_no: data.bank_ref_no,
        },
      }
    );

    const subcriptionId = await subcriptionModel.findOne({
      order_id: data.order_id,
    });

    if (subcriptionId) {
      let updateUserMode = await UserModel.updateOne(
        { _id: req.user._id },
        { $set: { subcription: subcriptionId._id } }
      );

      if (updateUserMode.acknowledged) {
        const pData = `<table border="1" cellspacing="2" cellpadding="2"><tr><td>${ccavResponse
          .replace(/=/gi, "</td><td>")
          .replace(/&/gi, "</td></tr><tr><td>")}</td></tr></table>`;

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
                <strong>Order Status:</strong> ${data.order_status}
              </div>
              <div>
                <strong>Tracking ID:</strong> ${data.tracking_id}
              </div>
              <div>
                <strong>Order ID:</strong> ${data.order_id}
              </div>
              <div>
                <strong>Amount:</strong> ${data.amount}
              </div>
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

        return res.send(htmlcode);
      }
    }
  } else {
    req.session.order_id = null;
    req.session.currency = null;
    req.session.amount = null;
    req.session.merchant_param1 = null;
    req.session.merchant_param2 = null;

    const pData = `<table border="1" cellspacing="2" cellpadding="2"><tr><td>${ccavResponse
      .replace(/=/gi, "</td><td>")
      .replace(/&/gi, "</td></tr><tr><td>")}</td></tr></table>`;

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
        <strong>Order Status:</strong> ${data.order_status}
      </div>
      <div>
        <strong>Tracking ID:</strong> ${data.tracking_id}
      </div>
      <div>
        <strong>Order ID:</strong> ${data.order_id}
      </div>
      <div>
        <strong>Amount:</strong> ${data.amount}
      </div>
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

    return res.send(htmlcode);
  }
};
