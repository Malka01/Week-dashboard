const express = require("express");

const {
getUsers,
createUser,
updateUser,
deactivateUser,
} = require("../controllers/adminUser.controller");

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/", getUsers);

router.post("/", createUser);

router.put("/:id", updateUser);

router.patch("/:id/deactivate", deactivateUser);

module.exports = router;
