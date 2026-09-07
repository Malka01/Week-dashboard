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

Tasks:
${tasks || "No tasks"}

Blockers:
${blockers || "No blockers"}

Achievements:
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

module.exports = {
  formatReportForAI,
};