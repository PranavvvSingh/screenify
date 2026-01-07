import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function NewRolePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/recruiter">
          <Button variant="outline">← Back</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Role</h1>
          <p className="text-muted-foreground mt-1">Upload a job description to get started</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Description Upload</CardTitle>
          <CardDescription>Upload a PDF file containing the job description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" placeholder="e.g. Senior Full Stack Developer" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jd-file">Job Description (PDF)</Label>
            <Input id="jd-file" type="file" accept=".pdf" />
            <p className="text-sm text-muted-foreground">
              Upload a PDF containing the full job description, requirements, and responsibilities
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Notes (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional context or requirements..."
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1">
              Process & Extract Requirements
            </Button>
            <Link href="/recruiter">
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. We'll extract key requirements from your job description</p>
          <p>2. You'll review and edit the extracted requirements</p>
          <p>3. Generate an invitation link to share with candidates</p>
          <p>4. Candidates take AI-generated quizzes based on the role requirements</p>
        </CardContent>
      </Card>
    </div>
  );
}
