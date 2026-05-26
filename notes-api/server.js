require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── SELECT all notes ──────────────────────────────────────────────
app.get("/notes", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM notes ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SELECT one note by id ─────────────────────────────────────────
app.get("/notes/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM notes WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Note not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── INSERT a new note ─────────────────────────────────────────────
// Body: { title, content }
app.post("/notes", async (req, res) => {
  const { title, content } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE a note by id ───────────────────────────────────────────
// Body: { title, content }  (send only the fields you want to change)
app.put("/notes/:id", async (req, res) => {
  const { title, content } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE notes
          SET title   = COALESCE($1, title),
              content = COALESCE($2, content)
        WHERE id = $3
    RETURNING *`,
      [title, content, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Note not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE a note by id ───────────────────────────────────────────
app.delete("/notes/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM notes WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Deleted", note: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));
