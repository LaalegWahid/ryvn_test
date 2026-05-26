// Base URLs for the two backend APIs. Override via .env.local if your ports differ.
export const NOTES_API =
  process.env.NEXT_PUBLIC_NOTES_API ?? "http://localhost:3001";
export const PERSON_API =
  process.env.NEXT_PUBLIC_PERSON_API ?? "http://localhost:3002";

export type FieldType = "text" | "textarea" | "number";

export type Field = {
  key: string;
  label: string;
  type?: FieldType; // defaults to "text"
  required?: boolean;
};

// A record always has an id; the rest of the shape depends on the resource.
export type Item = { id: number; created_at?: string } & Record<string, unknown>;

async function handle(res: Response) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

export const crud = {
  list: (base: string, path: string): Promise<Item[]> =>
    fetch(`${base}${path}`).then(handle),

  create: (base: string, path: string, data: Record<string, unknown>): Promise<Item> =>
    fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),

  update: (
    base: string,
    path: string,
    id: number,
    data: Record<string, unknown>
  ): Promise<Item> =>
    fetch(`${base}${path}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),

  remove: (base: string, path: string, id: number): Promise<unknown> =>
    fetch(`${base}${path}/${id}`, { method: "DELETE" }).then(handle),
};
