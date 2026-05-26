const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// Uses the project URL + secret key. The secret key bypasses RLS and must
// stay server-side only — never ship it to a browser/frontend.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ── SELECT all notes ──────────────────────────────────────────────
app.get("/notes", async (req, res) => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("id", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── SELECT one note by id ─────────────────────────────────────────
app.get("/notes/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Note not found" });
  res.json(data);
});

// ── INSERT a new note ─────────────────────────────────────────────
// Body: { title, content }
app.post("/notes", async (req, res) => {
  const { title, content } = req.body;
  const { data, error } = await supabase
    .from("notes")
    .insert({ title, content })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// ── UPDATE a note by id ───────────────────────────────────────────
// Body: { title, content }  (send only the fields you want to change)
app.put("/notes/:id", async (req, res) => {
  const { title, content } = req.body;
  const patch = {};
  if (title !== undefined) patch.title = title;
  if (content !== undefined) patch.content = content;

  const { data, error } = await supabase
    .from("notes")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Note not found" });
  res.json(data);
});

// ── DELETE a note by id ───────────────────────────────────────────
app.delete("/notes/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", req.params.id)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Note not found" });
  res.json({ message: "Deleted", note: data });
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));
