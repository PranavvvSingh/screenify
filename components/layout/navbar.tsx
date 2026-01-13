"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { RxHamburgerMenu } from "react-icons/rx";
import { HiOutlineUser, HiOutlineLogout } from "react-icons/hi";
import { RiDashboardLine, RiUserLine } from "react-icons/ri";
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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Left: Screenify Logo */}
          <Link
            href="/"
            className="font-pacifico text-[26px] text-gradient-primary hover:scale-[1.02] transition-transform duration-150 ease-out select-none"
          >
            Screenify
          </Link>

          {/* Center: Timer or other content */}
          <div className="flex-1 flex justify-center">
            {children}
          </div>

          {/* Right: Navigation + Account Menu (hide in quiz mode) */}
          {!quizMode && (
            <div className="flex items-center gap-2">
              {session ? (
                <>
                  {/* Desktop Menu */}
                  <div className="hidden md:flex items-center gap-2">
                    {/* Account Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 hover:scale-105 transition-all duration-200"
                        >
                          <RiUserLine className="h-5 w-5 text-primary" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-64 p-2 shadow-lg border-border/50 bg-white/95 backdrop-blur-sm"
                      >
                        <DropdownMenuLabel className="px-3 py-2.5">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Account
                            </p>
                            <p className="text-sm font-medium text-foreground/90 truncate">
                              {session.user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-1 bg-border/60" />
                        {isRecruiterRoute && (
                          <>
                            <DropdownMenuItem asChild className="gap-2.5 py-2.5 px-3 cursor-pointer rounded-md hover:bg-primary/10 focus:bg-primary/10 transition-colors">
                              <Link href="/recruiter">
                                <RiDashboardLine className="h-4 w-4" />
                                <span className="font-medium">Back to Dashboard</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-border/60" />
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="gap-2.5 py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 rounded-md transition-colors"
                        >
                          <HiOutlineLogout className="h-4 w-4" />
                          <span className="font-medium">Sign Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mobile Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="md:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-accent/50 transition-colors"
                      >
                        <RxHamburgerMenu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 p-2 shadow-lg border-border/50 bg-white/95 backdrop-blur-sm"
                    >
                      <DropdownMenuLabel className="px-3 py-2.5">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Account
                          </p>
                          <p className="text-sm font-medium text-foreground/90 truncate">
                            {session.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-1 bg-border/60" />
                      {isRecruiterRoute && (
                        <>
                          <DropdownMenuItem asChild className="gap-2.5 py-2.5 px-3 cursor-pointer rounded-md hover:bg-primary/10 focus:bg-primary/10 transition-colors">
                            <Link href="/recruiter">
                              <RiDashboardLine className="h-4 w-4" />
                              <span className="font-medium">Back to Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 bg-border/60" />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="gap-2.5 py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 rounded-md transition-colors"
                      >
                        <HiOutlineLogout className="h-4 w-4" />
                        <span className="font-medium">Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-9 gap-2 px-4 font-medium border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                >
                  <Link href="/">
                    <HiOutlineUser className="h-[17px] w-[17px]" />
                    Sign In
                  </Link>
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
