import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  component: IndexRedirect,
});

function IndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.navigate({ to: "/auth", replace: true });
        return;
      }
      router.navigate({ to: "/vendor", replace: true });
    })();
  }, [router]);
  return (
    <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>
  );
}
