import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function DevInvitePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">You&apos;re Invited!</h1>
          <Link href="/dev-preview">
            <Button variant="ghost" size="sm">← Back to Dev Menu</Button>
          </Link>
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
            <CardDescription>Sign in to begin your application</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Sign in with Google</p>
            <p>2. Complete your profile in the candidate dashboard</p>
            <p>3. Upload your resume</p>
            <p>4. Take a technical assessment</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
