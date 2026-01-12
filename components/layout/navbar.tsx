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
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Screenify Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="font-pacifico text-2xl text-gradient-primary">
              Screenify
            </Link>

            {/* Navigation Links (only show for recruiters, hide in quiz mode) */}
            {!quizMode && session && isRecruiterRoute && (
              <div className="hidden md:flex items-center gap-1">
                <Link href="/recruiter">
                  <Button
                    variant={pathname === "/recruiter" ? "default" : "ghost"}
                    size="sm"
                    className="h-9"
                  >
                    Dashboard
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
                  <div className="hidden md:flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {session.user.email}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleSignOut} className="h-9">
                      Sign Out
                    </Button>
                  </div>

                  {/* Mobile Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="md:hidden">
                      <Button variant="ghost" size="icon" className="h-9 w-9">
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
                <Button variant="outline" size="sm" asChild className="h-9">
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
