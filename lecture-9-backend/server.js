const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Enable CORS so frontend can talk to backend
app.use(cors());

// Root route — just to confirm server is alive
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Task 1 & 2 — /api/message with extra fields
app.get("/api/message", (req, res) => {
  res.json({
    message: "My first API works!",
    course: "Browser Programming",
    year: 2026,
    time: new Date()
  });
});

// Task 3 — /api/student endpoint
app.get("/api/student", (req, res) => {
  res.json({
    name: "Ahnaf",
    role: "Student"
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});