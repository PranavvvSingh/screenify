"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

interface SignInButtonsProps {
  variant?: "default" | "cta";
}

export function SignInButtons({ variant = "default" }: SignInButtonsProps) {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/api/auth-callback",
    });
  };

  if (variant === "cta") {
    return (
      <button
        onClick={handleGoogleSignIn}
        className="group relative px-6 py-2 rounded-xl border-2 border-primary bg-transparent text-primary font-semibold text-base tracking-wide cursor-pointer transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-soft-md active:scale-[0.98]"
      >
        <span className="flex items-center gap-2">
          Get Started
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </button>
    );
  }

  return (
    <Button
      onClick={handleGoogleSignIn}
      variant="outline"
      size="default"
      className="text-base cursor-pointer"
    >
      <FcGoogle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
      Sign in with Google
    </Button>
  );
}
