import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, FileText, BarChart3, UserCheck } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RecruiterDashboard() {
  // Fetch all roles with their quizzes
  const roles = await prisma.jobRole.findMany({
    include: {
      quizzes: {
        include: {
          result: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Calculate statistics
  const totalRoles = roles.length;
  const totalCandidates = roles.reduce((sum, role) => sum + role.quizzes.length, 0);
  const pendingReviews = roles.reduce(
    (sum, role) => sum + role.quizzes.filter((q) => q.completed && !q.result?.standardScore).length,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your job roles and candidates</p>
        </div>
        <Link href="/recruiter/roles/new">
          <Button size="lg" className="shadow-soft-sm hover:shadow-soft-md transition-shadow">
            Add Job Role
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 rounded-2xl bg-card shadow-soft-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Roles</p>
              <p className="text-3xl font-bold text-foreground">{totalRoles}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card shadow-soft-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Candidates</p>
              <p className="text-3xl font-bold text-foreground">{totalCandidates}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card shadow-soft-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
              <p className="text-3xl font-bold text-foreground">{pendingReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Roles */}
      <div className="p-6 rounded-2xl bg-card shadow-soft-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Recent Roles</h2>
          <p className="text-sm text-muted-foreground mt-1">Your recently created job roles</p>
        </div>

        {roles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-medium">No roles created yet</p>
            <p className="text-sm mt-1">Create your first role to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map((role) => {
              const jdData = role.jd as {
                required_skills?: string[];
                preferred_skills?: string[];
                experience?: { min_years?: number; max_years?: number };
              };
              const allSkills = [...(jdData.required_skills || []), ...(jdData.preferred_skills || [])];
              const candidateCount = role.quizzes.length;
              const completedCount = role.quizzes.filter((q) => q.completed).length;

              return (
                <Link key={role.id} href={`/recruiter/roles/${role.id}`}>
                  <div className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-soft-sm transition-all cursor-pointer group">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                          <Briefcase className="w-5 h-5 text-primary" />
                          {role.title}
                        </h3>
                        {role.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
                        )}
                      </div>

                      {allSkills.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {allSkills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {allSkills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{allSkills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>
                            {candidateCount} candidate{candidateCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4" />
                          <span>{completedCount} completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
