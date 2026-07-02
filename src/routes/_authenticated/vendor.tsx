import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/vendor")({
  ssr: false,
  component: () => (
    <AppShell role="Vendor">
      <Outlet />
    </AppShell>
  ),
});
