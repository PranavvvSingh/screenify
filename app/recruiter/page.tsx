import { Button } from "@/components/ui/button";
import { Users, FileText, BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/db";
import { RolesList } from "@/components/roles-list";

export const dynamic = "force-dynamic";

export default async function RecruiterDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          </div>
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
              <p className="text-3xl font-bold text-foreground">{stats.totalRoles}</p>
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
              <p className="text-3xl font-bold text-foreground">{stats.totalCandidates}</p>
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
              <p className="text-3xl font-bold text-foreground">{stats.pendingReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roles List */}
      <div className="p-6 rounded-2xl bg-card shadow-soft-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Job Roles</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your job roles</p>
        </div>

        <RolesList />
      </div>
    </div>
  );
}
