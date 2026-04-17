import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateStudentApplicationForm } from "../../../../components/create-student-application-form";
import { createClient } from "@/lib/supabase/server";

type NewApplicationPageProps = {
  searchParams: Promise<{
    studentId?: string | string[];
    semesterId?: string | string[];
  }>;
};

// Hard-coded enum values so this page doesn't depend on Supabase RPCs.
const DEVICE_TYPES = ["laptop", "desktop", "tablet", "none"];
const OPERATING_SYSTEMS = ["windows", "mac", "chromebook", "linux", "other"];
const COMFORT_LEVELS = ["beginner", "some_experience", "intermediate"];
const INTEREST_CATEGORIES = [
  "hardware",
  "games",
  "ai_ml",
  "creative_coding",
  "real_world_impact",
];

const APPLICATION_FIELD_OPTIONS = {
  deviceTypes: DEVICE_TYPES,
  operatingSystems: OPERATING_SYSTEMS,
  comfortLevels: COMFORT_LEVELS,
  interestCategories: INTEREST_CATEGORIES,
};

export default async function NewApplicationPage({ searchParams }: NewApplicationPageProps) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/auth/login");
  }

  const resolvedSearchParams = await searchParams;
  const studentId = getSingleParamValue(resolvedSearchParams.studentId);
  const semesterId = getSingleParamValue(resolvedSearchParams.semesterId);

  if (!studentId || !semesterId) {
    return (
      <ErrorCard
        title="Missing application details"
        description="The application link is missing student or semester information."
      />
    );
  }

  const { data: studentRow, error: studentError } = await supabase
    .from("students")
    .select("id, full_name, family_id")
    .eq("id", studentId)
    .maybeSingle();

  if (studentError || !studentRow) {
    return (
      <ErrorCard
        title="Student not found"
        description="We could not find that student profile."
      />
    );
  }

  const { data: familyRow, error: familyError } = await supabase
    .from("families")
    .select("id")
    .eq("id", studentRow.family_id)
    .eq("parent_profile_id", authData.user.id)
    .maybeSingle();

  if (familyError || !familyRow) {
    return (
      <ErrorCard
        title="Not authorized"
        description="This student is not linked to your family account."
      />
    );
  }

  const { data: semesterRow, error: semesterError } = await supabase
    .from("semesters")
    .select("id, name, start_date")
    .eq("id", semesterId)
    .maybeSingle();

  if (semesterError || !semesterRow) {
    return (
      <ErrorCard
        title="Semester not found"
        description="We could not find the selected semester."
      />
    );
  }

  const { data: existingApplication } = await supabase
    .from("student_applications")
    .select("id, status")
    .eq("student_id", studentId)
    .eq("semester_id", semesterId)
    .eq("submitted_by_profile_id", authData.user.id)
    .maybeSingle();

  if (existingApplication) {
    return (
      <ErrorCard
        title="Application already submitted"
        description="You have already submitted an application for this student and semester."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Student Application</CardTitle>
          <CardDescription>
            Complete this application for {studentRow.full_name} for {semesterRow.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateStudentApplicationForm
            studentId={studentRow.id}
            studentName={studentRow.full_name}
            semesterId={semesterRow.id}
            semesterName={semesterRow.name}
            submittedByProfileId={authData.user.id}
            options={APPLICATION_FIELD_OPTIONS}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto mt-10 w-full max-w-xl px-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/protected" className="text-sm font-medium text-blue-600 hover:underline">
            Return to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function getSingleParamValue(value: string | string[] | undefined) {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value[0] ?? "" : value;
}
