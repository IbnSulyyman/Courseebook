// server.js
const express = require('express');
const cors = require('cors');
const Parse = require('parse/node');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));

// Configure CORS
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-parse-session-token']
}));

// Initialize Parse
Parse.initialize("403QXntisL9WKQBkFzSMCplu5wo6QTtcfbdQEdzX", "b6ECz5K4917ka5uYYnsUsFR8kG6J7pjSSI6ZbFvH");
Parse.serverURL = 'https://parseapi.back4app.com';

// Multer configuration (Memory storage)
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Signup Route
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    const user = new Parse.User();
    user.set("username", email);
    user.set("email", email);
    user.set("password", password);
    user.set("name", name);

    try {
        await user.signUp();
        res.json({ message: "User signed up successfully!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Parse.User.logIn(email, password);
        res.json({ message: "Login successful!", user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get User Name Route
app.get("/get-user-name/:userId", async (req, res) => {
    const userId = req.params.userId;

    const query = new Parse.Query(Parse.User);
    query.equalTo("objectId", userId);

    try {
        const user = await query.first();
        if (user) {
            const userName = user.get("name");
            res.json({ name: userName });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user name", details: error.message });
    }
});

// Middleware to verify user authentication (example using Parse.User.become)
async function requireAuthentication(req, res, next) {
  const sessionToken = req.headers['x-parse-session-token']; // Or wherever you store the token

  if (!sessionToken) {
      return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
      const user = await Parse.User.become(sessionToken);
      req.user = user; // Attach the user object to the request
      next(); // Proceed to the next middleware or route handler
  } catch (error) {
      return res.status(401).json({ error: 'Invalid session token.' });
  }
}

// Apply the authentication middleware to the /upload-material route
app.post('/upload-material', requireAuthentication, upload.single('fileUpload'), async (req, res) => {
  try {
      const { university, faculty, department, academicYear, courseName, materialType, materialDescription } = req.body;

      if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded.' });
      }

      const file = new Parse.File(req.file.originalname, { base64: req.file.buffer.toString('base64') });
      await file.save();

      const Material = Parse.Object.extend('Materials');
      const material = new Material();

      material.set('university', university);
      material.set('faculty', faculty);
      material.set('department', department);
      material.set('courseLevel', academicYear);
      material.set('course', courseName);
      material.set('materialType', materialType);
      material.set('materialFile', file);
      material.set('title', courseName);

       //Set the uploadedBy
      material.set('uploadedBy', req.user);

      await material.save();

      res.json({ message: 'Material uploaded successfully!' });

  } catch (error) {
      console.error('Error uploading material:', error);
      res.status(500).json({ error: 'Failed to upload material.', details: error.message });
  }
});

// Serve static files
app.use(express.static('.'));
app.use('/uploads', express.static('uploads')); // Still serve uploads, even though we don't save to disk in this version

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});