import { Suspense } from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AdminDashboardSection } from "./admin-dashboard-section";
import {
  ParentDashboardSection,
  type FamilyFormState,
  type ParentDashboardData,
} from "./parent-dashboard-section";
import { type AdminDashboardData } from "./admin-dashboard-section";
import { createClient } from "@/lib/supabase/server";

type DashboardRole = "admin" | "parent";
type ApplicationStatus = "accepted" | "waitlisted" | "rejected";

const initialFamilyFormState: FamilyFormState = {
  status: "idle",
  message: "",
};

export default async function ProtectedPage() {
  return (
    <Suspense
      fallback={<div className="rounded-xl border border-slate-200/15 bg-slate-900/60 p-5 text-slate-300">Loading dashboard...</div>}
    >
      <ProtectedDashboardContent />
    </Suspense>
  );
}

async function ProtectedDashboardContent() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/login");
  }

  const { data: profileLookup, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    redirect("/auth/login");
  }

  let profile = profileLookup;

  if (!profile) {
    const profileFullName =
      data.user.user_metadata?.full_name?.toString().trim() || data.user.email || "New User";
    const profileEmail = data.user.email;
    if (!profileEmail) {
      redirect("/auth/login");
    }

    const { data: insertedProfile, error: insertProfileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        full_name: profileFullName,
        email: profileEmail,
      })
      .select("is_admin")
      .single();

    if (insertProfileError) {
      redirect("/auth/login");
    }

    profile = insertedProfile;
  }

  const activeRole: DashboardRole = profile?.is_admin ? "admin" : "parent";
  const fullName = data.user.user_metadata?.full_name || data.user.email;
  let parentDashboardData: ParentDashboardData | null = null;
  let adminDashboardData: AdminDashboardData | null = null;

  if (activeRole === "parent") {
    parentDashboardData = await getParentDashboardData(data.user.id, fullName);
  } else {
    adminDashboardData = await getAdminDashboardData();
  }

  return (
    <div className="grid gap-6 pb-10">
      <section className="rounded-xl border border-slate-200/15 bg-slate-900/60 p-5">
        <p className="text-sm text-slate-300">Signed in as</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">{fullName}</h2>
        <p className="mt-2 text-sm text-slate-200">
          {activeRole === "admin"
            ? "You are viewing the admin dashboard based on your profile role."
            : "You are viewing the parent dashboard based on your profile role."}
        </p>
      </section>

      {activeRole === "admin" ? (
        <AdminDashboardSection
          data={adminDashboardData}
          onUpdateApplicationStatus={updateApplicationStatus}
        />
      ) : (
        <ParentDashboardSection
          data={parentDashboardData}
          onAddStudent={addStudentToFamily}
          onUpdateStudent={updateFamilyStudent}
          onRemoveStudent={removeFamilyStudent}
          initialFormState={initialFamilyFormState}
        />
      )}
    </div>
  );
}

async function updateApplicationStatus(formData: FormData) {
  "use server";

  const applicationId = formData.get("applicationId");
  const nextStatus = formData.get("nextStatus");

  if (typeof applicationId !== "string" || applicationId.trim().length === 0) {
    return;
  }

  if (!isValidApplicationStatus(nextStatus)) {
    return;
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile?.is_admin) {
    redirect("/protected");
  }

  await supabase
    .from("student_applications")
    .update({ status: nextStatus })
    .eq("id", applicationId);

  revalidatePath("/protected");
}

function isValidApplicationStatus(
  value: FormDataEntryValue | null,
): value is ApplicationStatus {
  return value === "accepted" || value === "waitlisted" || value === "rejected";
}

