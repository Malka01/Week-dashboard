const Report = require("../../models/Report");
const { getIndex } = require("./pinecone.service");
const {
  generateEmbedding,
} = require("./embedding.service");
const {
  formatReportForAI,
} = require("./reportFormatter");

const formatReportForAI = (report) => {
  const tasks = report.tasks
    .map(
      (task) =>
        `Task: ${task.taskName}
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
        `Blocker: ${blocker.description}`
    )
    .join("\n");

  const achievements = report.achievements
    .map(
      (achievement) =>
        `Achievement: ${achievement.description}`
    )
    .join("\n");

  return `
Team Member: ${report.userId?.name || "Unknown"}

Project: ${report.projectId?.name || "Unknown"}

Week:
${report.weekStart.toISOString().split("T")[0]}
to
${report.weekEnd.toISOString().split("T")[0]}

Report Status: ${report.status}

${tasks}

${blockers || "No blockers"}

${achievements || "No achievements"}

Development Hours:
${report.hours?.development || 0}

Testing Hours:
${report.hours?.testing || 0}

Meeting Hours:
${report.hours?.meetings || 0}

Research Hours:
${report.hours?.research || 0}

Other Hours:
${report.hours?.other || 0}

Notes:
${report.notes || "None"}
`;
};

const indexReports = async () => {
  const reports = await Report.find({
    status: { $ne: "DRAFT" },
  })
    .populate("userId", "name email")
    .populate("projectId", "name description");

  console.log(`Found ${reports.length} reports to index`);

  const index = getIndex();
  const vectors = [];

  for (const report of reports) {
    const text = formatReportForAI(report);

    const embedding = await generateEmbedding(text);

    console.log(
      `Generated embedding for report ${report._id}: ${embedding.length} dimensions`
    );

    vectors.push({
      id: report._id.toString(),

      values: embedding,

      metadata: {
        reportId: report._id.toString(),

        userId:
          report.userId?._id?.toString() || "",

        memberName:
          report.userId?.name || "Unknown",

        projectId:
          report.projectId?._id?.toString() || "",

        projectName:
          report.projectId?.name || "Unknown",

        weekStart:
          report.weekStart.toISOString(),

        weekEnd:
          report.weekEnd.toISOString(),

        status: report.status,

        text,
      },
    });
  }

  console.log(`Vectors prepared: ${vectors.length}`);

  if (vectors.length === 0) {
    console.log("No vectors available for Pinecone.");
    return 0;
  }

  await index.upsert({
    records: vectors,
  });

  console.log(
    `Successfully indexed ${vectors.length} reports`
  );

  return vectors.length;
};

module.exports = {
  indexReports,
  formatReportForAI,
};