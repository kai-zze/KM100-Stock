import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "admin" | "staff";
}

interface TourStep {
  id: string;
  targetId: string;
  fallbackTargetId?: string;
  section: string;
  title: string;
  instructions: string[];
  tip?: string;
}

export const OnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userRole = "staff",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const TOUR_STEPS: TourStep[] = [
    {
      id: "facilities",
      targetId: "tour-sidebar",
      section: "FACILITIES & ROOMS",
      title: "1. Facility Navigation",
      instructions: [
        "The left sidebar lists all training rooms, laboratories, and workshops.",
        "Click 'All rooms' to view the institution-wide master inventory register, or select any specific room to view only its equipment.",
        userRole === "admin"
          ? "As a Custodian / Admin, click '+ Add room' at the bottom to register a new facility, or hover over a room to rename or delete it."
          : "Staff members can quickly inspect assigned workshops and view equipment counts.",
        "Keyboard shortcut: Press Ctrl + B (or Cmd + B) to collapse or expand the facilities sidebar.",
      ],
      tip: "Use the search bar inside the sidebar to quickly filter through facilities.",
    },
    {
      id: "kpis",
      targetId: "tour-kpis",
      section: "STATUS & KPIS",
      title: "2. Equipment Overview & Live Counters",
      instructions: [
        "Items: Total number of unique equipment records in the active room or catalog.",
        "Units in stock: Real-time cumulative sum of all physical quantities.",
        "Need attention: Highlights equipment marked 'Needs Repair' or 'For Disposal'. Click this card to instantly filter for items needing maintenance.",
        "Out of stock: Highlights items with a quantity of 0. Click this card to find depleted stock for restocking.",
      ],
      tip: "Clicking any KPI card acts as an instant one-click table filter.",
    },
    {
      id: "search-filters",
      targetId: "tour-search-filters",
      section: "SEARCH & FILTERS",
      title: "3. Search & Instant Filtering",
      instructions: [
        "Search: Type any equipment name, remark, or serial number. Results update instantly without page reloads.",
        "Category: Narrow down items by trade or department (Tools, Machinery, Supplies, Electronics).",
        "Status: Filter equipment by condition: Working / Good, Used / Fair, Needs Repair, or For Disposal.",
        "Columns: Toggle which table columns are visible to customize your display.",
      ],
      tip: "Clear your search quickly by clicking the '✕' icon inside the search input.",
    },
    {
      id: "table",
      targetId: "tour-table",
      section: "INVENTORY REGISTER",
      title: "4. Live Table & Quantity Steppers",
      instructions: [
        "Inline Steppers (+ / −): Click the '+' or '−' buttons on any row to immediately adjust stock counts on the spot. Changes sync in real-time to the database.",
        "Direct Numeric Edit: Click directly on any quantity number to type an exact count.",
        "Item Details: Click any item row to open its full details modal where you can edit specifications, change conditions, or add remarks.",
        "Asset Tags: Click the tag icon on any item to generate and print physical labels with barcodes and QR codes.",
      ],
      tip: "Sticky table headers stay visible no matter how long the equipment register is.",
    },
    {
      id: "add-item",
      targetId: "tour-add-item",
      fallbackTargetId: "tour-add-item-overview",
      section: "ENROLLMENT",
      title: "5. Registering New Equipment",
      instructions: [
        "Click '+ Add item' to register new tools, machinery, computers, or consumables into the active facility.",
        "Fill in the equipment name, initial quantity, unit of measurement (pc, set, unit, box), condition status, and custom specifications.",
        "Newly enrolled items are instantly tracked, counted in live KPIs, and included in official audit sheets.",
      ],
      tip: "You can also bulk-import existing inventories via Excel using the Export & Actions menu.",
    },
    {
      id: "reports",
      targetId: "tour-header-tools",
      section: "REPORTS & AUDITS",
      title: "6. Official Audit Reports & Excel Exports",
      instructions: [
        "Multi-Sheet Excel: Click 'Export' to download a master .xlsx workbook containing dedicated sheets for every facility room.",
        "Print Official Sheet: Click 'Print Sheet' to generate formal physical custody sheets complete with letterhead and 3-signature verification blocks (Prepared By, Audited By, Approved By).",
        userRole === "admin"
          ? "Customize Columns (Admin): Custodians can add custom fields (Serial No, Brand, Calibration Date) that automatically appear in table views and Excel exports."
          : "Audit-ready physical sheets are formatted for standard letter-size paper with headers automatically suppressed.",
      ],
      tip: "Physical inventory reports automatically suppress screen navigation buttons when printing.",
    },
    {
      id: "account",
      targetId: "tour-header-profile",
      section: "SECURITY & PASSKEYS",
      title: "7. Account Settings, Passkeys & Guide",
      instructions: [
        "Profile Settings: Click your user badge to change your display name or update your personal account password.",
        "Security Rule: Changing your password will automatically sign you out so you can sign in with your new credentials.",
        userRole === "admin"
          ? "Institutional Passkeys (Admin): Property Custodians can update the official registration passkeys (KM100-ADMIN / KM100-STAFF) to restrict unauthorized access."
          : "Official passkeys prevent unauthorized public access to training facility assets.",
        "Product Tour: Click the '?' question mark button in the header anytime to reopen this walkthrough.",
      ],
      tip: "Always click the Sign Out button when finishing an inventory audit on communal training facility terminals.",
    },
  ];

  const activeStep = TOUR_STEPS[currentStep];

  const updateHighlight = useCallback(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    let el = document.getElementById(step.targetId);
    if (!el && step.fallbackTargetId) {
      el = document.getElementById(step.fallbackTargetId);
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
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep, TOUR_STEPS]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(updateHighlight, 60);

    const handleResize = () => updateHighlight();
    const handleScroll = () => updateHighlight();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, currentStep, updateHighlight]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        setCurrentStep((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, TOUR_STEPS.length]);

  if (!isOpen) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
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
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      {/* Monochrome Dim Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity"
        aria-hidden="true"
      />

      {/* Target Element Monochrome Spotlight Ring */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-300 rounded-xl ring-2 ring-black dark:ring-white border border-white dark:border-black bg-black/5 dark:bg-white/5 shadow-2xl"
          style={{
            top: Math.max(0, targetRect.top - 6),
            left: Math.max(0, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Simple Black & White Product Tour Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-tour-title"
        className="fixed z-50 bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[460px] bg-white dark:bg-black text-black dark:text-white rounded-2xl shadow-2xl border border-neutral-300 dark:border-neutral-800 p-4 sm:p-5 space-y-3.5 animate-modal"
      >
        {/* Step Header */}
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                {activeStep.section}
              </span>
              <span className="text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>
            </div>
            <h3
              id="product-tour-title"
              className="mt-1.5 text-sm sm:text-base font-extrabold tracking-tight truncate text-black dark:text-white"
            >
              {activeStep.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer shrink-0"
            title="Close Product Tour"
            aria-label="Close Product Tour"
          >
            <X size={16} />
          </button>
        </div>

        {/* Instructions List */}
        <div className="space-y-2 text-xs sm:text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed max-h-[36vh] overflow-y-auto pr-1">
          {activeStep.instructions.map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-black dark:text-white font-bold shrink-0 mt-0.5">
                •
              </span>
              <span className="leading-relaxed">{line}</span>
            </div>
          ))}
        </div>

        {/* Simple Pro-Tip Box */}
        {activeStep.tip && (
          <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-[11px] text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
            <span className="font-bold text-black dark:text-white shrink-0">
              Note:
            </span>
            <span className="leading-relaxed">{activeStep.tip}</span>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white dark:text-black bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              {isLastStep ? (
                <>
                  <span>Done</span>
                  <Check size={14} />
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
