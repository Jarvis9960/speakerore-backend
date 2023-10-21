import mongoose from "mongoose";

const speakeroreEventSchema = new mongoose.Schema(
  {
    TitleOfTheEvent: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          // Split the title into words using whitespace as the delimiter
          const words = value.trim().split(/\s+/);
          // Check if the number of words exceeds 100
          return words.length <= 50;
        },
        message: "Title should contain a maximum of 100 words",
      },
    },
    ShortDescriptionOfTheEvent: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          // Split the title into words using whitespace as the delimiter
          const words = value.trim().split(/\s+/);
          // Check if the number of words exceeds 100
          return words.length <= 200;
        },
        message: "Title should contain a maximum of 100 words",
      },
    },
    DetailedDescriptionOfTheEvent: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          // Split the title into words using whitespace as the delimiter
          const words = value.trim().split(/\s+/);
          // Check if the number of words exceeds 100
          return words.length <= 500;
        },
        message: "Title should contain a maximum of 100 words",
      },
    },
    EventWebsiteUrl: {
      type: String,
    },
    ContactEmail: {
      type: String,
    },
    Mode: {
      type: String,
      required: true,
    },
    EngagementTerm: {
      type: String,
      required: true,
    },
    EventType: {
      type: String,
      required: true,
    },
    AudienceType: {
      type: String,
      required: true,
    },
    AudienceSize: {
      type: Number,
      required: true,
    },
    Category: {
      type: String,
      required: true,
    },
    EventStartDateAndTime: {
      type: Date,
      required: true,
    },
    EventEndDateAndTime: {
      type: Date,
      required: true,
    },
    Location: {
      type: String,
      required: true,
    },
    City: {
      type: String,
      required: true,
    },
    Pincode: {
      type: String,
      required: true,
    },
    Country: {
      type: String,
      required: true,
    },
    OrganizerName: {
      type: String,
      required: true,
    },
    OrganizerEmail: {
      type: String,
      required: true,
    },
    OrganizerContactNumber: {
      type: Number,
      required: true,
    },
    isSpeakerOreExclusive: {
      type: Boolean,
      default: false,
    },
    Tags: {
      type: Object,
    },
    isApprove: {
      type: Boolean,
      default: false,
    },
    User: {
      type: Object,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    Flag: {
      isFlagged: { type: Boolean, default: false },
      User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  },
  {
    timestamps: true,
  }
);

const speakeroreEventModel = mongoose.model(
  "speakerevent",
  speakeroreEventSchema
);

export default speakeroreEventModel;
