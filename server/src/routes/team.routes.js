const express = require("express");

const {
  getTeamMemberProfile,
  assignProject,
  removeProject,
} = require("../controllers/team.controller");

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get(
  "/:id",
  getTeamMemberProfile
);

router.post(
  "/:id/projects/:projectId",
  assignProject
);

router.delete(
  "/:id/projects/:projectId",
  removeProject
);

module.exports = router;