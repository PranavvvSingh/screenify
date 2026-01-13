import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddCandidateModalWrapper } from "@/components/add-candidate-modal-wrapper";
import { CandidateList } from "@/components/candidate-list";
import { JobDescriptionCollapsible } from "@/components/job-description-collapsible";
import { Users, CheckCircle, BarChart3, ArrowLeft } from "lucide-react";

export default async function RoleDetailPage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;

  // Fetch role data from database
  const role = await prisma.jobRole.findUnique({
    where: { id: roleId },
    include: {
      quizzes: {
        include: {
          result: true
        }
      }
    }
  });

  if (!role) {
    notFound();
  }

  // Parse JD data
  const jdData = role.jd as {
    job_title?: string;
    description?: string;
    requirements?: string[];
    required_skills?: string[];
    preferred_skills?: string[];
    experience?: { min_years?: number; max_years?: number };
  };

  // Calculate statistics
  const totalCandidates = role.quizzes.length;
  const completedAssessments = role.quizzes.filter(q => q.completed).length;
  const avgScore = completedAssessments > 0
    ? role.quizzes
        .filter(q => q.result?.standardScore)
        .reduce((sum, q) => sum + (q.result?.standardScore || 0), 0) / completedAssessments
    : null;

  const requiredSkills = jdData.required_skills || [];
  const preferredSkills = jdData.preferred_skills || [];

  const experienceText = jdData.experience?.min_years && jdData.experience?.max_years
    ? `${jdData.experience.min_years}-${jdData.experience.max_years} years`
    : jdData.experience?.min_years
    ? `${jdData.experience.min_years}+ years`
    : "Not specified";

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/recruiter">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{role.title}</h1>
          </div>
        </div>
        <AddCandidateModalWrapper roleId={roleId} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 rounded-2xl bg-card shadow-soft-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Candidates</p>
              <p className="text-3xl font-bold text-foreground">{totalCandidates}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card shadow-soft-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Assessments</p>
              <p className="text-3xl font-bold text-foreground">{completedAssessments}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card shadow-soft-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-3xl font-bold text-foreground">
                {avgScore !== null ? `${avgScore.toFixed(0)}%` : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Requirements Section */}
      <JobDescriptionCollapsible
        description={role.description}
        requiredSkills={requiredSkills}
        preferredSkills={preferredSkills}
        experienceText={experienceText}
        requirements={jdData.requirements}
      />

      {/* Candidates Section */}
      <div className="p-6 rounded-2xl bg-card shadow-soft-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Candidates</h2>
          <p className="text-sm text-muted-foreground mt-1">All candidates for this role</p>
        </div>
        <CandidateList quizzes={role.quizzes} roleId={roleId} />
      </div>
    </div>
  );
}
