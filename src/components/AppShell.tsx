import { Link, useRouter } from "@tanstack/react-router";
import { Receipt, Upload, LogOut, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppShell({ children, role }: { children: ReactNode; role?: string }) {
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
          <div className="grid size-8 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Receipt className="size-4" />
          </div>
          <div className="font-display font-semibold text-lg tracking-tight">Ledgerly</div>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1 text-sm">
          <NavLink to="/vendor" icon={<FileText className="size-4" />}>My invoices</NavLink>
          <NavLink to="/vendor/upload" icon={<Upload className="size-4" />}>Upload</NavLink>
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs uppercase tracking-wide opacity-60">{role ?? "Vendor"}</div>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={signOut}>
            <LogOut className="size-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur px-4 md:hidden">
        <div className="flex items-center gap-2 font-display font-semibold">
          <Receipt className="size-4" /> Ledgerly
        </div>
        <Button size="sm" variant="ghost" onClick={signOut}>
          <LogOut className="size-4" />
        </Button>
      </header>

      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

function NavLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
      activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
      activeOptions={{ exact: true }}
    >
      {icon}
      {children}
    </Link>
  );
}
