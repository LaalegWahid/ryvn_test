"use client";

import { useCallback, useEffect, useState } from "react";
import { crud, Field, Item } from "../lib/api";

type Props = {
  title: string;
  base: string; // API origin, e.g. http://localhost:3001
  path: string; // resource path, e.g. /notes
  fields: Field[];
};

function emptyForm(fields: Field[]): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [f.key, ""]));
}

// Convert string form values into the typed payload the API expects,
// dropping blanks so optional fields aren't sent as empty strings.
function toPayload(fields: Field[], form: Record<string, string>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = form[f.key]?.trim() ?? "";
    if (raw === "") continue;
    out[f.key] = f.type === "number" ? Number(raw) : raw;
  }
  return out;
}

export default function CrudPanel({ title, base, path, fields }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<Record<string, string>>(emptyForm(fields));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await crud.list(base, path));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [base, path]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm(fields));
    setEditingId(null);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = toPayload(fields, form);
    try {
      if (editingId === null) {
        await crud.create(base, path, payload);
      } else {
        await crud.update(base, path, editingId, payload);
      }
      resetForm();
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setForm(
      Object.fromEntries(
        fields.map((f) => [f.key, item[f.key] == null ? "" : String(item[f.key])])
      )
    );
  }

  async function remove(id: number) {
    setError(null);
    try {
      await crud.remove(base, path, id);
      if (editingId === id) resetForm();
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-black/10 dark:border-white/15 p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-black/50 dark:text-white/50">{base}{path}</span>
      </header>

      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3">
        {fields.map((f) => (
          <label key={f.key} className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {f.label}
              {f.required && <span className="text-red-500"> *</span>}
            </span>
            {f.type === "textarea" ? (
              <textarea
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
                rows={3}
                required={f.required}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            ) : (
              <input
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
                type={f.type === "number" ? "number" : "text"}
                required={f.required}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            )}
          </label>
        ))}
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            {editingId === null ? "Create" : "Save changes"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-black/15 dark:border-white/20 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {loading && <p className="text-sm text-black/50 dark:text-white/50">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="text-sm text-black/50 dark:text-white/50">No records yet.</p>
        )}
        {items.map((item) => (
          <article
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-md border border-black/10 dark:border-white/10 px-3 py-2"
          >
            <div className="min-w-0 text-sm">
              <span className="mr-2 text-black/40 dark:text-white/40">#{item.id}</span>
              {fields.map((f) => (
                <span key={f.key} className="mr-3">
                  <span className="text-black/50 dark:text-white/50">{f.label}: </span>
                  {item[f.key] == null || item[f.key] === ""
                    ? "—"
                    : String(item[f.key])}
                </span>
              ))}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => startEdit(item)}
                className="rounded border border-black/15 dark:border-white/20 px-2 py-1 text-xs"
              >
                Edit
              </button>
              <button
                onClick={() => remove(item.id)}
                className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-600 dark:text-red-400"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
