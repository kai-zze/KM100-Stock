import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "admin" | "staff";
  onToggleMobileNav?: (open: boolean) => void;
  isMobileNavOpen?: boolean;
}

interface TourStep {
  id: string;
  targetId: string;
  fallbackTargetId?: string;
  section: string;
  title: string;
  description: string;
  tip?: string;
  preferredPlacement?: "top" | "bottom" | "left" | "right";
}

interface Position {
  top: number;
  left: number;
  placement: "top" | "bottom" | "left" | "right";
  arrowLeft?: number;
  arrowTop?: number;
}

export const OnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userRole = "staff",
  onToggleMobileNav,
  isMobileNavOpen,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [position, setPosition] = useState<Position>({
    top: 100,
    left: 100,
    placement: "bottom",
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const TOUR_STEPS: TourStep[] = [
    {
      id: "facilities",
      targetId: "tour-sidebar",
      fallbackTargetId: "tour-mobile-drawer",
      section: "FACILITIES",
      title: "Facility & Workshop Navigation",
      description: isMobile
        ? "This slide-in drawer displays all training rooms and labs. Tap any room to view its equipment, or 'All rooms' for the master register."
        : "Switch between training rooms, labs, and workshops. Click 'All rooms' for the institution-wide register, or '+ Add room' to register a new facility.",
      tip: isMobile
        ? "You can reopen this rooms drawer anytime by tapping the ☰ Menu button in the top left."
        : "Shortcut: Press Ctrl + B (or Cmd + B) to toggle the sidebar.",
      preferredPlacement: isMobile ? "bottom" : "right",
    },
    {
      id: "kpis",
      targetId: "tour-kpis",
      section: "METRICS",
      title: "Live Counters & Quick Filters",
      description:
        "Real-time tally of total items, active stock, and equipment requiring maintenance or disposal. Click any KPI card to instantly filter the table.",
      tip: "Clicking 'Need attention' filters for equipment marked Needs Repair.",
      preferredPlacement: "bottom",
    },
    {
      id: "search-filters",
      targetId: "tour-search-filters",
      section: "SEARCH",
      title: "Search & Attribute Filtering",
      description:
        "Search equipment names, remarks, or serial numbers in real time without reloading. Filter by category, condition, or customize visible columns.",
      preferredPlacement: "bottom",
    },
    {
      id: "steppers",
      targetId: "tour-quantity-stepper",
      fallbackTargetId: "tour-table",
      section: "INLINE CONTROLS",
      title: "Direct Quantity Steppers (+ / −)",
      description:
        "Click '+' or '−' to adjust physical stock counts on the spot, or click the number to enter exact counts. Changes synchronize instantly to the cloud.",
      tip: "Clicking any item row opens full equipment specs and asset tag printing.",
      preferredPlacement: "bottom",
    },
    {
      id: "row-actions",
      targetId: "tour-row-actions",
      fallbackTargetId: "tour-table",
      section: "TABLE ACTIONS",
      title: "Edit & Delete Equipment",
      description:
        "Click 'Edit' to update item specifications, change room assignments, or record remarks. Click 'Delete' to permanently remove depleted or decommissioned equipment.",
      tip: "Destructive deletions always prompt a confirmation dialog to prevent accidental data loss.",
      preferredPlacement: "top",
    },
    {
      id: "add-item",
      targetId: "tour-add-item",
      fallbackTargetId: "tour-add-item-overview",
      section: "ENROLLMENT",
      title: "Registering New Equipment",
      description:
        "Click '+ Add item' to enroll new tools, machinery, computers, or consumables with model names, initial quantities, and condition grades.",
      preferredPlacement: "bottom",
    },
    {
      id: "reports",
      targetId: "tour-header-tools",
      section: "AUDIT EXPORTS",
      title: "Printable Sheets & Multi-Sheet Excel",
      description:
        "Export complete multi-sheet Excel workbooks, or generate official physical custody sign-off sheets with verified 3-signature blocks.",
      tip: "Physical inventory sheets automatically format for letter-size print.",
      preferredPlacement: "bottom",
    },
    {
      id: "schema-columns",
      targetId: "tour-schema-columns-btn",
      fallbackTargetId: "tour-header-tools",
      section: "SCHEMA MANAGEMENT",
      title: "Customize Columns & Fields",
      description:
        "Custodians can configure custom database columns (such as Serial Number, Brand, or Calibration Date) that instantly appear across tables and Excel sheets.",
      tip: "Custom columns allow your institution to track specialized workshop equipment attributes.",
      preferredPlacement: "bottom",
    },
    {
      id: "account",
      targetId: "tour-header-profile",
      section: "SECURITY",
      title: "Profile, Passkeys & Help",
      description:
        userRole === "admin"
          ? "Update your profile or manage institutional passkeys (KM100-ADMIN / KM100-STAFF) to restrict unauthorized user registration."
          : "Update your account details, manage your password, or restart this walkthrough anytime via the '?' button.",
      preferredPlacement: "bottom",
    },
  ];

  const activeStep = TOUR_STEPS[currentStep];

  // Open mobile rooms drawer automatically on Step 1 when on mobile
  useEffect(() => {
    if (!isOpen) return;

    if (
      currentStep === 0 &&
      typeof window !== "undefined" &&
      window.innerWidth < 768
    ) {
      onToggleMobileNav?.(true);
    } else {
      onToggleMobileNav?.(false);
    }

    return () => {
      onToggleMobileNav?.(false);
    };
  }, [isOpen, currentStep, onToggleMobileNav]);

  const handleClose = useCallback(() => {
    onToggleMobileNav?.(false);
    onClose();
  }, [onClose, onToggleMobileNav]);

  const updateHighlightAndPosition = useCallback(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const checkVisible = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      ) {
        return el;
      }
      return null;
    };

    let el = checkVisible(step.targetId);
    if (!el && step.fallbackTargetId) {
      el = checkVisible(step.fallbackTargetId);
    }

    if (el) {
      try {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      } catch {
        // Fallback
      }

      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      // Measure tooltip dimensions
      const tooltipEl = tooltipRef.current;
      const tooltipW = tooltipEl ? tooltipEl.offsetWidth : 360;
      const tooltipH = tooltipEl ? tooltipEl.offsetHeight : 210;

      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const gap = 12;
      const pad = 12;

      // Mobile layout: dock cleanly at top or bottom
      if (vpW < 640) {
        const placeBelow = rect.bottom + tooltipH + gap < vpH - pad;
        const topPos = placeBelow
          ? Math.max(pad, rect.bottom + gap)
          : Math.max(
              pad,
              Math.min(rect.top - tooltipH - gap, vpH - tooltipH - pad),
            );

        setPosition({
          top: topPos,
          left: pad,
          placement: placeBelow ? "bottom" : "top",
          arrowLeft: Math.max(
            16,
            Math.min(rect.left + rect.width / 2 - pad, vpW - pad * 2 - 24),
          ),
        });
        return;
      }

      // Desktop layout: choose optimal placement based on space
      let placement = step.preferredPlacement || "bottom";
      const spaceBelow = vpH - rect.bottom - gap - pad;
      const spaceAbove = rect.top - gap - pad;
      const spaceRight = vpW - rect.right - gap - pad;
      const spaceLeft = rect.left - gap - pad;

      if (placement === "right" && spaceRight < tooltipW) {
        placement =
          spaceBelow >= tooltipH
            ? "bottom"
            : spaceAbove >= tooltipH
              ? "top"
              : "left";
      } else if (placement === "left" && spaceLeft < tooltipW) {
        placement =
          spaceBelow >= tooltipH
            ? "bottom"
            : spaceAbove >= tooltipH
              ? "top"
              : "right";
      } else if (placement === "bottom" && spaceBelow < tooltipH) {
        placement =
          spaceAbove >= tooltipH
            ? "top"
            : spaceRight >= tooltipW
              ? "right"
              : "bottom";
      } else if (placement === "top" && spaceAbove < tooltipH) {
        placement =
          spaceBelow >= tooltipH
            ? "bottom"
            : spaceRight >= tooltipW
              ? "right"
              : "top";
      }

      let top = 0;
      let left = 0;

      if (placement === "right") {
        left = rect.right + gap;
        top = rect.top + rect.height / 2 - tooltipH / 2;
      } else if (placement === "left") {
        left = rect.left - tooltipW - gap;
        top = rect.top + rect.height / 2 - tooltipH / 2;
      } else if (placement === "top") {
        top = rect.top - tooltipH - gap;
        left = rect.left + rect.width / 2 - tooltipW / 2;
      } else {
        // bottom
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipW / 2;
      }

      // Clamp within viewport
      const clampedLeft = Math.max(pad, Math.min(left, vpW - tooltipW - pad));
      const clampedTop = Math.max(pad, Math.min(top, vpH - tooltipH - pad));

      // Calculate relative arrow coordinate
      let arrowLeft: number | undefined;
      let arrowTop: number | undefined;

      if (placement === "top" || placement === "bottom") {
        arrowLeft = Math.max(
          16,
          Math.min(rect.left + rect.width / 2 - clampedLeft - 6, tooltipW - 24),
        );
      } else {
        arrowTop = Math.max(
          16,
          Math.min(rect.top + rect.height / 2 - clampedTop - 6, tooltipH - 24),
        );
      }

      setPosition({
        top: clampedTop,
        left: clampedLeft,
        placement,
        arrowLeft,
        arrowTop,
      });
    } else {
      setTargetRect(null);
      // Fallback position in bottom right if target element cannot be found
      setPosition({
        top: window.innerHeight - 240,
        left: Math.max(16, window.innerWidth - 380),
        placement: "top",
      });
    }
  }, [isOpen, currentStep, TOUR_STEPS]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(updateHighlightAndPosition, 60);

    const handleResize = () => updateHighlightAndPosition();
    const handleScroll = () => updateHighlightAndPosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, currentStep, updateHighlightAndPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        setCurrentStep((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, TOUR_STEPS.length]);

  if (!isOpen) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden no-print">
      {/* Background Dim Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity"
        aria-hidden="true"
      />

      {/* Target Element Spotlight Cutout Ring */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-300 rounded-xl ring-2 ring-black dark:ring-white border border-white dark:border-black bg-black/5 dark:bg-white/5 shadow-2xl"
          style={{
            top: Math.max(0, targetRect.top - 6),
            left: Math.max(0, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
          }}
        />
      )}

      {/* Anchored Floating Tooltip Card */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-tour-title"
        className="fixed z-50 w-[calc(100vw-24px)] sm:w-[360px] bg-white dark:bg-black text-black dark:text-white rounded-2xl shadow-2xl border border-neutral-300 dark:border-neutral-800 p-4 sm:p-4.5 space-y-3 transition-all duration-200 animate-modal"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Floating Pointer Arrow */}
        {targetRect &&
          position.placement === "bottom" &&
          position.arrowLeft !== undefined && (
            <div
              className="absolute -top-1.5 w-3 h-3 bg-white dark:bg-black border-t border-l border-neutral-300 dark:border-neutral-800 transform rotate-45 pointer-events-none"
              style={{ left: position.arrowLeft }}
            />
          )}
        {targetRect &&
          position.placement === "top" &&
          position.arrowLeft !== undefined && (
            <div
              className="absolute -bottom-1.5 w-3 h-3 bg-white dark:bg-black border-b border-r border-neutral-300 dark:border-neutral-800 transform rotate-45 pointer-events-none"
              style={{ left: position.arrowLeft }}
            />
          )}
        {targetRect &&
          position.placement === "right" &&
          position.arrowTop !== undefined && (
            <div
              className="absolute -left-1.5 w-3 h-3 bg-white dark:bg-black border-b border-l border-neutral-300 dark:border-neutral-800 transform rotate-45 pointer-events-none"
              style={{ top: position.arrowTop }}
            />
          )}
        {targetRect &&
          position.placement === "left" &&
          position.arrowTop !== undefined && (
            <div
              className="absolute -right-1.5 w-3 h-3 bg-white dark:bg-black border-t border-r border-neutral-300 dark:border-neutral-800 transform rotate-45 pointer-events-none"
              style={{ top: position.arrowTop }}
            />
          )}

        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
              {activeStep.section}
            </span>
            <span className="text-[11px] font-mono font-semibold text-neutral-500 dark:text-neutral-400 tabular-nums">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close walkthrough"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3
            id="product-tour-title"
            className="text-sm sm:text-base font-heading font-extrabold tracking-tight text-black dark:text-white"
          >
            {activeStep.title}
          </h3>
          <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
            {activeStep.description}
          </p>
        </div>

        {/* Pro-Tip Box (if available) */}
        {activeStep.tip && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-2.5 text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            <span className="font-semibold text-black dark:text-white">
              Tip:{" "}
            </span>
            {activeStep.tip}
          </div>
        )}

        {/* Navigation Footer */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-semibold text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                isFirstStep
                  ? "border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
                  : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
              }`}
            >
              <ChevronLeft size={13} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
            >
              <span>{isLastStep ? "Finish" : "Next"}</span>
              {isLastStep ? <Check size={13} /> : <ChevronRight size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
