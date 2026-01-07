import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function RoleDetailPage({ params }: { params: { roleId: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/recruiter">
          <Button variant="outline">← Back</Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Role Details</h1>
          <p className="text-muted-foreground mt-1">Role ID: {params.roleId}</p>
        </div>
        <Button variant="outline">Edit Requirements</Button>
        <Button>Generate Invite Link</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg. Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">-</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Requirements</CardTitle>
          <CardDescription>Extracted from job description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge>React</Badge>
                <Badge>TypeScript</Badge>
                <Badge>Node.js</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Experience</h3>
              <p className="text-sm text-muted-foreground">5+ years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
          <CardDescription>All candidates who applied for this role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No candidates yet</p>
            <p className="text-sm mt-2">Share the invitation link to get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
