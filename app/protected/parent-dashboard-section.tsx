import Link from "next/link";

type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "withdrawn"
  | string;

export type ParentDashboardData = {
  hasFamily: boolean;
  family: {
    familyName: string;
    primaryHomeCity: string | null;
  };
  students: Array<{
    id: string;
    fullName: string;
    gradeLevel: string;
  }>;
  nextSemester: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  studentApplicationsByStudentId: Record<string, ApplicationStatus>;
};

type ParentDashboardSectionProps = {
  data: ParentDashboardData | null;
};

export function ParentDashboardSection({ data }: ParentDashboardSectionProps) {
  const hasFamily = data?.hasFamily ?? false;
  const students = data?.students ?? [];
  const nextSemester = data?.nextSemester ?? null;
  const studentApplicationsByStudentId = data?.studentApplicationsByStudentId ?? {};
  const appliedCount = students.filter(
    (student) => studentApplicationsByStudentId[student.id],
  ).length;

  if (!hasFamily) {
    return (
      <section className="rounded-xl border border-blue-300/25 bg-gradient-to-br from-blue-700/20 via-indigo-700/20 to-cyan-700/20 p-8">
        <Link
          href="/protected/family/create"
          className="block w-full rounded-xl border border-blue-200/40 bg-blue-500/30 px-6 py-10 text-center text-2xl font-semibold text-white hover:bg-blue-500/40"
        >
          Hey, add your children here to get started.
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <article className="rounded-xl border border-blue-300/20 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-cyan-600/15 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">Current Family</h3>
          {data ? (
            <span className="rounded-md border border-cyan-300/40 bg-cyan-500/20 px-2 py-1 text-xs text-cyan-100">
              Live data
            </span>
          ) : (
            <span className="rounded-md border border-amber-300/40 bg-amber-500/20 px-2 py-1 text-xs text-amber-100">
              No family profile found
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200/15 bg-slate-900/55 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Family
            </p>
            <p className="mt-1 text-lg font-medium text-white">
              {data?.family.familyName ?? "Family profile missing"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200/15 bg-slate-900/55 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Primary Home City
            </p>
            <p className="mt-1 text-lg font-medium text-white">
              {data?.family.primaryHomeCity ?? "Not set"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200/15 bg-slate-900/55 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">
            Students
          </p>
          {students.length === 0 ? (
            <p className="mt-2 text-sm text-slate-300">
              No students are linked to this family yet.
            </p>
          ) : (
            <ul className="mt-2 grid gap-2">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="rounded-md border border-slate-200/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200"
                >
                  {student.fullName} · {student.gradeLevel}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      <div className="grid gap-6">
        <article className="rounded-xl border border-emerald-300/25 bg-emerald-950/30 p-5">
          <h3 className="text-xl font-semibold text-white">Next Upcoming Semester</h3>
          <p className="mt-2 text-sm text-slate-200">
            {nextSemester
              ? `${nextSemester.name} (${formatDate(nextSemester.startDate)} - ${formatDate(nextSemester.endDate)})`
              : "No upcoming semester is currently available."}
          </p>
          {nextSemester && (
            <p className="mt-2 text-sm text-emerald-100">
              {appliedCount}/{students.length} students applied
            </p>
          )}

          {!nextSemester ? (
            <p className="mt-4 text-sm text-slate-300">
              Check back soon once the next semester has been published.
            </p>
          ) : students.length === 0 ? (
            <p className="mt-4 text-sm text-slate-300">
              Add students to your family profile to apply for {nextSemester.name}.
            </p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {students.map((student) => {
                const status = studentApplicationsByStudentId[student.id];
                const hasApplied = Boolean(status);

                return (
                  <li
                    key={student.id}
                    className="rounded-md border border-slate-200/10 bg-slate-900/60 p-3"
                  >
                    <p className="font-medium text-white">{student.fullName}</p>
                    <p className="mt-1 text-xs text-slate-300">
                      {hasApplied
                        ? `Application status: ${formatStatus(status)}`
                        : "Not applied for this semester"}
                    </p>
                    <button
                      type="button"
                      className={
                        hasApplied
                          ? "mt-3 w-full rounded-md border border-emerald-300/30 bg-emerald-500/15 px-3 py-2 text-left text-sm font-medium text-emerald-100"
                          : "mt-3 w-full rounded-md border border-blue-300/40 bg-blue-500/20 px-3 py-2 text-left text-sm font-medium text-blue-100 hover:bg-blue-500/30"
                      }
                    >
                      {hasApplied
                        ? `Already applied (${formatStatus(status)})`
                        : `Apply for ${nextSemester.name}`}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="rounded-xl border border-fuchsia-300/25 bg-fuchsia-950/25 p-5">
          <h3 className="text-xl font-semibold text-white">Semester Application Snapshot</h3>
          {!nextSemester ? (
            <p className="mt-3 text-sm text-slate-300">
              No upcoming semester is available to summarize.
            </p>
          ) : students.length === 0 ? (
            <p className="mt-3 text-sm text-slate-300">
              No students found for this family.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {students.map((student) => {
                const status = studentApplicationsByStudentId[student.id];

                return (
                  <li
                    key={student.id}
                    className="rounded-md border border-slate-200/10 bg-slate-900/60 p-3"
                  >
                    <p className="font-medium text-white">{student.fullName}</p>
                    <p className="text-sm text-slate-300">{nextSemester.name}</p>
                    <p className="mt-1 text-xs text-fuchsia-100">
                      Status: {status ? formatStatus(status) : "Not applied"}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </div>
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
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
