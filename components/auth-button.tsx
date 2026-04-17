import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex min-w-0 items-center gap-2 sm:gap-4">
      <span className="hidden text-sm sm:inline">Hey,</span>
      <span className="max-w-[10rem] truncate text-sm sm:max-w-[14rem]">{user.email}</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="touch" variant={"outline"} className="md:h-8 md:px-3 md:text-xs">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="touch" variant={"default"} className="md:h-8 md:px-3 md:text-xs">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
