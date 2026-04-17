export type AdminDashboardData = {
  nextSemester: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  applications: Array<{
    id: string;
    studentName: string;
    familyName: string;
    semesterName: string;
    submittedAt: string;
    status: string;
    notes: string;
  }>;
  statusCounts: Record<string, number>;
  totalApplications: number;
};

type AdminDashboardSectionProps = {
  data: AdminDashboardData | null;
};

export function AdminDashboardSection({ data }: AdminDashboardSectionProps) {
  const pendingCount = data?.statusCounts.pending ?? 0;
  const acceptedCount = data?.statusCounts.accepted ?? 0;
  const waitlistedCount = data?.statusCounts.waitlisted ?? 0;
  const hasUpcomingSemester = Boolean(data?.nextSemester);
  const applications = data?.applications ?? [];

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-amber-300/25 bg-amber-950/30 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-100">
            Pending
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">{pendingCount}</p>
        </article>
        <article className="rounded-xl border border-emerald-300/25 bg-emerald-950/30 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-100">
            Accepted
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">{acceptedCount}</p>
        </article>
        <article className="rounded-xl border border-fuchsia-300/25 bg-fuchsia-950/30 p-4">
          <p className="text-xs uppercase tracking-wide text-fuchsia-100">
            Waitlisted
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">{waitlistedCount}</p>
        </article>
      </div>

      <article className="rounded-xl border border-violet-300/20 bg-gradient-to-br from-violet-600/10 via-purple-600/10 to-fuchsia-600/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">
            Current Student Applications
          </h3>
          {data?.nextSemester ? (
            <span className="rounded-md border border-cyan-300/40 bg-cyan-500/20 px-2 py-1 text-xs text-cyan-100">
              {data.nextSemester.name} ({data.totalApplications} total)
            </span>
          ) : null}
        </div>

        {!hasUpcomingSemester ? (
          <p className="mt-4 text-sm text-slate-200">
            No upcoming semester is currently available.
          </p>
        ) : applications.length === 0 ? (
          <p className="mt-4 text-sm text-slate-200">
            {`No applications have been submitted for ${data?.nextSemester?.name} yet.`}
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {applications.map((application) => (
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
                      {application.familyName} · {application.semesterName}
                    </p>
                  </div>
                  <span className="rounded-md border border-violet-300/40 bg-violet-500/20 px-2 py-1 text-xs text-violet-100">
                    {formatStatus(application.status)}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-300">
                  Submitted {formatDate(application.submittedAt)}
                </p>
                {application.notes ? (
                  <p className="mt-2 text-sm text-slate-200">{application.notes}</p>
                ) : null}

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
        )}
      </article>
    </section>
  );
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
