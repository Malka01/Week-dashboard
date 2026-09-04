const mongoose = require("mongoose");

const reportVersionSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
      index: true,
    },

    version: {
      type: Number,
      required: true,
      min: 1,
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

reportVersionSchema.index(
  {
    reportId: 1,
    version: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "ReportVersion",
  reportVersionSchema
);