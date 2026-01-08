import { requireRecruiter } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

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
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
