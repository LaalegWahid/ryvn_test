const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// Secret key bypasses RLS and must stay server-side only.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const TABLE = "person"; // created unquoted, so Postgres stores it lowercase

// ── SELECT all people ─────────────────────────────────────────────
app.get("/people", async (req, res) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("id", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── SELECT one person by id ───────────────────────────────────────
app.get("/people/:id", async (req, res) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Person not found" });
  res.json(data);
});

// ── INSERT a new person ───────────────────────────────────────────
// Body: { name, family_name, age }  (name is required)
app.post("/people", async (req, res) => {
  const { name, family_name, age } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ name, family_name, age })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// ── UPDATE a person by id ─────────────────────────────────────────
// Body: { name, family_name, age }  (send only the fields you want to change)
app.put("/people/:id", async (req, res) => {
  const { name, family_name, age } = req.body;
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (family_name !== undefined) patch.family_name = family_name;
  if (age !== undefined) patch.age = age;

  if (Object.keys(patch).length === 0)
    return res.status(400).json({ error: "No fields to update" });

  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Person not found" });
  res.json(data);
});

// ── DELETE a person by id ─────────────────────────────────────────
app.delete("/people/:id", async (req, res) => {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", req.params.id)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Person not found" });
  res.json({ message: "Deleted", person: data });
});

app.listen(3002, () => console.log("Person API running on http://localhost:3002"));
