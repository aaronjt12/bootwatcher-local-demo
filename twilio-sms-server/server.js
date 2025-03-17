require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const admin = require("firebase-admin");

// Firebase credentials from .env
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};
const test = process.env.ORIGIN_URL;

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
console.log("Firebase initialized successfully!");

// Twilio credentials from .env (using API Key)
const twilioApiKeySid = process.env.TWILIO_API_KEY_SID;
const twilioApiKeySecret = process.env.TWILIO_API_KEY_SECRET;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client with API Key
const client = twilio(twilioApiKeySid, twilioApiKeySecret, {
  accountSid: twilioAccountSid,
});

const app = express();
const database = admin.database();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://boot-watcher.vercel.app",
  "https://bootwatcher.com",
  "https://www.bootwatcher.com",
  "https://bootwatcher-local-demo-git-master-aarons-projects-d1bad5c6.vercel.app",
  "https://bootwatcher-local-demo-kahyg9n67-aarons-projects-d1bad5c6.vercel.app",
];

// Middleware
// Replace the existing cors middleware with a more permissive one for development
app.use(cors({
  origin: '*', // Allow all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies

// // Endpoint: Send SMS using Twilio
// app.post('/send-sms', async (req, res) => {
//   console.log('Sending SMS:', req.body);
//   const { recipients, message } = req.body;

//   try {
//     if (!recipients || !Array.isArray(recipients) || !message) {
//       return res.status(400).json({ error: 'Recipients (array) and message are required.' });
//     }

//     // Send SMS to all recipients
//     const sendPromises = recipients.map((recipient) =>
//       client.messages.create({
//         body: message,
//         to: recipient,
//         from: twilioPhone,
//       })
//     );

//     const results = await Promise.all(sendPromises);
//     res.status(200).json({ success: true, messages: results });
//   } catch (error) {
//     console.error('Error sending SMS:', error.message);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

app.get("/", (req, res) => {
  res.send("Welcome to the Express.js API!");
});

// Example Firebase data retrieval
app.get("/users", async (req, res) => {
  try {
    const usersRef = database.ref("users");
    const snapshot = await usersRef.once("value");
    const users = snapshot.val();
    res.status(200).json(users || {});
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Example Twilio SMS sending
app.post("/send-sms", async (req, res) => {
  try {
    const { phoneNumbers, message } = req.body;
    console.log('Received request:', { phoneNumbers, message });

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || !message) {
      console.log('Invalid request data');
      return res.status(400).json({ 
        error: "Invalid request. phoneNumbers must be an array and message is required." 
      });
    }

    const results = [];
    for (const phoneNumber of phoneNumbers) {
      try {
        console.log(`Sending message to ${phoneNumber}`);
        const messageResult = await client.messages.create({
          body: message,
          from: twilioPhone,
          to: phoneNumber,
        });
        console.log(`Successfully sent message to ${phoneNumber}:`, messageResult.sid);
        results.push(messageResult);
      } catch (error) {
        console.error(`Failed to send message to ${phoneNumber}:`, error);
        results.push({ error: error.message, phoneNumber });
      }
    }

    res.status(200).json({ 
      success: true, 
      message: "SMS processing completed", 
      results 
    });
  } catch (error) {
    console.error("Error in /send-sms endpoint:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to send SMS" 
    });
  }
});

// Example 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
