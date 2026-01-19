"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  X,
  ArrowUpDown,
  Copy,
  ChevronRight,
  Users,
  Filter,
  ChevronLeft,
} from "lucide-react";

interface Quiz {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidateStatus: "PENDING" | "SHORTLISTED" | "REJECTED";
  token: string;
  status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "TERMINATED" | "EXPIRED" | "TIMED_OUT";
  createdAt: string;
  result: {
    standardScore: number | null;
    verificationStatus: "VERIFIED" | "QUESTIONABLE" | "DISCREPANCY" | null;
    submittedAt: string | null;
  } | null;
}

interface CandidateListProps {
  roleId: string;
  initialTotal?: number;
}

interface CandidatesResponse {
  quizzes: Quiz[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
}

interface Filters {
  search: string;
  quizStatus: string;
  candidateStatus: string;
  verificationStatus: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export function CandidateList({ roleId, initialTotal = 0 }: CandidateListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<Filters>({
    search: "",
    quizStatus: "",
    candidateStatus: "",
    verificationStatus: "",
    sortBy: "score",
    sortOrder: "desc",
  });

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());

    if (filters.search) params.set("search", filters.search);
    if (filters.quizStatus) params.set("quizStatus", filters.quizStatus);
    if (filters.candidateStatus) params.set("candidateStatus", filters.candidateStatus);
    if (filters.verificationStatus) params.set("verificationStatus", filters.verificationStatus);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

