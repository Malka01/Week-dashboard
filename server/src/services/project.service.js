const Project = require("../models/Project");

const createProject = async ({
  name,
  description,
  assignedMembers,
}) => {
  const existingProject = await Project.findOne({
    name: name.trim(),
  });

  if (existingProject) {
    throw new Error("Project already exists");
  }

  const project = await Project.create({
    name: name.trim(),
    description,
    assignedMembers: assignedMembers || [],
  });

  return project;
};

const getProjects = async () => {
  return Project.find({
    isActive: true,
  })
    .populate("assignedMembers", "name email")
    .sort({ name: 1 });
};

const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId).populate(
    "assignedMembers",
    "name email"
  );

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

const updateProject = async (
  projectId,
  projectData
) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const allowedFields = [
    "name",
    "description",
    "isActive",
    "assignedMembers",
  ];

  allowedFields.forEach((field) => {
    if (projectData[field] !== undefined) {
      project[field] = projectData[field];
    }
  });

  await project.save();

  return project;
};

const deleteProject = async (projectId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  // Soft delete instead of permanently deleting
  project.isActive = false;

  await project.save();

  return project;
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};