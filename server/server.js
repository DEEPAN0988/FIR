require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const ragService = require("./services/ragService");

// Route imports
const authRoutes = require("./routes/authRoutes");
const transcriptionRoutes = require("./routes/transcriptionRoutes");
const firRoutes = require("./routes/firRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads (for temporary access if needed)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    system: "VoiceFIR Automated Police Pipeline",
    groqLive: !!process.env.GROQ_API_KEY,
    firebaseLive: !!process.env.FIREBASE_PROJECT_ID,
    ragIndexed: ragService.initialized,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/transcription", transcriptionRoutes);
app.use("/api/fir", firRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Express Global Error Handler:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

// Start Server & Initialize RAG
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚔 VoiceFIR Backend Service running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
  
  try {
    await ragService.initialize();
  } catch (ragErr) {
    console.warn("RAG initialization warning:", ragErr.message);
  }
});
