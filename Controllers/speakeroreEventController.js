import speakeroreEventModel from "../Models/speakeroreEvents.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import nodemailer from "nodemailer";
import cron from "node-cron";
let fileName = fileURLToPath(import.meta.url);
let __dirname = dirname(fileName);
let breakIndex = __dirname.lastIndexOf("\\") + 1;
let result = __dirname.substring(0, breakIndex);

dotenv.config({ path: `${result}config.env` });

export const createSpeakeroreEvent = async (req, res) => {
  try {
    const {
      titleOfTheEvent,
      shortDescriptionOfTheEvent,
      detailedDescriptionOfTheEvent,
      eventWebsiteUrl,
      mode,
      engageMentTerm,
      eventType,
      audienceType,
      audienceSize,
      category,
      eventStartDate,
      eventEndDate,
      eventStartTime,
      eventEndTime,
      location,
      city,
      pincode,
      country,
      organizerName,
      organizerEmail,
      organizerContactNumber,
      tags,
      isSpeakeroreExclusive,
    } = req.body;

    if (
      !titleOfTheEvent ||
      !shortDescriptionOfTheEvent ||
      !detailedDescriptionOfTheEvent ||
      !eventWebsiteUrl ||
      !mode ||
      !engageMentTerm ||
      !eventType ||
      !audienceType ||
      !audienceSize ||
      !category ||
      !eventStartDate ||
      !eventEndDate ||
      !eventStartTime ||
      !eventEndTime ||
      !location ||
      !city ||
      !pincode ||
      !country ||
      !organizerName ||
      !organizerEmail ||
      !organizerContactNumber ||
      !tags
    ) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const eventStartDateAndTimeObject = new Date(eventStartDate);
    const eventEndDateAndTimeObject = new Date(eventEndDate);
    const [startHours, startMinutes] = eventStartTime.split(":");
    const [endHours, endMinutes] = eventEndTime.split(":");
    eventStartDateAndTimeObject.setUTCHours(
      parseInt(startHours, 10),
      parseInt(startMinutes, 10)
    );
    eventEndDateAndTimeObject.setUTCHours(
      parseInt(endHours, 10),
      parseInt(endMinutes, 10)
    );

    if (
      isNaN(eventStartDateAndTimeObject.getTime()) ||
      isNaN(eventEndDateAndTimeObject.getTime())
    ) {
      return res
        .status(422)
        .json({ status: false, message: "Event Dates is Invalid" });
    }

    const currentUser = req.user;

    const newEventPublished = new speakeroreEventModel({
      TitleOfTheEvent: titleOfTheEvent,
      ShortDescriptionOfTheEvent: shortDescriptionOfTheEvent,
      DetailedDescriptionOfTheEvent: detailedDescriptionOfTheEvent,
      EventWebsiteUrl: eventWebsiteUrl,
      Mode: mode,
      EngagementTerm: engageMentTerm,
      EventType: eventType,
      AudienceType: audienceType,
      AudienceSize: audienceSize,
      Category: category,
      EventStartDateAndTime: eventStartDateAndTimeObject,
      EventEndDateAndTime: eventEndDateAndTimeObject,
      Location: location,
      City: city,
      Pincode: pincode,
      Country: country,
      OrganizerName: organizerName,
      OrganizerEmail: organizerEmail,
      OrganizerContactNumber: organizerContactNumber,
      isSpeakerOreExclusive: isSpeakeroreExclusive,
      Tags: tags,
      User: currentUser,
    });

    const savedResponse = await newEventPublished.save();

    if (savedResponse) {
      return res.status(201).json({
        status: true,
        message: "Event successfully created",
        savedResponse,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getAllEventsforApproval = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 9;

    const totalCount = await speakeroreEventModel
      .find({ isApprove: false, isDeleted: false, isArchived: false })
      .countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    const savedEvents = await speakeroreEventModel
      .find({ isApprove: false, isDeleted: false, isArchived: false })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedEvents.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: "no data found in the database" });
    }

    return res.status(202).json({
      status: true,
      message: "Events successfully fetched",
      savedEvents: savedEvents,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getSingleEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res
        .status(422)
        .json({ status: false, message: "eventId is not available" });
    }

    const savedEvent = await speakeroreEventModel.findOne({ _id: eventId });

    if (!savedEvent) {
      return res.status(404).json({
        status: true,
        message: "No event is present with requested id",
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched single event",
      savedEvent: savedEvent,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getAllApprovedEvents = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 9;

    const totalCount = await speakeroreEventModel
      .find({ isApprove: true, isDeleted: false, isArchived: false })
      .countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    const savedEvents = await speakeroreEventModel
      .find({ isApprove: true, isDeleted: false, isArchived: false })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedEvents.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: "no data found in the database" });
    }

    return res.status(202).json({
      status: true,
      message: "Events successfully fetched",
      savedEvents: savedEvents,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getAllArchivedEvent = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 9;

    const totalCount = await speakeroreEventModel
      .find({ isDeleted: false, isArchived: true })
      .countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    const savedEvents = await speakeroreEventModel
      .find({ isDeleted: false, isArchived: true })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedEvents.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: "no data found in the database" });
    }

    return res.status(202).json({
      status: true,
      message: "Events successfully fetched",
      savedEvents: savedEvents,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getEventsByModes = async (req, res) => {
  try {
    const { mode } = req.query;
    const limit = 9;
    const page = req.query.page || 1;

    if (!mode) {
      return res
        .status(422)
        .json({ status: false, message: "mode is not given for query" });
    }

    const totalCount = speakeroreEventModel
      .find({
        Mode: mode,
        isApprove: true,
        isArchived: false,
        isDeleted: false,
      })
      .countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    const savedEventMode = await speakeroreEventModel
      .find({
        Mode: mode,
        isApprove: true,
        isArchived: false,
        isDeleted: false,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedEventMode.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: `No data is present of mode ${mode}` });
    }

    return res.status(202).json({
      status: true,
      message: `successfully fetched ${mode} mode data`,
      savedEventMode: savedEventMode,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getEventsByCategorys = async (req, res) => {
  try {
    const { category } = req.query;
    const limit = 9;
    const page = req.query.page || 1;

    if (!category) {
      return res
        .status(422)
        .json({ status: false, message: "category is not given for query" });
    }

    const totalCount = speakeroreEventModel
      .find({
        Category: category,
        isApprove: true,
        isArchived: false,
        isDeleted: false,
      })
      .countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    const savedEventByCategory = await speakeroreEventModel
      .find({
        Category: category,
        isApprove: true,
        isArchived: false,
        isDeleted: false,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedEventByCategory.length < 1) {
      return res.status(404).json({
        status: true,
        message: `No data is present of ${category} category in database`,
      });
    }

    return res.status(202).json({
      status: false,
      message: `successfully fetched ${category} category data`,
      savedEventByCategory: savedEventByCategory,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getEventsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const limit = 9;
    const page = req.query.page || 1;

    if (!date) {
      return res
        .status(422)
        .json({ status: false, message: "Date is not given for query" });
    }

    const targetDate = new Date(date);
    const startDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const endDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate() + 1
    );

    console.log(startDate);
    console.log(endDate);

    const totalCount = speakeroreEventModel
      .find({
        EventStartDateAndTime: { $gte: startDate, $lt: endDate },
      })
      .countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const savedEventByDate = await speakeroreEventModel
      .find({
        EventStartDateAndTime: { $gte: startDate, $lt: endDate },
      })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedEventByDate.length < 1) {
      return res.status(404).json({
        status: true,
        message: `No data is present of ${date} category in database`,
      });
    }

    return res.status(202).json({
      status: true,
      message: `successfully fetched ${targetDate} category data`,
      savedEventByDate: savedEventByDate,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getEventsBySpeakeroreExclusive = async (req, res) => {
  try {
    const { speakeroreExclusive } = req.query;
    const limit = 9;
    const page = req.query.page || 1;

    if (!speakeroreExclusive) {
      return res
        .status(422)
        .json({ status: false, message: "speakerExclusive is undefined" });
    }

    const totalCount = await speakeroreEventModel
      .find({
        isSpeakerOreExclusive: speakeroreExclusive,
        isApprove: true,
        isArchived: false,
        isDeleted: false,
      })
      .countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    const savedEventExclusive = await speakeroreEventModel
      .find({
        isSpeakerOreExclusive: speakeroreExclusive,
        isApprove: true,
        isArchived: false,
        isDeleted: false,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedEventExclusive.length < 1) {
      return res.status(404).json({
        status: false,
        message: `No data is present of speakeroleExclusive`,
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched exclusive Event Data",
      savedEventExclusive: savedEventExclusive,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const makeEventApproved = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(422).json({
        status: false,
        message: "event id is not givent to approve event",
      });
    }

    const approveEventResponse = await speakeroreEventModel.updateOne(
      { _id: eventId },
      { $set: { isApprove: true } }
    );

    if (approveEventResponse.acknowledged) {
      // const savedEvent = await speakeroreEventModel.findOne({ _id: eventId });

      // const userEvent = savedEvent.User.email;

      // let transporter = nodemailer.createTransport({
      //   service: "gmail",
      //   host: "smtp.gmail.com",
      //   port: 587,
      //   secure: false, // true for 465, false for other ports
      //   auth: {
      //     user: "jarvis9960@gmail.com",
      //     pass: process.env.GMAILAPPPASSWORD,
      //   },
      // });

      // let info = await transporter.sendMail({
      //   from: "jarvis9960@gmail.com", // sender address
      //   to: userEvent, // list of receivers
      //   subject: "Your event is approved", // Subject line
      //   // text: "", // plain text body
      //   html: `<p>congratulations, your event is approved</P>`, // html body
      // });

      // if (
      //   info.accepted[0] === userEvent &&
      //   approveEventResponse.acknowledged === true
      // ) {
      //   return res
      //     .status(201)
      //     .json({ status: true, Message: "Event has been approved" });
      // } else {
      return res
        .status(201)
        .json({ status: true, Message: "Event has been approved" });
      // }
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const makeEventDecline = async (req, res) => {
  try {
    const { eventId, feedback } = req.body;

    if (!eventId || !feedback) {
      return res.status(422).json({
        status: false,
        message: "Please provide eventId and feedback to decline the event",
      });
    }

    const declineEventResponse = await speakeroreEventModel.updateOne(
      { _id: eventId },
      { $set: { isDeleted: true } }
    );

    if (declineEventResponse.acknowledged) {
      const savedEvent = await speakeroreEventModel.findOne({ _id: eventId });

      const userEvent = savedEvent.User.email;

      let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "jarvis9960@gmail.com",
          pass: process.env.GMAILAPPPASSWORD,
        },
      });

      let info = await transporter.sendMail({
        from: "jarvis9960@gmail.com", // sender address
        to: userEvent, // list of receivers
        subject: "Your event is approved", // Subject line
        // text: "", // plain text body
        html: `<p>congratulations, your event is approved</P>. <p>Feedback:- ${feedback}`, // html body
      });

      if (
        info.accepted[0] === userEvent &&
        declineEventResponse.acknowledged === true
      ) {
        return res
          .status(201)
          .json({ status: true, Message: "Event has been approved" });
      } else {
        return res
          .status(201)
          .json({ status: true, Message: "Event has been approved" });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const getEventsForParticularUser = async (req, res) => {
  try {
    const currentUser = req.user._id;

    const page = req.query.page || 1;
    const limit = 9;

    const totalCount = await speakeroreEventModel
      .find({ User: currentUser })
      .countDocuments();
    const totalPage = Math.ceil(totalCount / limit);

    const savedEventOfUser = await speakeroreEventModel
      .find({ User: currentUser })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedEventOfUser.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: "No event are present in database" });
    }

    return res.status(202).json({
      status: true,
      message: "successfully fetched events",
      savedEventOfUser: savedEventOfUser,
      totalPage: totalPage,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

// Scheduler that check event is over and then archived
cron.schedule("0 1 * * *", () => {
  (async function () {
    const currentDate = new Date();

    const eventThatAreEnd = await speakeroreEventModel.find({
      EventEndDateAndTime: { $lt: currentDate },
      isArchived: false,
    });

    const eventId = eventThatAreEnd.map((currEvent) => {
      return currEvent._id;
    });

    const makeEventArchived = await speakeroreEventModel.updateMany(
      { _id: { $in: eventId } },
      { $set: { isArchived: true } }
    );

    if (makeEventArchived.acknowledged) {
      console.log(`${eventThatAreEnd.length} events are archived`);
    }
  })();
});

// get event user has published

export const getEventUserHasPublished = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 9;
    const totalCount = await speakeroreEventModel
      .find({
        "User._id": req.user._id,
      })
      .countDocuments();
    const totalPage = Math.ceil(totalCount / limit);

    const savedEventsOfCurrentUser = await speakeroreEventModel
      .find({
        "User._id": req.user._id,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    if (savedEventsOfCurrentUser.length < 1) {
      return res.status(404).json({
        status: false,
        message: "No Events are published by the user",
      });
    }

    return res.status(202).json({
      status: true,
      message: "successfull fetched event of the user",
      savedEventsOfCurrentUser: savedEventsOfCurrentUser,
      totalPage: totalPage,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

// get all trash events

export const getAllTrashEvent = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 9;
    const totalCount = await speakeroreEventModel
      .find({ isDeleted: true })
      .countDocuments();
    const totalPage = Math.ceil(totalCount / limit);

    const deletedEvents = await speakeroreEventModel
      .find({ isDeleted: true })
      .skip((page - 1) * limit)
      .limit(limit);

    if (deletedEvents.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: "No deleted Events are present" });
    }

    return res.status(201).json({
      status: true,
      message: "successfully fetched deleted events",
      deletedEvents: deletedEvents,
      totalPage: totalPage,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res
        .status(422)
        .json({ status: false, message: "Please provide eventID to delete" });
    }

    const deleteEventResponse = await speakeroreEventModel.updateOne(
      { _id: eventId },
      { $set: { isDeleted: true } }
    );

    if (deleteEventResponse.acknowledged) {
      return res.status(201).json({
        status: true,
        message: "Event successfully declined and moved to trash",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};

// get event by search field

export const getEventsBySearch = async (req, res) => {
  try {
    const { keyword } = req.query;
    const page = req.query.page || 1;
    const limit = 9;

    if (!keyword) {
      return res
        .status(422)
        .json({ status: false, message: "No keyword is provided to query" });
    }

    const totalCount = await speakeroreEventModel
      .find({
        $and: [
          {
            $or: [
              { TitleOfTheEvent: { $regex: new RegExp(keyword, "i") } },
              {
                ShortDescriptionOfTheEvent: {
                  $regex: new RegExp(keyword, "i"),
                },
              },
              {
                DetailedDescriptionOfTheEvent: {
                  $regex: new RegExp(keyword, "i"),
                },
              },
              { EventWebsiteUrl: { $regex: new RegExp(keyword, "i") } },
              { Mode: { $regex: new RegExp(keyword, "i") } },
              { EngagementTerm: { $regex: new RegExp(keyword, "i") } },
              { EventType: { $regex: new RegExp(keyword, "i") } },
              { AudienceType: { $regex: new RegExp(keyword, "i") } },
              { Category: { $regex: new RegExp(keyword, "i") } },
              { Location: { $regex: new RegExp(keyword, "i") } },
              { City: { $regex: new RegExp(keyword, "i") } },
              { Country: { $regex: new RegExp(keyword, "i") } },
              { OrganizerName: { $regex: new RegExp(keyword, "i") } },
              { OrganizerEmail: { $regex: new RegExp(keyword, "i") } },
              { Tags: { $in: [new RegExp(keyword, "i")] } },
            ],
          },
          { isApproved: true },
        ],
      })
      .countDocuments();
    const totalPage = Math.ceil(totalCount / limit);

    const queryResult = await speakeroreEventModel.find({
      $and: [
        {
          $or: [
            { TitleOfTheEvent: { $regex: new RegExp(keyword, "i") } },
            {
              ShortDescriptionOfTheEvent: { $regex: new RegExp(keyword, "i") },
            },
            {
              DetailedDescriptionOfTheEvent: {
                $regex: new RegExp(keyword, "i"),
              },
            },
            { EventWebsiteUrl: { $regex: new RegExp(keyword, "i") } },
            { Mode: { $regex: new RegExp(keyword, "i") } },
            { EngagementTerm: { $regex: new RegExp(keyword, "i") } },
            { EventType: { $regex: new RegExp(keyword, "i") } },
            { AudienceType: { $regex: new RegExp(keyword, "i") } },
            { Category: { $regex: new RegExp(keyword, "i") } },
            { Location: { $regex: new RegExp(keyword, "i") } },
            { City: { $regex: new RegExp(keyword, "i") } },
            { Country: { $regex: new RegExp(keyword, "i") } },
            { OrganizerName: { $regex: new RegExp(keyword, "i") } },
            { OrganizerEmail: { $regex: new RegExp(keyword, "i") } },
            { Tags: { $in: [new RegExp(keyword, "i")] } },
          ],
        },
        { isApproved: true },
      ],
    });

    if (queryResult.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: "No such events present" });
    }

    return res.status(201).json({
      status: true,
      message: "sucessfully fetched query result",
      queryResult: queryResult,
      totalPage: totalPage,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
