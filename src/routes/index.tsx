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
    // Listen for auth state changes first — this catches the SIGNED_IN event
    // that fires when Supabase auto-processes the #access_token hash after Google OAuth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.navigate({ to: "/vendor", replace: true });
      } else {
        // Only redirect to /auth if there's definitely no session
        supabase.auth.getUser().then(({ data }) => {
          if (!data.user) router.navigate({ to: "/auth", replace: true });
        });
      }
    });

    // Also do an immediate check in case auth state has already resolved
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.navigate({ to: "/vendor", replace: true });
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}
