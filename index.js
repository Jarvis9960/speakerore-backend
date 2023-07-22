import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./Database/connectDB.js";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import googleAuthRoutes from "./Routes/googleAuthRoute.js";
import facebookAuthRoutes from "./Routes/facebookAuthRoute.js";
import UserModel from "./Models/UserModel.js";
import SpeakeroreCategoryRoute from "./Routes/speakeroreCategoryRoute.js";
import SpeakeroreEventRoute from "./Routes/speakeroreEventRoute.js";
import SpeakerorePaymentRoute from "./Routes/speakerorePaymentRoute.js";
import UserRoute from "./Routes/speakeroreUserRoute.js";
import CouponRoute from "./Routes/speakeroreCouponRoute.js";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { dirname } from "path";
let fileName = fileURLToPath(import.meta.url);
let __dirname = dirname(fileName);
import { postReq } from "./Controllers/ccavRequestHandler.js";
import { postRes } from "./Controllers/ccavResponseHandler.js";
import { protectedRoute } from "./Middlewares/protectedMiddleware.js";
import { postStatusApi } from "./Controllers/ccavStatusApi.js";
import contactUsRoute from "./Routes/contactFormRoute.js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

// configure for dotenv file
dotenv.config({ path: path.resolve("./config.env") });

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/public");
app.engine("html", ejs.renderFile);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["https://speakerore.com", "https://www.speakerore.com", "http://localhost:3000"],
    credentials: true,
  })
);
// ["https://speakerore.com", "https://www.speakerore.com"]
app.set("trust proxy", 1);

// function to make connection to database
connectDB()
  .then((res) => {
    console.log("connection to database is successfull");
  })
  .catch((err) => {
    console.log(err);
  });

// configuring session middleware
app.use(
  session({
    secret: process.env.SESSIONSECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // Session expiration time (in milliseconds)
    },
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport.js session serialization
passport.serializeUser((id, done) => {
  if (id.email) {
    return done(null, id.email);
  } else {
    return done(null, id.id);
  }
});
passport.deserializeUser(async (id, done) => {
  try {
    // Find the user based on their ID
    // Assuming the 'id' variable can be either an email or an ObjectId
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      // If the 'id' is a valid ObjectId, search using the '_id' field
      query = { _id: id };
    } else {
      // If the 'id' is not a valid ObjectId, search using the 'email' field
      query = { email: id };
    }

    const user = await UserModel.findOne(query);

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error);
  }
});

