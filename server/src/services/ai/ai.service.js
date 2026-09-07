const Report = require("../../models/Report");
const openaiService = require("./openai.service");
const searchService = require("./search.service");


// const {
//   formatReportForAI,
// } = require("./reportFormatter");

const getReportsForAI = async () => {
  const reports = await Report.find({
    status: { $ne: "DRAFT" },
  })
    .populate("userId", "name email")
    .populate("projectId", "name description")
    .sort({ weekStart: -1 });

  return reports;
};

const formatReportForAI = (report) => {
  const tasks = report.tasks
    .map(
      (task) =>
        `- ${task.taskName}
  Priority: ${task.priority}
  Status: ${task.status}
  Planned: ${task.plannedPercentage}%
  Actual: ${task.actualPercentage}%
  Time Planned: ${task.timePlanned} hours
  Time Spent: ${task.timeSpent} hours
  Output: ${task.output || "N/A"}`
    )
    .join("\n");

  const blockers = report.blockers
    .map(
      (blocker) =>
        `- ${blocker.description}${
          blocker.isKeyIssue ? " (Key Issue)" : ""
        }`
    )
    .join("\n");

  const achievements = report.achievements
    .map(
      (achievement) =>
        `- ${achievement.description}${
          achievement.isKeyAchievement
            ? " (Key Achievement)"
            : ""
        }`
    )
    .join("\n");

  return `
Team Member: ${report.userId?.name || "Unknown"}

Email: ${report.userId?.email || "Unknown"}

Project: ${report.projectId?.name || "Unknown"}

Project Description: ${
    report.projectId?.description || "N/A"
  }

Week:
${report.weekStart.toISOString().split("T")[0]} to ${
    report.weekEnd.toISOString().split("T")[0]
  }

Report Status: ${report.status}

Tasks:
${tasks || "No tasks reported"}

Blockers:
${blockers || "No blockers reported"}

Achievements:
${achievements || "No achievements reported"}

Next Week Tasks:
${
  report.nextWeekTasks?.length
    ? report.nextWeekTasks.map((task) => `- ${task}`).join("\n")
    : "None"
}

Hours:
Development: ${report.hours?.development || 0}
Testing: ${report.hours?.testing || 0}
Meetings: ${report.hours?.meetings || 0}
Research: ${report.hours?.research || 0}
Other: ${report.hours?.other || 0}

Notes:
${report.notes || "None"}
`;
};

const chat = async ({ message, user }) => {
  console.log("AI user:", user._id);
  console.log("AI question:", message);

  const matches =
    await searchService.searchReports(
      message,
      5
    );

  console.log(
    `Pinecone returned ${matches.length} reports`
  );

  if (!matches.length) {
    return "I couldn't find relevant information in the available reports.";
  }

  const context = matches
    .map((match) => match.metadata?.text)
    .filter(Boolean)
    .join(
      "\n\n-------------------------\n\n"
    );

  const answer =
    await openaiService.generateAnswer({
      question: message,
      context,
    });

  return answer;
};

module.exports = {
  chat,
  getReportsForAI,
  formatReportForAI,
};