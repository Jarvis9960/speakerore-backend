import express from "express";
const router = express.Router();
import {
  createSpeakeroreEvent,
  getAllApprovedEvents,
  getAllArchivedEvent,
  getAllTrashEvent,
  getAllEventsforApproval,
  getEventsByModes,
  getEventsByCategorys,
  getEventsByDate,
  getEventsBySpeakeroreExclusive,
  makeEventApproved,
  getSingleEventById,
  makeEventDecline,
  getEventUserHasPublished,
  deleteEvent,
  getEventsBySearch,
} from "../Controllers/speakeroreEventController.js";
import {
  protectedRoute,
  protectedRouteOfAdmin,
  protectedRouteOfTeamMember,
} from "../Middlewares/protectedMiddleware.js";
import { checkSubcription } from "../Middlewares/checkSubriptionMiddleware.js";

// creating events
router.post("/createEvent", protectedRoute, createSpeakeroreEvent);

// getting all event for regular user
router.get(
  "/getsingleevent/:eventId",
  protectedRoute,
  checkSubcription,
  getSingleEventById
);
router.get(
  "/getallapprovedevent",
  protectedRoute,
  checkSubcription,
  getAllApprovedEvents
);
router.get(
  "/geteventsbymodes",
  protectedRoute,
  checkSubcription,
  getEventsByModes
);
router.get(
  "/geteventsbycategories",
  protectedRoute,
  checkSubcription,
  getEventsByCategorys
);
router.get(
  "/geteventbystartdate",
  protectedRoute,
  checkSubcription,
  getEventsByDate
);
router.get(
  "/getspeakeroreexclusiveevent",
  protectedRoute,
  checkSubcription,
  getEventsBySpeakeroreExclusive
);
router.get("/geteventforcurrentuser", protectedRoute, getEventUserHasPublished);
router.get(
  "/geteventbyquery",
  protectedRoute,
  checkSubcription,
  getEventsBySearch
);

// getting all events for admin and modify
router.patch("/makeeventapprove", protectedRouteOfAdmin, makeEventApproved);
router.patch("/makeeventdecline", protectedRouteOfAdmin, makeEventDecline);
router.get(
  "/geteventforapproval",
  protectedRouteOfAdmin,
  getAllEventsforApproval
);
router.get("/getalltrashevents", protectedRouteOfAdmin, getAllTrashEvent);
router.patch("/makeeventdelete", protectedRouteOfAdmin, deleteEvent);

// getting all events for team member
router.get(
  "/getallarchievedevent",
  protectedRouteOfTeamMember,
  getAllArchivedEvent
);

export default router;
