import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CreateFamilyForm } from "../../../../components/create-family-form";

export default async function CreateFamilyPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  // #region agent log
  void fetch("http://127.0.0.1:7600/ingest/2eb5e1b4-0706-42ca-af3e-7d483411f459", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "ac198a",
    },
    body: JSON.stringify({
      sessionId: "ac198a",
      runId: "initial",
      hypothesisId: "H2",
      location: "app/protected/family/create/page.tsx:15",
      message: "Create family page auth state",
      data: {
        hasUser: Boolean(data.user),
        hasAuthError: Boolean(error),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (error || !data.user) {
    redirect("/auth/login");
  }

  const { data: profileRow, error: profileLookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();
  // #region agent log
  void fetch("http://127.0.0.1:7600/ingest/2eb5e1b4-0706-42ca-af3e-7d483411f459", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "ac198a",
    },
    body: JSON.stringify({
      sessionId: "ac198a",
      runId: "initial",
      hypothesisId: "H1",
      location: "app/protected/family/create/page.tsx:28",
      message: "Profile row lookup for current user",
      data: {
        profileExists: Boolean(profileRow?.id),
        profileLookupErrorCode: profileLookupError?.code ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const { data: existingFamily } = await supabase
    .from("families")
    .select("id")
    .eq("parent_profile_id", data.user.id)
    .maybeSingle();

  if (existingFamily) {
    redirect("/protected");
  }

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create your family</CardTitle>
            <CardDescription>
              Add your family profile to get started with student enrollment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateFamilyForm parentProfileId={data.user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
