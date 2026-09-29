const { auth, isFirebaseConnected } = require("../config/firebaseAdmin");

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // If no auth header or simulated mode
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Attach default demo officer profile for local developer testing
    req.user = {
      uid: "officer_demo_001",
      email: "inspector.subramaniam@police.gov.in",
      name: "Insp. R. Subramaniam",
      rank: "Inspector of Police",
      station: "Anna Nagar Police Station (K-4)",
      district: "Chennai City Police",
      badgeNumber: "TN-POL-8842",
      role: "police"
    };
    return next();
  }

  const token = authHeader.split("Bearer ")[1];

  if (isFirebaseConnected && auth) {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch (error) {
      console.warn("Firebase token verification failed:", error.message);
      return res.status(401).json({ success: false, error: "Unauthorized token" });
    }
  }

  // Fallback demo user
  req.user = {
    uid: "officer_demo_001",
    email: "inspector.subramaniam@police.gov.in",
    name: "Insp. R. Subramaniam",
    rank: "Inspector of Police",
    station: "Anna Nagar Police Station (K-4)",
    district: "Chennai City Police",
    badgeNumber: "TN-POL-8842",
    role: "police"
  };
  next();
}

module.exports = {
  verifyToken
};
