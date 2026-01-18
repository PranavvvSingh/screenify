"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Loader2,
  Search,
  X,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  Users,
  UserCheck,
  Briefcase,
} from "lucide-react";

interface Role {
  id: string;
  title: string;
  description: string | null;
  jd: {
    required_skills?: string[];
    preferred_skills?: string[];
    experience?: { min_years?: number; max_years?: number };
  };
  createdAt: string;
  quizzes: {
    id: string;
    status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "TERMINATED" | "EXPIRED" | "TIMED_OUT";
    result: { standardScore: number | null } | null;
  }[];
}

interface RolesResponse {
  roles: Role[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
}

export function RolesList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());

    if (search) params.set("search", search);
    params.set("sortOrder", sortOrder);

    return params.toString();
  }, [currentPage, search, sortOrder]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/recruiter/roles?${queryString}`);
      if (!response.ok) throw new Error("Failed to fetch roles");

      const data: RolesResponse = await response.json();
      setRoles(data.roles);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSearch = () => {
    setCurrentPage(1);
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
    setSearch("");
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Initial loading state
  if (loading && roles.length === 0 && !search) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mt-4">Loading roles...</p>
      </div>
    );
  }

  // Empty state - no roles at all
  if (total === 0 && !search) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium text-foreground">No roles created yet</p>
        <p className="text-sm text-muted-foreground mt-1">Create your first role to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search and Sort Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 h-10 bg-background border-border/60 focus:border-primary/40 transition-colors"
          />
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={handleSearch}
          className="h-10 px-5 font-medium border! border-primary! text-primary hover:bg-primary/10! hover:text-primary"
        >
          Search
        </Button>

        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="h-10 px-3 text-muted-foreground hover:text-foreground gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="h-9 w-9 p-0 border-border/60"
            title={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
          >
            <ArrowUpDown className={`h-4 w-4 transition-transform duration-200 ${sortOrder === "asc" ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {roles.length === 0 && search ? (
        // Empty filtered state
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border/60 rounded-xl bg-muted/20">
          <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-base font-medium text-foreground">No matching roles</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search</p>
          <Button variant="outline" size="sm" onClick={handleClearSearch} className="mt-4">
            Clear search
          </Button>
        </div>
      ) : loading ? (
        // Loading state within search
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground mt-3">Loading...</p>
        </div>
      ) : (
        // Role Cards
        <div className="space-y-4">
          {roles.map((role) => {
            const allSkills = [...(role.jd.required_skills || []), ...(role.jd.preferred_skills || [])];
            const candidateCount = role.quizzes.length;
            const completedCount = role.quizzes.filter((q) => q.status === "SUBMITTED" || q.status === "TERMINATED").length;

            return (
              <Link key={role.id} href={`/recruiter/roles/${role.id}`}>
                <div className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-soft-sm transition-all cursor-pointer group">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                          <Briefcase className="w-5 h-5 text-primary" />
                          {role.title}
                        </h3>
                        {role.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    {allSkills.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {allSkills.slice(0, 5).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {allSkills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{allSkills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>
                          {candidateCount} candidate{candidateCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        <span>{completedCount} completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * 10 + 1}</span> to{" "}
            <span className="font-medium text-foreground">{Math.min(currentPage * 10, total)}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> roles
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-3 gap-1 border-border/60"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-7 w-7 p-0 font-medium ${
                      pageNum === currentPage
                        ? "shadow-none"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 px-3 gap-1 border-border/60"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
