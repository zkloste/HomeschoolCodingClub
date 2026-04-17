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
    deviceAvailable: string | null;
    sharesDeviceWithSibling: boolean;
    operatingSystem: string | null;
    hasCodingExperience: boolean;
    codingToolsUsed: string | null;
    comfortLevel: string | null;
    studentWhyJoin: string | null;
    studentWhatToBuildOrLearn: string | null;
    additionalParentComments: string | null;
    interestRatings: Array<{
      category: string;
      rating: number;
    }>;
  }>;
  statusCounts: Record<string, number>;
  totalApplications: number;
};

type AdminDashboardSectionProps = {
  data: AdminDashboardData | null;
  onUpdateApplicationStatus: (formData: FormData) => Promise<void>;
};

export function AdminDashboardSection({
  data,
  onUpdateApplicationStatus,
}: AdminDashboardSectionProps) {
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
            {applications.map((application) => {
              const statusUi = getApplicationStatusUi(application.status);

              return (
                <details
                  key={application.id}
                  className={`rounded-lg border bg-slate-900/65 p-4 ${statusUi.cardClass}`}
                >
                  <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-medium text-white">
                        {application.studentName}
                      </p>
                      <p className="text-sm text-slate-300">
                        {application.familyName} · {application.semesterName}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        Click to {`expand/collapse`} full application
                      </p>
                    </div>
                    <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusUi.badgeClass}`}>
                      {statusUi.label}
                    </span>
                  </div>
                  </summary>

                <p className="mt-3 text-sm text-slate-300">
                  Submitted {formatDate(application.submittedAt)}
                </p>

                <dl className="mt-4 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Device available
                    </dt>
                    <dd>{formatValue(application.deviceAvailable)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Shares device with sibling
                    </dt>
                    <dd>{application.sharesDeviceWithSibling ? "Yes" : "No"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Operating system
                    </dt>
                    <dd>{formatValue(application.operatingSystem)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Coding experience
                    </dt>
                    <dd>{application.hasCodingExperience ? "Yes" : "No"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Coding tools used
                    </dt>
                    <dd>{formatValue(application.codingToolsUsed)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Comfort level
                    </dt>
                    <dd>{formatValue(application.comfortLevel, true)}</dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Why does the student want to join?
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {formatValue(application.studentWhyJoin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      What does the student want to build or learn?
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {formatValue(application.studentWhatToBuildOrLearn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Additional parent comments
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {formatValue(application.additionalParentComments)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Student interest ratings
                  </p>
                  {application.interestRatings.length > 0 ? (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {application.interestRatings.map((rating) => (
                        <div
                          key={rating.category}
                          className="rounded-md border border-slate-300/20 bg-slate-800/60 px-3 py-2 text-sm text-slate-200"
                        >
                          <span className="text-slate-300">
                            {formatStatus(rating.category)}
                          </span>
                          <span className="float-right font-semibold">{rating.rating}/5</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-300">No ratings submitted.</p>
                  )}
                </div>

                <form action={onUpdateApplicationStatus} className="mt-4 flex flex-wrap gap-2">
                  <input type="hidden" name="applicationId" value={application.id} />
                  <button
                    type="submit"
                    name="nextStatus"
                    value="accepted"
                    disabled={application.status === "accepted"}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${getStatusButtonClass(application.status, "accepted")}`}
                  >
                    {application.status === "accepted" ? "Accepted" : "Accept"}
                  </button>
                  <button
                    type="submit"
                    name="nextStatus"
                    value="waitlisted"
                    disabled={application.status === "waitlisted"}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${getStatusButtonClass(application.status, "waitlisted")}`}
                  >
                    {application.status === "waitlisted" ? "Waitlisted" : "Waitlist"}
                  </button>
                  <button
                    type="submit"
                    name="nextStatus"
                    value="rejected"
                    disabled={application.status === "rejected"}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${getStatusButtonClass(application.status, "rejected")}`}
                  >
                    {application.status === "rejected" ? "Rejected" : "Reject"}
                  </button>
                </form>
                </details>
              );
            })}
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

function formatValue(value: string | null, formatUnderscores = false) {
  if (!value) {
    return "Not provided";
  }

  if (!formatUnderscores) {
    return value;
  }

  return formatStatus(value);
}

function getApplicationStatusUi(status: string) {
  switch (status) {
    case "accepted":
      return {
        label: "Accepted",
        cardClass: "border-emerald-300/35",
        badgeClass: "border-emerald-300/50 bg-emerald-500/25 text-emerald-100",
      };
    case "waitlisted":
      return {
        label: "Waitlisted",
        cardClass: "border-amber-300/35",
        badgeClass: "border-amber-300/50 bg-amber-500/25 text-amber-100",
      };
    case "rejected":
      return {
        label: "Rejected",
        cardClass: "border-rose-300/35",
        badgeClass: "border-rose-300/50 bg-rose-500/25 text-rose-100",
      };
    default:
      return {
        label: formatStatus(status),
        cardClass: "border-violet-300/30",
        badgeClass: "border-violet-300/40 bg-violet-500/20 text-violet-100",
      };
  }
}

function getStatusButtonClass(currentStatus: string, buttonStatus: string) {
  if (currentStatus === buttonStatus) {
    switch (buttonStatus) {
      case "accepted":
        return "border-emerald-300/70 bg-emerald-500/40 text-emerald-50";
      case "waitlisted":
        return "border-amber-300/70 bg-amber-500/40 text-amber-50";
      case "rejected":
        return "border-rose-300/70 bg-rose-500/40 text-rose-50";
      default:
        return "border-slate-300/40 bg-slate-500/25 text-slate-100";
    }
  }

  switch (buttonStatus) {
    case "accepted":
      return "border-emerald-300/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30";
    case "waitlisted":
      return "border-amber-300/40 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30";
    case "rejected":
      return "border-rose-300/40 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30";
    default:
      return "border-slate-300/30 bg-slate-500/20 text-slate-200 hover:bg-slate-500/30";
  }
}
