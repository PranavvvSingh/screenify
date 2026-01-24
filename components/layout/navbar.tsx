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
            className="font-pacifico text-2xl text-gradient-primary select-none pb-1"
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
                          className="relative h-10 w-10 rounded-full bg-linear-to-br from-primary/90 to-primary hover:from-primary hover:to-primary/90 hover:scale-[1.05] transition-all duration-300 shadow-soft-sm hover:shadow-soft-md border-2 border-white/30 group"
                        >
                          <span className="text-sm font-semibold text-white select-none">
                            {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                          </span>
                          <span className="absolute inset-0 rounded-full bg-accent/0 group-hover:bg-accent/10 transition-colors duration-300" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-72 p-0 shadow-soft-lg border-border/40 bg-white rounded-2xl overflow-hidden"
                      >
                        {/* Header with gradient background */}
                        <div className="px-4 py-3 bg-linear-to-br from-primary/5 via-accent/5 to-transparent border-b border-border/40">
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-soft-sm border-2 border-white">
                              <span className="text-sm font-bold text-white">
                                {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                                Account
                              </p>
                              <p className="text-sm font-medium text-foreground truncate">
                                {session.user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5">
                          {isRecruiterRoute && (
                            <>
                              <DropdownMenuItem asChild className="gap-2.5 py-2 px-3 cursor-pointer rounded-xl hover:bg-primary/8 focus:bg-primary/8 transition-all group">
                                <Link href="/recruiter" className="flex items-center">
                                  <div className="h-7 w-7 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                                    <RiDashboardLine className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="font-medium text-foreground/90 group-hover:text-foreground">Back to Dashboard</span>
                                </Link>
                              </DropdownMenuItem>
                              <div className="h-px bg-border/50 my-1.5 mx-2" />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={handleSignOut}
                            className="gap-2.5 py-2 px-3 cursor-pointer rounded-xl hover:bg-destructive/8 focus:bg-destructive/8 transition-all group"
                          >
                            <div className="h-7 w-7 rounded-lg bg-destructive/10 group-hover:bg-destructive/15 flex items-center justify-center transition-colors">
                              <HiOutlineLogout className="h-4 w-4 text-destructive" />
                            </div>
                            <span className="font-medium text-destructive/90 group-hover:text-destructive">Sign Out</span>
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mobile Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="md:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg hover:bg-primary/10 transition-all duration-200"
                      >
                        <RxHamburgerMenu className="h-5 w-5 text-foreground/70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-72 p-0 shadow-soft-lg border-border/40 bg-white rounded-2xl overflow-hidden"
                    >
                      {/* Header with gradient background */}
                      <div className="px-4 py-3 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent border-b border-border/40">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-soft-sm border-2 border-white">
                            <span className="text-sm font-bold text-white">
                              {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                              Account
                            </p>
                            <p className="text-sm font-medium text-foreground truncate">
                              {session.user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5">
                        {isRecruiterRoute && (
                          <>
                            <DropdownMenuItem asChild className="gap-2.5 py-2 px-3 cursor-pointer rounded-xl hover:bg-primary/8 focus:bg-primary/8 transition-all group">
                              <Link href="/recruiter" className="flex items-center">
                                <div className="h-7 w-7 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                                  <RiDashboardLine className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium text-foreground/90 group-hover:text-foreground">Back to Dashboard</span>
                              </Link>
                            </DropdownMenuItem>
                            <div className="h-px bg-border/50 my-1.5 mx-2" />
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="gap-2.5 py-2 px-3 cursor-pointer rounded-xl hover:bg-destructive/8 focus:bg-destructive/8 transition-all group"
                        >
                          <div className="h-7 w-7 rounded-lg bg-destructive/10 group-hover:bg-destructive/15 flex items-center justify-center transition-colors">
                            <HiOutlineLogout className="h-4 w-4 text-destructive" />
                          </div>
                          <span className="font-medium text-destructive/90 group-hover:text-destructive">Sign Out</span>
                        </DropdownMenuItem>
                      </div>
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
