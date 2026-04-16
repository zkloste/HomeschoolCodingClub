const adminApplications = [
  {
    id: "APP-1001",
    studentName: "Ava Johnson",
    familyName: "Johnson Family",
    semester: "Fall 2026",
    submittedAt: "2026-04-10",
    status: "Pending Review",
    notes: "Very interested in game development and robotics.",
  },
  {
    id: "APP-1002",
    studentName: "Mason Lee",
    familyName: "Lee Family",
    semester: "Fall 2026",
    submittedAt: "2026-04-09",
    status: "Waitlist Suggested",
    notes: "Needs an afternoon schedule option due to sports.",
  },
  {
    id: "APP-1003",
    studentName: "Sophia Carter",
    familyName: "Carter Family",
    semester: "Fall 2026",
    submittedAt: "2026-04-07",
    status: "Pending Review",
    notes: "Returning family with one sibling already enrolled.",
  },
];

export function AdminDashboardSection() {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-amber-300/25 bg-amber-950/30 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-100">
            Pending
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">14</p>
        </article>
        <article className="rounded-xl border border-emerald-300/25 bg-emerald-950/30 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-100">
            Accepted
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">26</p>
        </article>
        <article className="rounded-xl border border-fuchsia-300/25 bg-fuchsia-950/30 p-4">
          <p className="text-xs uppercase tracking-wide text-fuchsia-100">
            Waitlisted
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">5</p>
        </article>
      </div>

      <article className="rounded-xl border border-violet-300/20 bg-gradient-to-br from-violet-600/10 via-purple-600/10 to-fuchsia-600/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">
            Current Student Applications
          </h3>
          <span className="rounded-md border border-cyan-300/40 bg-cyan-500/20 px-2 py-1 text-xs text-cyan-100">
            Placeholder data only
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {adminApplications.map((application) => (
            <article
              key={application.id}
              className="rounded-lg border border-slate-200/15 bg-slate-900/65 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-medium text-white">
                    {application.studentName}
                  </p>
                  <p className="text-sm text-slate-300">
                    {application.familyName} · {application.semester}
                  </p>
                </div>
                <span className="rounded-md border border-violet-300/40 bg-violet-500/20 px-2 py-1 text-xs text-violet-100">
                  {application.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-300">
                Submitted {application.submittedAt}
              </p>
              <p className="mt-2 text-sm text-slate-200">{application.notes}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md border border-emerald-300/40 bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-100 hover:bg-emerald-500/30"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="rounded-md border border-amber-300/40 bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-100 hover:bg-amber-500/30"
                >
                  Waitlist
                </button>
                <button
                  type="button"
                  className="rounded-md border border-rose-300/40 bg-rose-500/20 px-3 py-1.5 text-sm font-medium text-rose-100 hover:bg-rose-500/30"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
