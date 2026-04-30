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
        <article className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            Pending
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-100">{pendingCount}</p>
        </article>
        <article className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            Accepted
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-100">{acceptedCount}</p>
        </article>
        <article className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            Waitlisted
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-100">{waitlistedCount}</p>
        </article>
      </div>

      <article className="rounded-lg border border-zinc-700 bg-zinc-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-zinc-100">
            Current Student Applications
          </h3>
          {data?.nextSemester ? (
            <span className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
              {data.nextSemester.name} ({data.totalApplications} total)
            </span>
          ) : null}
        </div>

        {!hasUpcomingSemester ? (
          <p className="mt-4 text-sm text-zinc-300">
            No upcoming semester is currently available.
          </p>
        ) : applications.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-300">
            {`No applications have been submitted for ${data?.nextSemester?.name} yet.`}
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {applications.map((application) => {
              const statusUi = getApplicationStatusUi(application.status);

              return (
                <details
                  key={application.id}
                  className={`rounded-lg border bg-zinc-950 p-4 ${statusUi.cardClass}`}
                >
                  <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-medium text-zinc-100">
                        {application.studentName}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {application.familyName} · {application.semesterName}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Click to {`expand/collapse`} full application
                      </p>
                    </div>
                    <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusUi.badgeClass}`}>
                      {statusUi.label}
                    </span>
                  </div>
                  </summary>

                <p className="mt-3 text-sm text-zinc-400">
                  Submitted {formatDate(application.submittedAt)}
                </p>

                <dl className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-zinc-500">
                      Device available
                    </dt>
                    <dd>{formatValue(application.deviceAvailable)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-zinc-500">
                      Shares device with sibling
                    </dt>
                    <dd>{application.sharesDeviceWithSibling ? "Yes" : "No"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-zinc-500">
                      Operating system
                    </dt>
                    <dd>{formatValue(application.operatingSystem)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-zinc-500">
                      Coding experience
                    </dt>
                    <dd>{application.hasCodingExperience ? "Yes" : "No"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-zinc-500">
                      Coding tools used
                    </dt>
                    <dd>{formatValue(application.codingToolsUsed)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-zinc-500">
                      Comfort level
                    </dt>
                    <dd>{formatValue(application.comfortLevel, true)}</dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Why does the student want to join?
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {formatValue(application.studentWhyJoin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      What does the student want to build or learn?
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {formatValue(application.studentWhatToBuildOrLearn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Additional parent comments
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {formatValue(application.additionalParentComments)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Student interest ratings
                  </p>
                  {application.interestRatings.length > 0 ? (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {application.interestRatings.map((rating) => (
                        <div
                          key={rating.category}
                          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300"
                        >
                          <span className="text-zinc-400">
                            {formatStatus(rating.category)}
                          </span>
                          <span className="float-right font-semibold">{rating.rating}/5</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-400">No ratings submitted.</p>
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
        cardClass: "border-zinc-600",
        badgeClass: "border-zinc-500 bg-zinc-800 text-zinc-200",
      };
    case "waitlisted":
      return {
        label: "Waitlisted",
        cardClass: "border-zinc-600",
        badgeClass: "border-zinc-500 bg-zinc-800 text-zinc-200",
      };
    case "rejected":
      return {
        label: "Rejected",
        cardClass: "border-zinc-600",
        badgeClass: "border-zinc-500 bg-zinc-800 text-zinc-200",
      };
    default:
      return {
        label: formatStatus(status),
        cardClass: "border-zinc-600",
        badgeClass: "border-zinc-500 bg-zinc-800 text-zinc-200",
      };
  }
}

function getStatusButtonClass(currentStatus: string, buttonStatus: string) {
  if (currentStatus === buttonStatus) {
    switch (buttonStatus) {
      case "accepted":
        return "border-zinc-500 bg-zinc-700 text-zinc-100";
      case "waitlisted":
        return "border-zinc-500 bg-zinc-700 text-zinc-100";
      case "rejected":
        return "border-zinc-500 bg-zinc-700 text-zinc-100";
      default:
        return "border-zinc-500 bg-zinc-700 text-zinc-100";
    }
  }

  switch (buttonStatus) {
    case "accepted":
      return "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700";
    case "waitlisted":
      return "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700";
    case "rejected":
      return "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700";
    default:
      return "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700";
  }
}
