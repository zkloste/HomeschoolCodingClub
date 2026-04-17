import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function EnvVarWarning() {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      <Badge variant={"outline"} className="max-w-full truncate font-normal">
        Supabase environment variables required
      </Badge>
      <div className="flex flex-wrap gap-2">
        <Button size="touch" variant={"outline"} className="md:h-8 md:px-3 md:text-xs" disabled>
          Sign in
        </Button>
        <Button size="touch" variant={"default"} className="md:h-8 md:px-3 md:text-xs" disabled>
          Sign up
        </Button>
      </div>
    </div>
  );
}
