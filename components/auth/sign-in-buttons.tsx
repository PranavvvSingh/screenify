"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function SignInButtons() {
  const handleGitHubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/recruiter",
    });
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/recruiter",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Choose your preferred authentication method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={handleGitHubSignIn} variant="outline" className="w-full">
          Sign in with GitHub
        </Button>
        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
