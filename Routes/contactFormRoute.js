import express from "express";
import { contactUsForm } from "../Controllers/contactUsFormController.js";
const router = express.Router();


router.post("/submitcontactform", contactUsForm);


export default router;