"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export type ProctoringEventType =
  | "TAB_SWITCH"
  | "FULLSCREEN_EXIT"
  | "WINDOW_BLUR"
  | "MULTIPLE_DISPLAYS";

export interface ProctoringEvent {
  type: ProctoringEventType;
  timestamp: string;
}

interface UseProctoringOptions {
  quizToken: string;
  enabled?: boolean;
  onFullscreenExit?: () => void;
  onViolation?: (event: ProctoringEvent) => void;
}

interface UseProctoringReturn {
  isFullscreen: boolean;
  requestFullscreen: () => Promise<boolean>;
  exitFullscreen: () => Promise<void>;
}

const DISPLAY_CHECK_INTERVAL = 30000; // Check for multiple displays every 30s

export function useProctoring({
  quizToken,
  enabled = true,
  onFullscreenExit,
  onViolation,
}: UseProctoringOptions): UseProctoringReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasInitializedRef = useRef(false);
  const displayCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Send a single proctoring event to the server immediately
  const sendEvent = useCallback(
    async (type: ProctoringEventType) => {
      if (!quizToken) return;

      const event: ProctoringEvent = {
        type,
        timestamp: new Date().toISOString(),
      };

      // Notify callback
      onViolation?.(event);

      // Send to server immediately
      try {
        await fetch(`/api/quiz/${quizToken}/proctoring`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });
      } catch (error) {
        console.error("Failed to send proctoring event:", error);
      }
    },
    [quizToken, onViolation]
  );

  // Request fullscreen mode
  const requestFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        return true;
      }
      // Fallback for older browsers
      const elemAny = elem as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };
      if (elemAny.webkitRequestFullscreen) {
        await elemAny.webkitRequestFullscreen();
        return true;
      }
      if (elemAny.msRequestFullscreen) {
        await elemAny.msRequestFullscreen();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
      return false;
    }
  }, []);

  // Exit fullscreen mode
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
    }
  }, []);

  // Check for multiple displays using screen.isExtended (no permission required)
  const checkMultipleDisplays = useCallback((): boolean => {
    try {
      // screen.isExtended is true when the screen is part of a multi-screen setup
      // This doesn't require user permission unlike getScreenDetails()
      if (
        "isExtended" in window.screen &&
        (window.screen as { isExtended?: boolean }).isExtended
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Handle visibility change (tab switch detection)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendEvent("TAB_SWITCH");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, sendEvent]);

  // Handle window blur (window lost focus)
  useEffect(() => {
    if (!enabled) return;

    const handleBlur = () => {
      // Only count blur if not already hidden (to avoid double-counting with tab switch)
      if (!document.hidden) {
        sendEvent("WINDOW_BLUR");
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, sendEvent]);

  // Handle fullscreen change
  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;

      // Only log exit if we were in fullscreen before and now we're not
      if (isFullscreen && !isNowFullscreen) {
        sendEvent("FULLSCREEN_EXIT");
        onFullscreenExit?.();
      }

      setIsFullscreen(isNowFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    // Safari support
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    // Set initial fullscreen state
    setIsFullscreen(!!document.fullscreenElement);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, [enabled, isFullscreen, sendEvent, onFullscreenExit]);

  // Check for multiple displays on mount and periodically
  useEffect(() => {
    if (!enabled || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const checkDisplays = () => {
      const hasMultiple = checkMultipleDisplays();
      if (hasMultiple) {
        sendEvent("MULTIPLE_DISPLAYS");
      }
    };

    // Initial check
    checkDisplays();

    // Periodic check every 30 seconds
    displayCheckIntervalRef.current = setInterval(() => {
      const hasMultiple = checkMultipleDisplays();
      if (hasMultiple) {
        sendEvent("MULTIPLE_DISPLAYS");
      }
    }, DISPLAY_CHECK_INTERVAL);

    return () => {
      if (displayCheckIntervalRef.current) {
        clearInterval(displayCheckIntervalRef.current);
      }
    };
  }, [enabled, checkMultipleDisplays, sendEvent]);

  return {
    isFullscreen,
    requestFullscreen,
    exitFullscreen,
  };
}
