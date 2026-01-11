import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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
  const allSkills = [...requiredSkills, ...preferredSkills];

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
        <Button size="lg" className="mt-2">Add Candidate</Button>
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
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-primary rounded-full" />
            <div>
              <CardTitle className="text-xl">Role Requirements</CardTitle>
              <CardDescription className="text-sm">Key qualifications and skills for this position</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Description Section */}
            {role.description && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <h3 className="text-lg font-semibold">Role Description</h3>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {role.description}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Skills Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <h3 className="text-lg font-semibold">Required Skills</h3>
              </div>
              {allSkills.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {requiredSkills.map((skill, idx) => (
                    <Badge key={idx} variant="default" className="px-3 py-1.5 text-sm font-medium">
                      {skill}
                    </Badge>
                  ))}
                  {preferredSkills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No specific skills listed</p>
              )}
            </div>

            <Separator />

            {/* Experience Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <h3 className="text-lg font-semibold">Experience Required</h3>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-4 py-2 text-base font-semibold">
                  {experienceText}
                </Badge>
              </div>
            </div>

            {/* Requirements List */}
            {jdData.requirements && jdData.requirements.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <h3 className="text-lg font-semibold">Key Responsibilities & Requirements</h3>
                  </div>
                  <ul className="space-y-2 ml-6">
                    {jdData.requirements.map((req, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span className="flex-1">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Candidates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Candidates</CardTitle>
          <CardDescription>All candidates who applied for this role</CardDescription>
        </CardHeader>
        <CardContent>
          {totalCandidates === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-20">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p className="text-lg font-medium">No candidates yet</p>
              <p className="text-sm mt-2">Upload candidate resumes to get started</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Candidate list will appear here</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
