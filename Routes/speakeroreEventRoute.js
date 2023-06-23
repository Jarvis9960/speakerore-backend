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
  getEventsByFilters,
  reviveEvent,
  permanentDeleteEvent,
  getEventsBySearchforArchived,
  getEventsBySearchforTrash,
  getEventsBySearchforCurrentUser,
  getDataOfEvent,
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
router.get(
  "/geteventsbyfilter",
  protectedRoute,
  checkSubcription,
  getEventsByFilters
);
router.get("/geteventforcurrentuser", protectedRoute, getEventUserHasPublished);
router.get(
  "/geteventbyquery",
  protectedRoute,
  checkSubcription,
  getEventsBySearch
);
router.get(
  "/geteventbyqueryforcurrentuser",
  protectedRoute,
  getEventsBySearchforCurrentUser
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
router.patch("/revivefortrash", protectedRouteOfAdmin, reviveEvent);
router.delete("/deleteevent", protectedRouteOfAdmin, permanentDeleteEvent);
router.get(
  "/geteventbyqueryfortrash",
  protectedRouteOfAdmin,
  getEventsBySearchforTrash
);
router.get("/getreportofevent", getDataOfEvent);

// getting all events for team member
router.get(
  "/getallarchievedevent",
  protectedRouteOfTeamMember,
  getAllArchivedEvent
);
router.get(
  "/geteventbyqueryforarchived",
  protectedRouteOfTeamMember,
  getEventsBySearchforArchived
);

export default router;
