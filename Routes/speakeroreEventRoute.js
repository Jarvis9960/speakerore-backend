import express from "express";
const router = express.Router();
import { createSpeakeroreEvent } from "../Controllers/speakeroreEventController.js"
import { protectedRoute } from "../Middlewares/protectedMiddleware.js";


router.post("/createEvent", createSpeakeroreEvent);


export default router;