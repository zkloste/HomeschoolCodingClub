"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "withdrawn"
  | string;

export type FamilyFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type ParentDashboardData = {
  hasFamily: boolean;
  family: {
    familyName: string;
    primaryHomeCity: string | null;
  };
  students: Array<{
    id: string;
    fullName: string;
    relationshipToStudent: string;
    birthDate: string | null;
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
  onAddStudent: (
    state: FamilyFormState,
    formData: FormData,
  ) => Promise<FamilyFormState>;
  onUpdateStudent: (
    state: FamilyFormState,
    formData: FormData,
  ) => Promise<FamilyFormState>;
  onRemoveStudent: (
    state: FamilyFormState,
    formData: FormData,
  ) => Promise<FamilyFormState>;
  initialFormState: FamilyFormState;
};

export function ParentDashboardSection({
  data,
  onAddStudent,
  onUpdateStudent,
  onRemoveStudent,
  initialFormState,
}: ParentDashboardSectionProps) {
  const hasFamily = data?.hasFamily ?? false;
  const students = data?.students ?? [];
  const nextSemester = data?.nextSemester ?? null;
  const studentApplicationsByStudentId = data?.studentApplicationsByStudentId ?? {};
  const appliedCount = students.filter(
    (student) => studentApplicationsByStudentId[student.id],
  ).length;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const editingStudent =
    students.find((student) => student.id === editingStudentId) ?? null;

  if (!hasFamily) {
    return (
      <section className="rounded-lg border border-zinc-700 bg-zinc-900 p-8">
        <Link
          href="/protected/family/create"
          className="block w-full rounded-lg border border-zinc-600 bg-zinc-800 px-6 py-10 text-center text-2xl font-semibold text-zinc-100 hover:bg-zinc-700"
        >
          Hey, add your children here to get started.
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <article className="rounded-lg border border-zinc-700 bg-zinc-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-zinc-100">Current Family</h3>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Family
            </p>
            <p className="mt-1 text-lg font-medium text-zinc-100">
              {data?.family.familyName ?? "Family profile missing"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Primary Home City
            </p>
            <p className="mt-1 text-lg font-medium text-zinc-100">
              {data?.family.primaryHomeCity ?? "Not set"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-950 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            Students
          </p>
          {students.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-400">
              No students are linked to this family yet.
            </p>
          ) : (
            <ul className="mt-2 grid gap-2">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="rounded-md border border-zinc-700 bg-zinc-900 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{student.fullName}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {student.relationshipToStudent} · {student.gradeLevel}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Birth date: {student.birthDate ? formatDate(student.birthDate) : "Not set"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingStudentId(student.id)}
                      className="rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-left text-sm font-medium text-zinc-100 hover:bg-zinc-700"
          >
            Add child
          </button>
        </div>
      </article>

      <div className="grid gap-6">
        <article className="rounded-lg border border-zinc-700 bg-zinc-900 p-5">
          <h3 className="text-xl font-semibold text-zinc-100">Next Upcoming Semester</h3>
          <p className="mt-2 text-sm text-zinc-300">
            {nextSemester
              ? `${nextSemester.name} (${formatDate(nextSemester.startDate)} - ${formatDate(nextSemester.endDate)})`
              : "No upcoming semester is currently available."}
          </p>
          {nextSemester && (
            <p className="mt-2 text-sm text-zinc-300">
              {appliedCount}/{students.length} students applied
            </p>
          )}

          {!nextSemester ? (
            <p className="mt-4 text-sm text-zinc-400">
              Check back soon once the next semester has been published.
            </p>
          ) : students.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-400">
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
                    className="rounded-md border border-zinc-700 bg-zinc-950 p-3"
                  >
                    <p className="font-medium text-zinc-100">{student.fullName}</p>
                    {hasApplied ? (
                      <p className="mt-2">
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${getParentStatusBadgeClass(status)}`}
                        >
                          Application status: {formatStatus(status)}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-zinc-400">Not applied for this semester</p>
                    )}
                    {hasApplied ? (
                      <span className="mt-3 block w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-left text-sm font-medium text-zinc-200">
                        {`Already applied (${formatStatus(status)})`}
                      </span>
                    ) : (
                      <Link
                        href={`/protected/applications/new?studentId=${encodeURIComponent(student.id)}&semesterId=${encodeURIComponent(nextSemester.id)}`}
                        className="mt-3 block w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-left text-sm font-medium text-zinc-100 hover:bg-zinc-700"
                      >
                        {`Apply for ${nextSemester.name}`}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="rounded-lg border border-zinc-700 bg-zinc-900 p-5">
          <h3 className="text-xl font-semibold text-zinc-100">Semester Application Snapshot</h3>
          {!nextSemester ? (
            <p className="mt-3 text-sm text-zinc-400">
              No upcoming semester is available to summarize.
            </p>
          ) : students.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">
              No students found for this family.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {students.map((student) => {
                const status = studentApplicationsByStudentId[student.id];

                return (
                  <li
                    key={student.id}
                    className="rounded-md border border-zinc-700 bg-zinc-950 p-3"
                  >
                    <p className="font-medium text-zinc-100">{student.fullName}</p>
                    <p className="text-sm text-zinc-400">{nextSemester.name}</p>
                    <p className="mt-2">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${getParentStatusBadgeClass(status)}`}
                      >
                        Status: {status ? formatStatus(status) : "Not applied"}
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </div>

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStudent={onAddStudent}
        initialFormState={initialFormState}
      />
      <EditStudentModal
        student={editingStudent}
        onClose={() => setEditingStudentId(null)}
        onUpdateStudent={onUpdateStudent}
        onRemoveStudent={onRemoveStudent}
        initialFormState={initialFormState}
      />
    </section>
  );
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getParentStatusBadgeClass(status?: string) {
  switch (status) {
    case "accepted":
      return "border-emerald-400/50 bg-emerald-500/20 text-emerald-200";
    case "pending":
      return "border-amber-400/50 bg-amber-500/20 text-amber-200";
    case "waitlisted":
      return "border-yellow-400/50 bg-yellow-500/20 text-yellow-200";
    case "rejected":
      return "border-rose-400/50 bg-rose-500/20 text-rose-200";
    default:
      return "border-zinc-600 bg-zinc-800 text-zinc-300";
  }
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AddStudentModal({
  isOpen,
  onClose,
  onAddStudent,
  initialFormState,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (
    state: FamilyFormState,
    formData: FormData,
  ) => Promise<FamilyFormState>;
  initialFormState: FamilyFormState;
}) {
  const [state, formAction] = useActionState(onAddStudent, initialFormState);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    firstInputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (state.status === "success") {
      onClose();
    }
  }, [onClose, state.status]);

  if (!isOpen) {
    return null;
  }

  return (
    <ModalShell title="Add child" onClose={onClose}>
      <form action={formAction} className="grid gap-3">
        <input
          ref={firstInputRef}
          type="text"
          name="fullName"
          placeholder="Child full name"
          required
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
        />
        <input
          type="text"
          name="relationshipToStudent"
          placeholder="Relationship to student"
          required
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
        />
        <input
          type="text"
          name="gradeLevel"
          placeholder="Grade level"
          required
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
        />
        <label className="grid gap-1 text-xs text-zinc-400">
          Birth date (optional)
          <input
            type="date"
            name="birthDate"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
        <div className="mt-1 flex items-center gap-2">
          <ActionButton
            label="Add child to family"
            pendingLabel="Adding child..."
            className="rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
        <FormMessage state={state} />
      </form>
    </ModalShell>
  );
}

function EditStudentModal({
  student,
  onClose,
  onUpdateStudent,
  onRemoveStudent,
  initialFormState,
}: {
  student: ParentDashboardData["students"][number] | null;
  onClose: () => void;
  onUpdateStudent: (
    state: FamilyFormState,
    formData: FormData,
  ) => Promise<FamilyFormState>;
  onRemoveStudent: (
    state: FamilyFormState,
    formData: FormData,
  ) => Promise<FamilyFormState>;
  initialFormState: FamilyFormState;
}) {
  const [updateState, updateAction] = useActionState(
    onUpdateStudent,
    initialFormState,
  );
  const [removeState, removeAction] = useActionState(
    onRemoveStudent,
    initialFormState,
  );
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!student) {
      return;
    }

    firstInputRef.current?.focus();
  }, [student]);

  useEffect(() => {
    if (updateState.status === "success" || removeState.status === "success") {
      onClose();
    }
  }, [onClose, removeState.status, updateState.status]);

  if (!student) {
    return null;
  }

  return (
    <ModalShell title="Edit child" onClose={onClose}>
      <form action={updateAction} className="grid gap-2">
        <input type="hidden" name="studentId" value={student.id} />
        <input
          ref={firstInputRef}
          type="text"
          name="fullName"
          defaultValue={student.fullName}
          required
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
        <input
          type="text"
          name="relationshipToStudent"
          defaultValue={student.relationshipToStudent}
          required
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            name="gradeLevel"
            defaultValue={student.gradeLevel}
            required
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <input
            type="date"
            name="birthDate"
            defaultValue={student.birthDate ?? ""}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <ActionButton
            label="Save changes"
            pendingLabel="Saving..."
            className="rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
        <FormMessage state={updateState} />
      </form>
      <form action={removeAction} className="mt-2">
        <input type="hidden" name="studentId" value={student.id} />
        <input type="hidden" name="studentName" value={student.fullName} />
        <ActionButton
          label="Remove child"
          pendingLabel="Removing..."
          className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-left text-sm font-medium text-zinc-100 hover:bg-zinc-700"
        />
        <FormMessage state={removeState} />
      </form>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-lg border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-zinc-100">{title}</h4>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function FormMessage({ state }: { state: FamilyFormState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <p
      className={`text-sm ${
        state.status === "success" ? "text-zinc-300" : "text-zinc-400"
      }`}
    >
      {state.message}
    </p>
  );
}
