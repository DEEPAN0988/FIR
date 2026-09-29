const admin = require("firebase-admin");

let db = null;
let auth = null;
let storage = null;
let isFirebaseConnected = false;

try {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      }),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });

    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
    isFirebaseConnected = true;
    console.log("✓ Firebase Admin initialized successfully.");
  } else {
    console.log("ℹ Firebase Admin credentials not set. Running in local simulated store mode.");
  }
} catch (error) {
  console.warn("⚠ Firebase initialization failed, running in local simulated store mode:", error.message);
}

module.exports = {
  admin,
  db,
  auth,
  storage,
  isFirebaseConnected
};
