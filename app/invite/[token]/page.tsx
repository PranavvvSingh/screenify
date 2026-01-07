import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function InvitePage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">You're Invited!</h1>
          <p className="text-muted-foreground">
            Complete your application for a technical position
          </p>
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
            <CardDescription>Sign in and upload your resume to begin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                Sign in with GitHub
              </Button>
              <Button className="w-full" variant="outline" size="lg">
                Sign in with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume">Upload Resume (PDF)</Label>
                <Input id="resume" type="file" accept=".pdf" disabled />
                <p className="text-xs text-muted-foreground">
                  Sign in first to upload your resume
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Sign in with your preferred OAuth provider</p>
            <p>2. Upload your resume (we'll extract relevant information)</p>
            <p>3. Take a 45-minute AI-generated technical assessment</p>
            <p>4. Get instant results and wait for recruiter review</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
