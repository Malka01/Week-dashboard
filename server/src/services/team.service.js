const User = require("../models/User");
const Project = require("../models/Project");
const Report = require("../models/Report");

const getTeamMemberProfile = async (userId) => {
  const user = await User.findById(userId).select(
    "name email role isActive createdAt"
  );

  if (!user) {
    throw new Error("Team member not found");
  }

  if (user.role !== "TEAM_MEMBER") {
    throw new Error("This user is not a team member");
  }

  // Projects currently assigned to this member
  const assignedProjects = await Project.find({
    assignedMembers: userId,
  })
    .select("name description isActive")
    .sort({ name: 1 });

  // Projects available for assignment
  const availableProjects = await Project.find({
    isActive: true,
    assignedMembers: {
      $ne: userId,
    },
  })
    .select("name description isActive")
    .sort({ name: 1 });

  // Report statistics
  const [
    totalReports,
    draftReports,
    submittedReports,
    correctionReports,
    approvedReports,
  ] = await Promise.all([
    Report.countDocuments({ userId }),
    Report.countDocuments({
      userId,
      status: "DRAFT",
    }),
    Report.countDocuments({
      userId,
      status: "SUBMITTED",
    }),
    Report.countDocuments({
      userId,
      status: "NEEDS_CORRECTION",
    }),
    Report.countDocuments({
      userId,
      status: "APPROVED",
    }),
  ]);

  // Recent reports
  const recentReports = await Report.find({
    userId,
  })
    .populate("projectId", "name")
    .select(
      "weekStart weekEnd projectId status updatedAt createdAt"
    )
    .sort({
      weekStart: -1,
    })
    .limit(10);

  return {
    user,
    statistics: {
      totalReports,
      draftReports,
      submittedReports,
      correctionReports,
      approvedReports,
    },
    assignedProjects,
    availableProjects,
    recentReports,
  };
};

const assignProject = async (userId, projectId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Team member not found");
  }

  if (user.role !== "TEAM_MEMBER") {
    throw new Error("Only team members can be assigned to projects");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (!project.isActive) {
    throw new Error("Cannot assign an inactive project");
  }

  await Project.findByIdAndUpdate(
    projectId,
    {
      $addToSet: {
        assignedMembers: userId,
      },
    },
    {
      new: true,
    }
  );

  return getTeamMemberProfile(userId);
};

const removeProject = async (userId, projectId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Team member not found");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  await Project.findByIdAndUpdate(
    projectId,
    {
      $pull: {
        assignedMembers: userId,
      },
    },
    {
      new: true,
    }
  );

  return getTeamMemberProfile(userId);
};

module.exports = {
  getTeamMemberProfile,
  assignProject,
  removeProject,
};
