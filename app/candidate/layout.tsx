import { Navbar } from "@/components/layout/navbar";

// Note: No authentication required for candidates
// Candidates access quizzes via unique token links (validated in individual pages)
export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
