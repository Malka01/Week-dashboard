const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  createProject,
  getProjects,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const router = express.Router();

router.use(authenticate);

// Both ADMIN and TEAM_MEMBER can view active projects
router.get(
  "/",
  authorizeRoles("ADMIN", "TEAM_MEMBER"),
  getProjects
);

router.get(
  "/all",
  authorizeRoles("ADMIN"),
  getAllProjects
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "TEAM_MEMBER"),
  getProjectById
);

// Only ADMIN can manage projects
router.post(
  "/",
  authorizeRoles("ADMIN"),
  createProject
);

router.put(
  "/:id",
  authorizeRoles("ADMIN"),
  updateProject
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  deleteProject
);

module.exports = router;