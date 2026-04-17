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

  if (error || !data.user) {
    redirect("/auth/login");
  }

  const { data: profileRow, error: profileLookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

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
