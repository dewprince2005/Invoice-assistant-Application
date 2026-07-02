import { createFileRoute, useRouter, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Receipt, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Ledgerly" },
      { name: "description", content: "Sign in or create a vendor account to manage invoices." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const isCallback = router.state.location.pathname.startsWith("/auth/callback");

  if (isCallback) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-12">
        <div className="flex items-center gap-2 font-display text-xl font-semibold">
          <div className="grid size-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Receipt className="size-5" />
          </div>
          Ledgerly
        </div>
        <div className="space-y-6 max-w-md">
          <h1 className="font-display text-4xl leading-tight tracking-tight">
            Invoices, parsed and approved.
          </h1>
          <p className="text-sidebar-foreground/70 leading-relaxed">
            Drop a PDF or photo. Our AI reads it, pulls the line items, and routes it through your
            approval workflow — so finance teams move on hours, not days.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© Ledgerly · Built on Lovable</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-[var(--shadow-elev-2)]">
          <CardHeader className="space-y-1">
            <CardTitle className="font-display text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in or create a vendor account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin"><SignInForm /></TabsContent>
              <TabsContent value="signup"><SignUpForm /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // After Google auth, Supabase redirects here with the session tokens in the URL hash.
        // The root IndexRedirect component will detect the session and navigate to /vendor.
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message || "Google sign-in failed");
      setLoading(false);
    }
    // On success, Supabase triggers a full-page redirect to Google — no further action needed.
  }
  return (
    <Button variant="outline" type="button" className="w-full" disabled={loading} onClick={go}>
      {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : (
        <svg className="size-4 mr-2" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.9c-.26 1.37-1.04 2.53-2.22 3.31v2.75h3.59c2.1-1.93 3.23-4.78 3.23-8.07z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.68l-3.59-2.75c-1 .67-2.28 1.06-3.69 1.06-2.84 0-5.24-1.92-6.1-4.5H2.19v2.83A11 11 0 0 0 12 23z"/>
          <path fill="#FBBC05" d="M5.9 14.13a6.6 6.6 0 0 1 0-4.26V7.04H2.19a11 11 0 0 0 0 9.92l3.71-2.83z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.19 7.04l3.71 2.83C6.76 7.3 9.16 5.38 12 5.38z"/>
        </svg>
      )}
      Continue with Google
    </Button>
  );
}

function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    router.navigate({ to: "/vendor", replace: true });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <GoogleButton />
      <div className="relative text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-card px-2">or with email</span>
        <div className="absolute inset-y-1/2 inset-x-0 border-t" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input id="signin-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input id="signin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="size-4 mr-2 animate-spin" />}Sign in
      </Button>
    </form>
  );
}

function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, company_name: company },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Redirecting…");
    router.navigate({ to: "/vendor", replace: true });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <GoogleButton />
      <div className="relative text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-card px-2">or with email</span>
        <div className="absolute inset-y-1/2 inset-x-0 border-t" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="su-name">Full name</Label>
          <Input id="su-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-company">Company</Label>
          <Input id="su-company" required value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-email">Email</Label>
        <Input id="su-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-password">Password</Label>
        <Input id="su-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="size-4 mr-2 animate-spin" />}Create vendor account
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth" className="underline">Sign in</Link>
      </p>
    </form>
  );
}
