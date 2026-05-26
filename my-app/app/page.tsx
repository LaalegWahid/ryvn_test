import CrudPanel from "./components/CrudPanel";
import { NOTES_API, PERSON_API } from "./lib/api";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 sm:p-10">
      <div>
        <h1 className="text-2xl font-bold">CRUD Dashboard</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Frontend for the notes-api and person-api backends.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CrudPanel
          title="Notes"
          base={NOTES_API}
          path="/notes"
          fields={[
            { key: "title", label: "Title", required: true },
            { key: "content", label: "Content", type: "textarea" },
          ]}
        />
        <CrudPanel
          title="People"
          base={PERSON_API}
          path="/people"
          fields={[
            { key: "name", label: "Name", required: true },
            { key: "family_name", label: "Family name" },
            { key: "age", label: "Age", type: "number" },
          ]}
        />
      </div>
    </main>
  );
}
