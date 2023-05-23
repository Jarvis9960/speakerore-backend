import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./Database/connectDB.js";

// configure for dotenv file
dotenv.config({ path: path.resolve("./config.env") });

const app = express();

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
