import express from "express";
const router = express.Router();
import {
  createSpeakeroreEvent,
  getAllApprovedEvents,
  getAllArchivedEvent,
  getAllDeletedEvent,
  getAllEventsforApproval,
  getEventsByModes,
  getEventsByCategorys,
  getEventsByDate,
  getEventsBySpeakeroreExclusive,
} from "../Controllers/speakeroreEventController.js";
import { protectedRoute } from "../Middlewares/protectedMiddleware.js";

router.post("/createEvent", createSpeakeroreEvent);
router.get("/getallaprovedevent", getAllApprovedEvents);
router.get("/getallarchievedevent", getAllArchivedEvent);
router.get("/getalldeletedevent", getAllDeletedEvent);
router.get("/geteventforapproval", getAllEventsforApproval);
router.get("/geteventsbymodes", getEventsByModes);
router.get("/geteventsbycategories", getEventsByCategorys);
router.get("/geteventbystartdate", getEventsByDate);
router.get("/getspeakeroreexclusiveevent", getEventsBySpeakeroreExclusive);

export default router;
