"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

export function SignInButtons() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/api/auth-callback",
    });
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      variant="outline"
      size="lg"
      className="w-full max-w-sm h-10 text-lg cursor-pointer"
    >
      <FcGoogle style={{ width: '22px', height: '22px', marginRight: '12px' }} />
      Sign in with Google
    </Button>
  );
}
