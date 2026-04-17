import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AdminDashboardSection } from "./admin-dashboard-section";
import {
  ParentDashboardSection,
  type ParentDashboardData,
} from "./parent-dashboard-section";
import { type AdminDashboardData } from "./admin-dashboard-section";
import { createClient } from "@/lib/supabase/server";

type DashboardRole = "admin" | "parent";

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
        <AdminDashboardSection data={adminDashboardData} />
      ) : (
        <ParentDashboardSection data={parentDashboardData} />
      )}
    </div>
  );
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
    .select("id, status, submitted_at, student_why_join, students(full_name, family_id)")
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
        notes: application.student_why_join ?? "",
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
    .select("id, primary_home_city, students(id, full_name, grade_level)")
    .eq("parent_profile_id", profileId)
    .maybeSingle();

  const students =
    family?.students?.map((student) => ({
      id: student.id,
      fullName: student.full_name,
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
