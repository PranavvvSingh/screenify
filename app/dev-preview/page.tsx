import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevPreviewPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dev Preview - Candidate Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Quick access to all candidate pages without authentication
            </p>

            <Link href="/dev-preview/candidate-dashboard">
              <Button className="w-full" variant="outline">
                View Candidate Dashboard
              </Button>
            </Link>

            <Link href="/dev-preview/quiz">
              <Button className="w-full" variant="outline">
                View Quiz Page
              </Button>
            </Link>

            <Link href="/dev-preview/invite">
              <Button className="w-full" variant="outline">
                View Invite Page
              </Button>
            </Link>

            <div className="pt-4">
              <Link href="/recruiter">
                <Button className="w-full" variant="secondary">
                  Back to Recruiter Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
