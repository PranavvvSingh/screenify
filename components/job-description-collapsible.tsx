"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, FileText, Layers, Briefcase, CheckCircle } from "lucide-react";

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
    <div className="rounded-2xl bg-card shadow-soft-md overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground">Job Description</h3>
            <p className="text-sm text-muted-foreground">Key qualifications and skills for this position</p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable Content */}
      {isOpen && (
        <div className="px-6 pb-6 pt-2 space-y-6 border-t border-border">
          {/* Description Section */}
          {description && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">Role Description</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                {description}
              </p>
            </div>
          )}

          {/* Skills Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Required Skills</h4>
            </div>
            {allSkills.length > 0 ? (
              <div className="flex gap-2 flex-wrap pl-7">
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
              <p className="text-muted-foreground text-sm pl-7">No specific skills listed</p>
            )}
          </div>

          {/* Experience Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Experience Required</h4>
            </div>
            <div className="pl-7">
              <Badge variant="outline" className="px-4 py-2 text-base font-semibold">
                {experienceText}
              </Badge>
            </div>
          </div>

          {/* Requirements List */}
          {requirements && requirements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">Key Responsibilities & Requirements</h4>
              </div>
              <ul className="space-y-2 pl-7">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="flex-1">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
