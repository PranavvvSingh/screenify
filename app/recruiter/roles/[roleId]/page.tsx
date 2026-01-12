import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddCandidateModalWrapper } from "@/components/add-candidate-modal-wrapper";
import { CandidateList } from "@/components/candidate-list";
import { JobDescriptionCollapsible } from "@/components/job-description-collapsible";

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
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <Link href="/recruiter">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                Back
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{role.title}</h1>
            {jdData.job_title && jdData.job_title !== role.title && (
              <p className="text-lg text-muted-foreground mt-1">{jdData.job_title}</p>
            )}
          </div>
        </div>
        <AddCandidateModalWrapper roleId={roleId} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-3xl font-bold text-primary">{totalCandidates}</p>
            <p className="text-xs text-muted-foreground mt-0.5">candidates applied</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Assessments</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-3xl font-bold text-blue-500">{completedAssessments}</p>
            <p className="text-xs text-muted-foreground mt-0.5">assessments completed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-3xl font-bold text-green-500">
              {avgScore !== null ? `${avgScore.toFixed(0)}%` : '-'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">across all assessments</p>
          </CardContent>
        </Card>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Candidates</h2>
          </div>
        </div>
        <CandidateList quizzes={role.quizzes} roleId={roleId} />
      </div>
    </div>
  );
}
