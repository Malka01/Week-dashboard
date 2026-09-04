const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
      index: true,
    },

    versionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReportVersion",
    },

    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "SUBMITTED",
        "REQUESTED_CORRECTION",
        "APPROVED",
        "RESUBMITTED",
      ],
      required: true,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({
  reportId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Review", reviewSchema);