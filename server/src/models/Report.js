const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },

    plannedPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    actualPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "COMPLETED",
        "BLOCKED",
      ],
      required: true,
    },

    timePlanned: {
      type: Number,
      min: 0,
      default: 0,
    },

    timeSpent: {
      type: Number,
      min: 0,
      default: 0,
    },

    output: {
      type: String,
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    weekStart: {
      type: Date,
      required: true,
    },

    weekEnd: {
      type: Date,
      required: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "NEEDS_CORRECTION",
        "APPROVED",
      ],
      default: "DRAFT",
      index: true,
    },

    tasks: {
      type: [taskSchema],
      default: [],
    },

    nextWeekTasks: [
      {
        type: String,
        trim: true,
      },
    ],

    blockers: [
      {
        description: {
          type: String,
          required: true,
          trim: true,
        },

        isKeyIssue: {
          type: Boolean,
          default: false,
        },
      },
    ],

    achievements: [
      {
        description: {
          type: String,
          required: true,
          trim: true,
        },

        isKeyAchievement: {
          type: Boolean,
          default: false,
        },
      },
    ],

    hours: {
      development: {
        type: Number,
        min: 0,
        default: 0,
      },

      testing: {
        type: Number,
        min: 0,
        default: 0,
      },

      meetings: {
        type: Number,
        min: 0,
        default: 0,
      },

      research: {
        type: Number,
        min: 0,
        default: 0,
      },

      other: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * A team member can have only one report
 * for a particular week and project.
 */
reportSchema.index(
  {
    userId: 1,
    weekStart: 1,
    projectId: 1,
  },
  {
    unique: true,
  }
);

reportSchema.index({
  status: 1,
  weekStart: 1,
});

module.exports = mongoose.model("Report", reportSchema);