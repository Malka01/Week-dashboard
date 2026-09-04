const teamService = require("../services/team.service");

const getTeamMemberProfile = async (req, res) => {
  try {
    const data = await teamService.getTeamMemberProfile(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Get team member profile error:",
      error
    );

    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const assignProject = async (req, res) => {
  try {
    const data = await teamService.assignProject(
      req.params.id,
      req.params.projectId
    );

    res.status(200).json({
      success: true,
      message: "Project assigned successfully",
      data,
    });
  } catch (error) {
    console.error(
      "Assign project error:",
      error
    );

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const removeProject = async (req, res) => {
  try {
    const data = await teamService.removeProject(
      req.params.id,
      req.params.projectId
    );

    res.status(200).json({
      success: true,
      message: "Project removed successfully",
      data,
    });
  } catch (error) {
    console.error(
      "Remove project error:",
      error
    );

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTeamMemberProfile,
  assignProject,
  removeProject,
};