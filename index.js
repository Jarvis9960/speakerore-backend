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
    origin: ["https://speakerore.com", "https://www.speakerore.com"],
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
  return done(null, id.email);
});
passport.deserializeUser(async (id, done) => {
  try {
    // Find the user based on their ID
    const user = await UserModel.findOne({ email: id });

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
              uniqueSecChar = responseData.family_name.charAt(0);
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
              uniqueSecChar = responseData.family_name.charAt(0);
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
      callbackURL: "/api/auth/facebook/callback",
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
              uniqueSecChar = responseData.last_name.charAt(0);
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
              uniqueSecChar = responseData.last_name.charAt(0);
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
