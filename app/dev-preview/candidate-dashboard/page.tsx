import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import Link from "next/link";

export default function DevCandidateDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
              <p className="text-muted-foreground mt-2">Track your assessment status and results</p>
            </div>
            <Link href="/dev-preview">
              <Button variant="outline" size="sm">← Dev Menu</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Assessment Status</CardTitle>
              <CardDescription>Current quiz and completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No active assessments</p>
                <p className="text-sm mt-2">
                  You'll see your assessment details here once you accept an invitation
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">0%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-full bg-primary rounded-full" style={{ width: "0%" }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Complete your profile by accepting an invitation and uploading your resume
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Assessments Taken</span>
                  <Badge>0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Score</span>
                  <Badge>-</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>What to expect from the assessment process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Accept an invitation link from a recruiter</p>
              <p>2. Sign in with Google</p>
              <p>3. Upload your resume for profile extraction</p>
              <p>4. Take the AI-generated technical assessment</p>
              <p>5. View your results and wait for recruiter review</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
