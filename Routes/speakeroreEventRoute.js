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
  makeEventApproved,
  getSingleEventById,
  makeEventDecline,
} from "../Controllers/speakeroreEventController.js";
import { protectedRoute } from "../Middlewares/protectedMiddleware.js";

router.post("/createEvent", createSpeakeroreEvent);
router.get("/getsingleevent/:eventId", getSingleEventById);
router.get("/getallaprovedevent", getAllApprovedEvents);
router.get("/getallarchievedevent", getAllArchivedEvent);
router.get("/getalldeletedevent", getAllDeletedEvent);
router.get("/geteventforapproval", getAllEventsforApproval);
router.get("/geteventsbymodes", getEventsByModes);
router.get("/geteventsbycategories", getEventsByCategorys);
router.get("/geteventbystartdate", getEventsByDate);
router.get("/getspeakeroreexclusiveevent", getEventsBySpeakeroreExclusive);
router.patch("/makeeventapprove", protectedRoute, makeEventApproved);
router.patch("/makeeventdecline", protectedRoute, makeEventDecline);


export default router;
