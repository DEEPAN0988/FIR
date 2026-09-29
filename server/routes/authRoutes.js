const express = require("express");
const { getOfficerProfile, getAvailableOfficers } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", verifyToken, getOfficerProfile);
router.get("/officers", getAvailableOfficers);

module.exports = router;
