export default function HomePage() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Tournament Control Center</h1>
        <p className="text-slate-700">
          This is the MVP shell for organizing teams, tournaments, and matches.
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">MVP modules</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>Teams</li>
          <li>Tournaments</li>
          <li>Matches</li>
        </ul>
      </div>
    </section>
  );
}
