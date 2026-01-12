"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { toast } from "sonner";

interface Quiz {
  id: string;
  candidateName: string;
  candidateEmail: string;
  token: string;
  completed: boolean;
  result: {
    standardScore: number | null;
  } | null;
}

interface CandidateListProps {
  quizzes: Quiz[];
  roleId: string;
}

export function CandidateList({ quizzes, roleId }: CandidateListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(quizzes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuizzes = quizzes.slice(startIndex, endIndex);

  const handleCopyLink = (quizUrl: string, candidateName: string) => {
    navigator.clipboard.writeText(quizUrl);
    toast.success("Link copied!", {
      description: `Quiz link for ${candidateName} copied to clipboard`,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-20">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p className="text-lg font-medium">No candidates yet</p>
        <p className="text-sm mt-2">Click &quot;Add Candidate&quot; to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[220px] font-semibold pl-6 py-4">Candidate</TableHead>
              <TableHead className="font-semibold py-4">Email</TableHead>
              <TableHead className="w-[120px] font-semibold py-4">Status</TableHead>
              <TableHead className="w-[100px] text-center font-semibold py-4">Score</TableHead>
              <TableHead className="w-[280px] font-semibold py-4">Quiz Link</TableHead>
              <TableHead className="w-[140px] font-semibold pr-6 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentQuizzes.map((quiz) => {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
              const quizUrl = `${appUrl}/quiz/${quiz.token}`;
              const isCompleted = quiz.completed;

              return (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium pl-6 py-4">{quiz.candidateName}</TableCell>
                  <TableCell className="text-muted-foreground py-4">{quiz.candidateEmail}</TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={isCompleted ? "default" : "secondary"}
                      className={`${isCompleted ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'} border text-sm`}
                    >
                      {isCompleted ? 'Completed' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    {quiz.result?.standardScore !== null && quiz.result?.standardScore !== undefined ? (
                      <span className="text-xl font-bold text-primary">
                        {quiz.result.standardScore.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded text-muted-foreground truncate max-w-[180px] block">
                        {quizUrl}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyLink(quizUrl, quiz.candidateName)}
                        className="h-7 w-7 p-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 py-4">
                    <div className="flex justify-end">
                      <Link href={`/recruiter/roles/${roleId}/candidates/${quiz.id}`}>
                        <Button size="sm" variant="default" className="gap-1 h-9 text-sm px-4">
                          View Details
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, quizzes.length)} of {quizzes.length} candidates
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-9"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