// Configure Passport.js to use Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLECLIENTID,
      clientSecret: process.env.GOOGLESECRET,
      callbackURL: "/api/auth/google/callback", // Update with your callback URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await UserModel.findOne({
          email: profile._json.email,
        });

        if (existingUser) {
          // If the user already exists, return the user profile
          return done(null, existingUser);
        } else {
          const defauldAdmin = "ankitfukte11@gmail.com";
          var defaultUser;
          const responseData = profile._json;
          if (responseData.email === defauldAdmin) {
            let uniquefirstChar;
            let uniqueSecChar;
            let uniqueNumber = responseData.sub.substring(
              responseData.sub.length - 4
            );
            if (responseData.given_name) {
              uniquefirstChar = responseData.given_name.charAt(0);
            }
            if (responseData.family_name) {
              uniqueSecChar = responseData.family_name.charAt(0) || "";
            }
            defaultUser = {
              alphaUnqiueId: `${uniquefirstChar}${uniqueSecChar}${uniqueNumber}`,
              first_name: responseData.given_name,
              last_name: responseData.family_name,
              email: responseData.email,
              picture: responseData.picture,
              googleOrFacebookId: responseData.sub,
              role: "admin",
            };
          } else {
            let uniquefirstChar;
            let uniqueSecChar;
            let uniqueNumber = responseData.sub.substring(
              responseData.sub.length - 4
            );
            if (responseData.given_name) {
              uniquefirstChar = responseData.given_name.charAt(0);
            }
            if (responseData.family_name) {
              uniqueSecChar = responseData.family_name.charAt(0) || "";
            }
            defaultUser = {
              alphaUnqiueId: `${uniquefirstChar}${uniqueSecChar}${uniqueNumber}`,
              first_name: responseData.given_name,
              last_name: responseData.family_name,
              email: responseData.email,
              picture: responseData.picture,
              googleOrFacebookId: responseData.sub,
            };
          }

          if (responseData.email) {
            let transporter = nodemailer.createTransport({
              service: "gmail",
              host: "smtp.gmail.com",
              port: 587,
              secure: false, // true for 465, false for other ports
              auth: {
                user: "dev.speakerore@gmail.com",
                pass: "iixfmhklzudmtkqc",
              },
            });

            let info = await transporter.sendMail({
              from: "dev.speakerore@gmail.com", // sender address
              to: responseData.email, // list of receivers
              subject:
                "Unlock Your Full Potential with Speakerore.com - Limited-Time Offer Inside!", // Subject line
              // text: "", // plain text body
              html: `
                <h4>Dear ${responseData.email}</h4><br/>
                <br />
                <p>Congratulations on signing up with Speakerore.com, your gateway to a world of speaking opportunities and unprecedented growth! We're thrilled to have you on board, and we can't wait to help you transform your business, brand, and vision.<br />
      
                As an expert, trainer, founder, or speaker, you understand the immense value of speaking engagements in expanding your influence, increasing your business reach, and enhancing your brand value. With Speakerore.com, you gain access to an astonishing 200,000+ speaking opportunities worldwide, spanning across a diverse range of categories.<br />
                
                Here's why Speakerore.com is the perfect investment for your success: <br />
                
                Unleash Your Influence: Every speaking opportunity is a chance to captivate audiences, share your expertise, and solidify your influence within your industry. With our vast selection of global speaking leads, you'll have the power to make a lasting impact wherever your vision takes you.<br />
                Turbocharge Your Business: Speaking engagements are a proven catalyst for business growth. By connecting with relevant events and audiences, you'll attract new clients, forge strategic partnerships, and unlock lucrative opportunities that propel your business to new heights.<br />
                Amplify Your Brand Value: Your brand deserves recognition and visibility on a grand scale. Speakerore.com provides the platform for you to showcase your expertise, build credibility, and position yourself as a thought leader, ultimately enhancing the value of your brand in the market.<br />
                To help you make the most of these incredible benefits, we offer flexible subscription options tailored to your convenience. Choose from our quarterly, half-yearly, or annual subscription plans, allowing you to unlock a wealth of speaking opportunities while enjoying the freedom to select the plan that aligns with your goals.<br />
                
                But that's not all! We understand that managing your investment is essential, which is why we provide a hassle-free, no-cost EMI option for all our subscription plans. We want to make sure that your journey with Speakerore.com is not just fruitful but also financially convenient.<br />
                
                Don't miss out on this limited-time offer! Click the link below to subscribe immediately and start your journey towards unparalleled success:</p><br />
                <br />
                <a href="https://speakerore.com/subscription">Check out subcription link</a><br />
                <br />
                <p>Remember, this is not just an investment—it's an investment in your business, brand, and vision. Speakerore.com is your partner in growth, supporting you every step of the way to unlock your full potential.<br />
      
                If you have any questions or need assistance, our dedicated support team is here to help. Feel free to reach out to us at info@speakerore.com, and we'll be more than happy to assist you.<br />
                
                Subscribe now and seize the incredible opportunities awaiting you at Speakerore.com. Together, let's take your business, brand, and vision to unprecedented heights!<br />
                
                Best regards,<br />
                
                The Speakerore.com Team<br />
                
                P.S. Act fast! This limited-time offer won't last forever. Click the link above to subscribe and embark on your transformative journey with Speakerore.com. Unlock your full potential today!<br />
                
                Note: If you're currently unable to view the speaking leads, don't worry. You can still create new events and connect with speakers who can elevate your gatherings to the next level.</p>
               
              `, // html body
            });

            if (info.accepted[0] === responseData.email) {
              console.log("Email sent to successfully login user");
            }
          }

          const newUser = new UserModel(defaultUser);

          // Save the new user to the database
          const savedUser = await newUser.save();

          // Return the new user profile
          return done(null, savedUser);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Configure Passport.js to use facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOKAPPID,
      clientSecret: process.env.FACEBOOKAPPSECRET,
      callbackURL: "https://api.speakerore.com/api/auth/facebook/callback",
      profileFields: ["id", "displayName", "email", "name", "profileUrl"],
    },
    async (accessToken, refreshToken, profile, done) => {
      // Handle the authenticated user's profile
      // You can save or retrieve user data from your database here
      try {
        const existingUser = await UserModel.findOne({
          email: profile._json.email,
        });

        if (existingUser) {
          // If the user already exists, return the user profile
          return done(null, existingUser);
        } else {
          const defauldAdmin = "ankitfukte11@gmail.com";
          var defaultUser;
          const responseData = profile._json;


          if (!responseData.email) {
            let uniquefirstChar;
            let uniqueSecChar;
            let uniqueNumber = responseData.id.substring(
              responseData.id.length - 4
            );
            if (responseData.first_name) {
              uniquefirstChar = responseData.first_name.charAt(0);
            }
            if (responseData.last_name) {
              uniqueSecChar = responseData.last_name.charAt(0) || "";
            }
            defaultUser = {
              alphaUnqiueId: `${uniquefirstChar}${uniqueSecChar}${uniqueNumber}`,
              first_name: responseData.first_name,
              last_name: responseData.last_name,
              picture: profile.profileUrl,
              googleOrFacebookId: responseData.id,
            };

            const newUser = new UserModel(defaultUser);

            // Save the new user to the database
            const savedUser = await newUser.save();

            // Return the new user profile
            return done(null, savedUser);
          }

          if (responseData.email === defauldAdmin) {
            let uniquefirstChar;
            let uniqueSecChar;
            let uniqueNumber = responseData.id.substring(
              responseData.id.length - 4
            );
            if (responseData.first_name) {
              uniquefirstChar = responseData.first_name.charAt(0);
            }
            if (responseData.last_name) {
              uniqueSecChar = responseData.last_name.charAt(0) || "";
            }
            defaultUser = {
              alphaUnqiueId: `${uniquefirstChar}${uniqueSecChar}${uniqueNumber}`,
              first_name: responseData.first_name,
              last_name: responseData.last_name,
              email: responseData.email,
              picture: profile.profileUrl,
              googleOrFacebookId: responseData.id,
              role: "admin",
            };
          } else {
            let uniquefirstChar;
            let uniqueSecChar;
            let uniqueNumber = responseData.id.substring(
              responseData.id.length - 4
            );
            if (responseData.first_name) {
              uniquefirstChar = responseData.first_name.charAt(0);
            }
            if (responseData.last_name) {
              uniqueSecChar = responseData.last_name.charAt(0) || "";
            }
            defaultUser = {
              alphaUnqiueId: `${uniquefirstChar}${uniqueSecChar}${uniqueNumber}`,
              first_name: responseData.first_name,
              last_name: responseData.last_name,
              email: responseData.email,
              picture: profile.profileUrl,
              googleOrFacebookId: responseData.id,
            };
          }
          const newUser = new UserModel(defaultUser);

          // Save the new user to the database
          const savedUser = await newUser.save();

          // Return the new user profile
          return done(null, savedUser);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// setting up routes endpoint
app.use("/api", googleAuthRoutes);
app.use("/api", facebookAuthRoutes);
app.use("/api", SpeakeroreCategoryRoute);
app.use("/api", SpeakeroreEventRoute);
app.use("/api", SpeakerorePaymentRoute);
app.use("/api", UserRoute);
app.use("/api", CouponRoute);
app.use("/api", contactUsRoute);

// check Auth
app.get("/api/auth/check", (req, res) => {
  try {
    if (req.isAuthenticated()) {
      return res
        .status(202)
        .json({ status: true, message: "user is logged In" });
    }

    return res
      .status(401)
      .json({ status: true, message: "user is not logged In" });
  } catch (error) {
    return (
      res,
      status(500).json({
        status: false,
        message: "something went wrong",
        err: error,
      })
    );
  }
});

app.get("/api/paymentform", function (req, res) {
  res.render("dataFrom.html");
});

app.post("/api/paymentform", function (req, res) {
  const data = req.body;
  res.render("dataFrom.html", { data });
});

app.post(
  "/api/ccavRequestHandler",
  protectedRoute,
  function (request, response) {
    postReq(request, response);
  }
);

app.post(
  "/api/ccavResponseHandler",
  protectedRoute,
  function (request, response) {
    postRes(request, response);
  }
);

app.get("/api/orderstatustracker", function (request, response) {
  postStatusApi(request, response);
});

// function to listen to a server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
