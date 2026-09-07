const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const { chat } = require("../controllers/ai.controller");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.post("/chat", chat);

module.exports = router;