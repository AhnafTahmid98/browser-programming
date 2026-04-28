// Notes App - Browser Programming Assignment
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());

// ── Database connection ────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to Supabase database");
  }
});

// ── Routes ─────────────────────────────────────────────────

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Notes API is running!", status: "ok" });
});

// GET /notes — return all notes, newest first
app.get("/notes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notes ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// POST /notes — create a new note
app.post("/notes", async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Note content cannot be empty" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO notes (content) VALUES ($1) RETURNING *",
      [content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// DELETE /notes/:id — delete a note by id
app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted", note: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});