    return params.toString();
  }, [currentPage, filters]);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/role/${roleId}/candidates?${queryString}`);
      if (!response.ok) throw new Error("Failed to fetch candidates");

      const data: CandidatesResponse = await response.json();
      setQuizzes(data.quizzes);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  }, [roleId, buildQueryString]);

  // Re-fetch when initialTotal changes (e.g., after router.refresh() when a candidate is added)
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates, initialTotal]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setCurrentPage(1);
    const newValue = value === "all" ? "" : value;
    setFilters((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setCurrentPage(1);
    setFilters({
      search: "",
      quizStatus: "",
      candidateStatus: "",
      verificationStatus: "",
      sortBy: "score",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.quizStatus ||
    filters.candidateStatus ||
    filters.verificationStatus;

  const toggleSortOrder = () => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handleCopyLink = (quizUrl: string, candidateName: string) => {
    navigator.clipboard.writeText(quizUrl);
    toast.success("Link copied!", {
      description: `Quiz link for ${candidateName} copied to clipboard`,
    });
  };

  // Initial loading state
  if (loading && quizzes.length === 0 && !hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mt-4">Loading candidates...</p>
      </div>
    );
  }

  // Empty state - no candidates at all
  if (total === 0 && initialTotal === 0 && !hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium text-foreground">No candidates yet</p>
        <p className="text-sm text-muted-foreground mt-1">Add your first candidate to get started</p>
      </div>
    );
  }

  // Badge configurations
  const getQuizStatusConfig = (quiz: Quiz) => {
    switch (quiz.status) {
      case "SUBMITTED":
      case "TERMINATED":
        return { label: "Completed", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "IN_PROGRESS":
        return { label: "In Progress", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case "EXPIRED":
        return { label: "Expired", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" };
      case "TIMED_OUT":
        return { label: "Timed Out", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" };
      case "PENDING":
      default:
        return { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
    }
  };

  const getVerificationConfig = (status: string | null | undefined) => {
    if (!status) return null;
    return {
      VERIFIED: { label: "Verified", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
      QUESTIONABLE: { label: "Questionable", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
      DISCREPANCY: { label: "Discrepancy", className: "bg-red-500/10 text-red-600 border-red-500/20" },
    }[status] || null;
  };

  const activeFilterCount = [
    filters.search,
    filters.quizStatus,
    filters.candidateStatus,
    filters.verificationStatus,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4">
        {/* Search Row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or email..."
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

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-10 px-3 text-muted-foreground hover:text-foreground gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                {activeFilterCount}
              </span>
            )}
          </div>

          <div className="w-px h-5 bg-border/60" />

          <Select
            value={filters.quizStatus || "all"}
            onValueChange={(value) => handleFilterChange("quizStatus", value)}
          >
            <SelectTrigger className={`h-9 w-auto min-w-[120px] gap-2 text-sm ${filters.quizStatus ? 'border-primary/50 bg-primary/5 text-primary' : 'border-border/60'}`}>
              <SelectValue placeholder="Quiz Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.candidateStatus || "all"}
            onValueChange={(value) => handleFilterChange("candidateStatus", value)}
          >
            <SelectTrigger className={`h-9 w-auto min-w-[120px] gap-2 text-sm ${filters.candidateStatus ? 'border-primary/50 bg-primary/5 text-primary' : 'border-border/60'}`}>
              <SelectValue placeholder="Decision" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Decisions</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.verificationStatus || "all"}
            onValueChange={(value) => handleFilterChange("verificationStatus", value)}
          >
            <SelectTrigger className={`h-9 w-auto min-w-[130px] gap-2 text-sm ${filters.verificationStatus ? 'border-primary/50 bg-primary/5 text-primary' : 'border-border/60'}`}>
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verification</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="QUESTIONABLE">Questionable</SelectItem>
              <SelectItem value="DISCREPANCY">Discrepancy</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-5 bg-border/60" />

          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <SelectTrigger className="h-9 w-auto min-w-[110px] gap-2 text-sm border-border/60">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="createdAt">Date Added</SelectItem>
              <SelectItem value="completedAt">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="h-9 w-9 p-0 border-border/60"
            title={`Sort ${filters.sortOrder === "asc" ? "ascending" : "descending"}`}
          >
            <ArrowUpDown className={`h-4 w-4 transition-transform duration-200 ${filters.sortOrder === "asc" ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {quizzes.length === 0 && hasActiveFilters ? (
        // Empty filtered state
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border/60 rounded-xl bg-muted/20">
          <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-base font-medium text-foreground">No matching candidates</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">
            Clear all filters
          </Button>
        </div>
      ) : quizzes.length === 0 ? (
        // Loading state within filters
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground mt-3">Loading...</p>
        </div>
      ) : (
        // Candidate Cards Grid
        <div className="space-y-3 pt-6">
          {quizzes.map((quiz, index) => {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const quizUrl = `${appUrl}/quiz/${quiz.token}`;
            const statusConfig = getQuizStatusConfig(quiz);
            const verificationConfig = getVerificationConfig(quiz.result?.verificationStatus);

            return (
              <div
                key={quiz.id}
                className="group relative bg-background border border-border/60 rounded-xl p-5 hover:border-border hover:shadow-soft-md transition-all duration-200"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-5">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {quiz.candidateName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-foreground truncate">{quiz.candidateName}</h4>
                      <p className="text-sm text-muted-foreground truncate">{quiz.candidateEmail}</p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <Badge variant="outline" className={`${statusConfig.className} border font-medium text-xs px-2.5 py-1`}>
                      {statusConfig.label}
                    </Badge>
                    {verificationConfig && (
                      <Badge variant="outline" className={`${verificationConfig.className} border font-medium text-xs px-2.5 py-1`}>
                        {verificationConfig.label}
                      </Badge>
                    )}
                  </div>

                  {/* Score */}
                  <div className="w-20 flex-shrink-0 text-center">
                    {quiz.result?.standardScore !== null && quiz.result?.standardScore !== undefined ? (
                      <div>
                        <span className="text-2xl font-bold text-foreground tabular-nums">
                          {quiz.result.standardScore.toFixed(0)}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Quiz Link */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <code className="text-xs bg-muted/60 px-3 py-1.5 rounded-md text-muted-foreground font-mono truncate max-w-[140px] border border-border/40">
                      {quiz.token.slice(0, 12)}...
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyLink(quizUrl, quiz.candidateName)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* View Button */}
                  <Link href={`/recruiter/roles/${roleId}/candidates/${quiz.id}`}>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-9 px-4 gap-1.5 font-medium shadow-none"
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 0 && totalPages > 0 && (
        <div className="flex items-center justify-between pt-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * 10 + 1}</span> to{" "}
            <span className="font-medium text-foreground">{Math.min(currentPage * 10, total)}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> candidates
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
