"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { RxHamburgerMenu } from "react-icons/rx";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavbarProps {
  children?: React.ReactNode; // For timer or other center content
  quizMode?: boolean; // Hide navigation and sign-in button for quiz pages
}

export function Navbar({ children, quizMode = false }: NavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isRecruiterRoute = pathname?.startsWith("/recruiter");

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Screenify Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <h1 className="font-pacifico text-3xl  text-primary">
                Screenify
              </h1>
            </Link>

            {/* Navigation Links (only show for recruiters, hide in quiz mode) */}
            {!quizMode && session && isRecruiterRoute && (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/recruiter">
                  <Button
                    variant={pathname === "/recruiter" ? "default" : "ghost"}
                    size="sm"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/recruiter/candidates">
                  <Button
                    variant={pathname === "/recruiter/candidates" ? "default" : "ghost"}
                    size="sm"
                  >
                    Candidates
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Center: Timer or other content */}
          <div className="flex-1 flex justify-center">
            {children}
          </div>

          {/* Right: Menu Options (hide in quiz mode) */}
          {!quizMode && (
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  {/* Desktop Menu */}
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {session.user.email}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>

                  {/* Mobile Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="md:hidden">
                      <Button variant="ghost" size="icon">
                        <RxHamburgerMenu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem disabled>
                        <span className="text-sm">{session.user.email}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {isRecruiterRoute && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/recruiter">Dashboard</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/recruiter/candidates">Candidates</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={handleSignOut}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/">Sign In</Link>
                </Button>
              )}
            </div>
          )}
          {/* Spacer in quiz mode to keep logo on left */}
          {quizMode && <div className="w-20" />}
        </div>
      </div>
    </nav>
  );
}
