"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Monitor } from "lucide-react";

interface FullscreenModalProps {
  open: boolean;
  onRequestFullscreen: () => void;
}

/**
 * Blocking modal shown when user exits fullscreen
 * Cannot be dismissed - user must return to fullscreen to continue
 */
export function FullscreenModal({
  open,
  onRequestFullscreen,
}: FullscreenModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Monitor className="h-6 w-6 text-warning" />
            </div>
            <div>
              <AlertDialogTitle>Fullscreen Required</AlertDialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                This activity has been recorded
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-base">
          You exited fullscreen mode. Please return to fullscreen to continue
          the assessment. This violation has been logged.
        </AlertDialogDescription>
        <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
          <strong>Note:</strong> Multiple violations may affect your assessment
          results. Please remain in fullscreen mode until you complete the quiz.
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onRequestFullscreen}>
            Return to Fullscreen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
