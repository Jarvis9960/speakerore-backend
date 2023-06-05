import express, { response } from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./Database/connectDB.js";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import googleAuthRoutes from "./Routes/googleAuthRoute.js";
import UserModel from "./Models/UserModel.js";
import SpeakeroreCategoryRoute from "./Routes/speakeroreCategoryRoute.js";
import SpeakeroreEventRoute from "./Routes/speakeroreEventRoute.js";
import SpeakerorePaymentRoute from "./Routes/speakerorePaymentRoute.js"

// configure for dotenv file
dotenv.config({ path: path.resolve("./config.env") });

const app = express();

// middlewares for app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// configuring session middleware
app.use(
  session({
    secret: process.env.SESSIONSECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // Session expiration time (in milliseconds)
    },
  })
); // Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport.js to use Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLECLIENTID,
      clientSecret: process.env.GOOGLESECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback", // Update with your callback URL
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database based on their Google ID
        const existingUser = await UserModel.findOne({ googleId: profile.id });

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
              googleId: responseData.sub,
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
              googleId: responseData.sub,
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

// Configure Passport.js session serialization
passport.serializeUser((user, done) => {
  done(null, user.googleId);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Find the user based on their ID
    const user = await UserModel.findOne({ googleId: id });

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error);
  }
});

// setting up routes endpoint
app.use("/api", googleAuthRoutes);
app.use("/api", SpeakeroreCategoryRoute);
app.use("/api", SpeakeroreEventRoute);
app.use("/api", SpeakerorePaymentRoute);

// function to make connection to database
connectDB()
  .then((res) => {
    console.log("connection to database is successfull");
  })
  .catch((err) => {
    console.log(err);
  });

// function to listen to a server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