async function addStudentToFamily(
  _prevState: FamilyFormState,
  formData: FormData,
): Promise<FamilyFormState> {
  "use server";

  const invalidMessage: FamilyFormState = {
    status: "error",
    message: "Full name, relationship, and grade level are required.",
  };

  const fullName = formData.get("fullName");
  const relationshipToStudent = formData.get("relationshipToStudent");
  const gradeLevel = formData.get("gradeLevel");
  const birthDate = formData.get("birthDate");

  if (
    typeof fullName !== "string" ||
    typeof relationshipToStudent !== "string" ||
    typeof gradeLevel !== "string"
  ) {
    return invalidMessage;
  }

  const normalizedFullName = fullName.trim();
  const normalizedRelationshipToStudent = relationshipToStudent.trim();
  const normalizedGradeLevel = gradeLevel.trim();
  const normalizedBirthDate =
    typeof birthDate === "string" && birthDate.trim().length > 0
      ? birthDate.trim()
      : null;

  if (
    normalizedFullName.length === 0 ||
    normalizedRelationshipToStudent.length === 0 ||
    normalizedGradeLevel.length === 0
  ) {
    return invalidMessage;
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/auth/login");
  }

  const { data: family, error: familyError } = await supabase
    .from("families")
    .select("id")
    .eq("parent_profile_id", authData.user.id)
    .maybeSingle();

  if (familyError || !family) {
    redirect("/protected/family/create");
  }

  const { error: studentInsertError } = await supabase.from("students").insert({
    family_id: family.id,
    full_name: normalizedFullName,
    relationship_to_student: normalizedRelationshipToStudent,
    grade_level: normalizedGradeLevel,
    birth_date: normalizedBirthDate,
  });

  if (studentInsertError) {
    return {
      status: "error",
      message: "Unable to add child right now. Please try again.",
    };
  }

  revalidatePath("/protected");

  return {
    status: "success",
    message: `${normalizedFullName} was added to your family.`,
  };
}

async function updateFamilyStudent(
  _prevState: FamilyFormState,
  formData: FormData,
): Promise<FamilyFormState> {
  "use server";

  const studentId = formData.get("studentId");
  const fullName = formData.get("fullName");
  const relationshipToStudent = formData.get("relationshipToStudent");
  const gradeLevel = formData.get("gradeLevel");
  const birthDate = formData.get("birthDate");

  if (
    typeof studentId !== "string" ||
    studentId.trim().length === 0 ||
    typeof fullName !== "string" ||
    typeof relationshipToStudent !== "string" ||
    typeof gradeLevel !== "string"
  ) {
    return {
      status: "error",
      message: "Invalid student details. Please review and try again.",
    };
  }

  const normalizedFullName = fullName.trim();
  const normalizedRelationshipToStudent = relationshipToStudent.trim();
  const normalizedGradeLevel = gradeLevel.trim();
  const normalizedBirthDate =
    typeof birthDate === "string" && birthDate.trim().length > 0
      ? birthDate.trim()
      : null;

  if (
    normalizedFullName.length === 0 ||
    normalizedRelationshipToStudent.length === 0 ||
    normalizedGradeLevel.length === 0
  ) {
    return {
      status: "error",
      message: "Full name, relationship, and grade level are required.",
    };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/auth/login");
  }

  const { data: family, error: familyError } = await supabase
    .from("families")
    .select("id")
    .eq("parent_profile_id", authData.user.id)
    .maybeSingle();

  if (familyError || !family) {
    redirect("/protected/family/create");
  }

  const { error: studentUpdateError } = await supabase
    .from("students")
    .update({
      full_name: normalizedFullName,
      relationship_to_student: normalizedRelationshipToStudent,
      grade_level: normalizedGradeLevel,
      birth_date: normalizedBirthDate,
    })
    .eq("id", studentId.trim())
    .eq("family_id", family.id);

  if (studentUpdateError) {
    return {
      status: "error",
      message: "Unable to update child details right now. Please try again.",
    };
  }

  revalidatePath("/protected");

  return {
    status: "success",
    message: `${normalizedFullName}'s details were updated.`,
  };
}

async function removeFamilyStudent(
  _prevState: FamilyFormState,
  formData: FormData,
): Promise<FamilyFormState> {
  "use server";

  const studentId = formData.get("studentId");
  const studentName = formData.get("studentName");

  if (typeof studentId !== "string" || studentId.trim().length === 0) {
    return {
      status: "error",
      message: "Unable to identify this child. Please refresh and try again.",
    };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/auth/login");
  }

  const { data: family, error: familyError } = await supabase
    .from("families")
    .select("id")
    .eq("parent_profile_id", authData.user.id)
    .maybeSingle();

  if (familyError || !family) {
    redirect("/protected/family/create");
  }

  const { error: deleteError } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId.trim())
    .eq("family_id", family.id);

  if (deleteError) {
    return {
      status: "error",
      message: "Unable to remove child right now. Please try again.",
    };
  }

  revalidatePath("/protected");

  return {
    status: "success",
    message:
      typeof studentName === "string" && studentName.trim().length > 0
        ? `${studentName.trim()} was removed from your family.`
        : "Child was removed from your family.",
  };
}

