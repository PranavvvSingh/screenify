import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RecruiterDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your job roles and candidates</p>
        </div>
        <Link href="/recruiter/roles/new">
          <Button size="lg">Create New Job Role</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Roles</CardTitle>
            <CardDescription>Active job openings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Candidates</CardTitle>
            <CardDescription>Across all roles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Awaiting evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Roles</CardTitle>
          <CardDescription>Your recently created job roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No roles created yet</p>
            <p className="text-sm mt-2">Create your first role to get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
