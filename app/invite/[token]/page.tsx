// DEPRECATED: This page is from the old invitation-based flow
// TODO: Repurpose this route for token-based quiz access
// New architecture: Recruiter uploads resume → creates quiz with unique token → candidate accesses via this route

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">You&apos;re Invited!</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>Senior Full Stack Developer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Required Skills</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge>React</Badge>
                <Badge>TypeScript</Badge>
                <Badge>Node.js</Badge>
                <Badge>PostgreSQL</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Experience</h3>
              <p className="text-sm text-muted-foreground">5+ years in full-stack development</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Ready to begin your assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg">
              Start Quiz
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Do not switch tabs or exit fullscreen mode during the assessment</p>
            <p>• Your progress is automatically saved</p>
            <p>• You can't skip questions and return to them later</p>
            <p>• The assessment will auto-submit when time expires</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