async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();
  const todayIso = new Date().toISOString().slice(0, 10);

  const { data: nextSemester } = await supabase
    .from("semesters")
    .select("id, name, start_date, end_date")
    .gte("start_date", todayIso)
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!nextSemester) {
    return {
      nextSemester: null,
      applications: [],
      statusCounts: {},
      totalApplications: 0,
    };
  }

  const { data: applications } = await supabase
    .from("student_applications")
    .select(
      `id, status, submitted_at, device_available, shares_device_with_sibling, operating_system, has_coding_experience, coding_tools_used, comfort_level, student_why_join, student_what_to_build_or_learn, additional_parent_comments, students(full_name, family_id), student_interest_ratings(category, rating)`,
    )
    .eq("semester_id", nextSemester.id)
    .order("submitted_at", { ascending: false });

  const normalizedApplications: AdminDashboardData["applications"] =
    applications?.map((application) => {
      const student = Array.isArray(application.students)
        ? application.students[0]
        : application.students;
      const familyId = student?.family_id ?? null;

      return {
        id: application.id,
        studentName: student?.full_name ?? "Unknown student",
        familyName: familyId ? `Family ${familyId.slice(0, 8)}` : "Family unavailable",
        semesterName: nextSemester.name,
        submittedAt: application.submitted_at,
        status: application.status,
        deviceAvailable: application.device_available ?? null,
        sharesDeviceWithSibling: Boolean(application.shares_device_with_sibling),
        operatingSystem: application.operating_system ?? null,
        hasCodingExperience: Boolean(application.has_coding_experience),
        codingToolsUsed: application.coding_tools_used ?? null,
        comfortLevel: application.comfort_level ?? null,
        studentWhyJoin: application.student_why_join ?? null,
        studentWhatToBuildOrLearn: application.student_what_to_build_or_learn ?? null,
        additionalParentComments: application.additional_parent_comments ?? null,
        interestRatings:
          application.student_interest_ratings?.map((interestRating) => ({
            category: interestRating.category,
            rating: interestRating.rating,
          })) ?? [],
      };
    }) ?? [];

  const statusCounts: Record<string, number> = {};
  for (const application of normalizedApplications) {
    statusCounts[application.status] = (statusCounts[application.status] ?? 0) + 1;
  }

  return {
    nextSemester: {
      id: nextSemester.id,
      name: nextSemester.name,
      startDate: nextSemester.start_date,
      endDate: nextSemester.end_date,
    },
    applications: normalizedApplications,
    statusCounts,
    totalApplications: normalizedApplications.length,
  };
}

async function getParentDashboardData(
  profileId: string,
  fullName: string,
): Promise<ParentDashboardData> {
  const supabase = await createClient();

  const { data: family } = await supabase
    .from("families")
    .select(
      "id, primary_home_city, students(id, full_name, relationship_to_student, birth_date, grade_level)",
    )
    .eq("parent_profile_id", profileId)
    .maybeSingle();

  const students =
    family?.students?.map((student) => ({
      id: student.id,
      fullName: student.full_name,
      relationshipToStudent: student.relationship_to_student,
      birthDate: student.birth_date,
      gradeLevel: student.grade_level,
    })) ?? [];

  const todayIso = new Date().toISOString().slice(0, 10);

  const { data: nextSemester } = await supabase
    .from("semesters")
    .select("id, name, start_date, end_date")
    .gte("start_date", todayIso)
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  const studentApplicationsByStudentId: ParentDashboardData["studentApplicationsByStudentId"] =
    {};

  if (nextSemester && students.length > 0) {
    const studentIds = students.map((student) => student.id);

    const { data: applications } = await supabase
      .from("student_applications")
      .select("student_id, status, submitted_at")
      .eq("semester_id", nextSemester.id)
      .eq("submitted_by_profile_id", profileId)
      .in("student_id", studentIds)
      .order("submitted_at", { ascending: false });

    applications?.forEach((application) => {
      if (!studentApplicationsByStudentId[application.student_id]) {
        studentApplicationsByStudentId[application.student_id] = application.status;
      }
    });
  }

  return {
    hasFamily: Boolean(family?.id),
    family: {
      familyName: `${fullName}'s Family`,
      primaryHomeCity: family?.primary_home_city ?? null,
    },
    students,
    nextSemester: nextSemester
      ? {
          id: nextSemester.id,
          name: nextSemester.name,
          startDate: nextSemester.start_date,
          endDate: nextSemester.end_date,
        }
      : null,
    studentApplicationsByStudentId,
  };
}
