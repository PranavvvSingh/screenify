"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface JobDescriptionCollapsibleProps {
  description?: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceText: string;
  requirements?: string[];
}

export function JobDescriptionCollapsible({
  description,
  requiredSkills,
  preferredSkills,
  experienceText,
  requirements,
}: JobDescriptionCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const allSkills = [...requiredSkills, ...preferredSkills];

  return (
    <Card>
      <CardHeader className="border-b cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-primary rounded-full" />
            <div>
              <CardTitle className="text-xl">Job Description</CardTitle>
              <CardDescription className="text-sm">Key qualifications and skills for this position</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Description Section */}
            {description && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <h3 className="text-lg font-semibold">Role Description</h3>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Skills Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <h3 className="text-lg font-semibold">Required Skills</h3>
              </div>
              {allSkills.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {requiredSkills.map((skill, idx) => (
                    <Badge key={idx} variant="default" className="px-3 py-1.5 text-sm font-medium">
                      {skill}
                    </Badge>
                  ))}
                  {preferredSkills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No specific skills listed</p>
              )}
            </div>

            <Separator />

            {/* Experience Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <h3 className="text-lg font-semibold">Experience Required</h3>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-4 py-2 text-base font-semibold">
                  {experienceText}
                </Badge>
              </div>
            </div>

            {/* Requirements List */}
            {requirements && requirements.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <h3 className="text-lg font-semibold">Key Responsibilities & Requirements</h3>
                  </div>
                  <ul className="space-y-2 ml-6">
                    {requirements.map((req, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span className="flex-1">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
