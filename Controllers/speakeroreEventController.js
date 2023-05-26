import speakeroreEventModel from "../Models/speakeroreEvents.js";

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
    const eventEndDateAndTimeOject = new Date(eventEndDate);
    const [startHours, startMinutes] = eventStartTime.split(":");
    const [endHours, endMinutes] = eventEndTime.split(":");
    eventStartDateAndTimeObject.setUTCHours(parseInt(startHours, 10));
    eventStartDateAndTimeObject.setMinutes(parseInt(startMinutes, 10));
    eventEndDateAndTimeOject.setUTCHours(parseInt(endHours, 10));
    eventEndDateAndTimeOject.setMinutes(parseInt(endMinutes, 10));

    if (
      isNaN(eventStartDateAndTimeObject.getTime()) ||
      isNaN(eventEndDateAndTimeOject.getTime())
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
      EventEndDateAndTime: eventEndDateAndTimeOject,
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

export const getallEvents = async (req, res) => {
  try {
    const savedEvents = await speakeroreEventModel.find({});

    if (savedEvents.length < 1) {
      return res
        .status(404)
        .json({ status: true, message: "no data found in the database" });
    }

    return res
      .status(202)
      .json({ status: true, message: "Events successfully fetched" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
