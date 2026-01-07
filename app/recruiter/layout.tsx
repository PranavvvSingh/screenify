import { requireRecruiter } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRecruiter();
  } catch {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Screenify</h1>
            <p className="text-sm text-muted-foreground">Recruiter Dashboard</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
