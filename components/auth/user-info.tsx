"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "@/lib/auth-client";
import type { Session } from "@/types/auth";

export function UserInfo() {
  const { data: session, isPending } = useSession() as { data: Session | null; isPending: boolean };

  if (isPending) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Info</CardTitle>
        <CardDescription>Currently signed in</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Name: {session.user.name}</p>
          <p className="text-sm font-medium">Email: {session.user.email}</p>
          <p className="text-xs text-muted-foreground mt-2">ID: {session.user.id}</p>
        </div>
        <Button onClick={handleSignOut} variant="destructive" className="w-full">
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}
