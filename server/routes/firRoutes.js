const express = require("express");
const {
  generateFIRFromTranscripts,
  getAllFIRs,
  getFIRById,
  updateFIR,
  approveFIR,
  exportFIRPDF
} = require("../controllers/firController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Generate structured FIR draft from transcripts & RAG
router.post("/generate", verifyToken, generateFIRFromTranscripts);

// Get list of all FIRs + Dashboard statistics
router.get("/", verifyToken, getAllFIRs);

// Get specific FIR by ID
router.get("/:id", verifyToken, getFIRById);

// Update/Edit FIR fields (Police officer editing)
router.put("/:id", verifyToken, updateFIR);

// Approve & digitally sign FIR
router.post("/:id/approve", verifyToken, approveFIR);

// Stream / Download FIR PDF in chosen language
router.get("/:id/pdf", verifyToken, exportFIRPDF);

module.exports = router;
