import React, { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Building,
  Package,
  Sliders,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Check,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "admin" | "staff";
}

interface TutorialStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  renderPreview: () => React.ReactNode;
}

export const OnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userRole = "staff",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoQuantity, setDemoQuantity] = useState(12);

  // Keyboard navigation: Escape to close, Left/Right arrows to step
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        setCurrentStep((prev) => Math.min(prev + 1, TUTORIAL_STEPS.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const TUTORIAL_STEPS: TutorialStep[] = [
    {
      id: "facilities",
      badge: "Facility & Room Mapping",
      title: "Workshop & Facility Navigation",
      subtitle:
        "Effortlessly switch between classrooms, laboratories, and storage facilities.",
      description:
        "The inventory register is categorized room-by-room. Use the facilities sidebar on desktop or the navigation drawer on mobile to view specific workshop inventory or inspect institution-wide assets.",
      tip: "Shortcut: Press Ctrl+B to collapse or expand the facilities sidebar anytime.",
      icon: Building,
      renderPreview: () => (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <span>TRAINING FACILITIES</span>
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
              Active Room
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-semibold shadow-2xs">
              <span className="flex items-center gap-2">
                <Building
                  size={14}
                  className="text-amber-700 dark:text-amber-400"
                />
                Computer Laboratory 1
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                28 items
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              <span className="flex items-center gap-2">
                <Building size={14} className="text-slate-400" />
                Welding & Fabrication Suite
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                42 items
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              <span className="flex items-center gap-2">
                <Building size={14} className="text-slate-400" />
                Electrical Technology Lab
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                35 items
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "register",
      badge: "Operate Mode Excellence",
      title: "Real-Time Equipment & Inline Steppers",
      subtitle:
        "Direct manipulation with zero reload delays and immediate physical audit feedback.",
      description:
        "Every equipment item displays real-time quantities, working conditions, and maintenance remarks. Adjust quantities directly with inline steppers or numeric input, filter by condition, and find tools instantly with search-as-you-type.",
      tip: "Try clicking the + and − buttons below to experience instant stock adjustments.",
      icon: Package,
      renderPreview: () => (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <span>INTERACTIVE ROW PREVIEW</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Heavy Duty Bench Drill Press
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Working / Good
                </span>
                <span className="text-[11px] text-slate-400">Unit: pc</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setDemoQuantity((q) => Math.max(0, q - 1))}
                className="h-6 w-6 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-2xs cursor-pointer"
                title="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                {demoQuantity}
              </span>
              <button
                type="button"
                onClick={() => setDemoQuantity((q) => q + 1)}
                className="h-6 w-6 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-2xs cursor-pointer"
                title="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "schema",
      badge: "Adaptive Schema Builder",
      title: "Custom Columns & Tag Generation",
      subtitle:
        "Tailor data attributes to specialized vocational training equipment.",
      description:
        "Custodians can define custom dynamic fields—such as Serial Numbers, Equipment Brands, Calibration Dates, or Vendor details. Custom columns dynamically render across table views, edit forms, and generated Excel spreadsheets.",
      tip: "Click on any item's tag icon to generate printable physical asset labels.",
      icon: Sliders,
      renderPreview: () => (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <span>CONFIGURABLE SCHEMA ATTRIBUTES</span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
              Dynamic Columns
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Serial Number
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                KM100-WD-2026-089
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Manufacturer / Brand
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                Makita Industrial
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Calibration Status
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px] flex items-center gap-1">
                <Check size={11} /> Certified Q1 2026
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Maintenance Schedule
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                Bi-monthly Audit
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "exports",
      badge: "Institutional Audit Readiness",
      title: "Physical Sign-Off Sheets & Excel Reports",
      subtitle:
        "Generate multi-sheet workbooks and printable physical custody sheets.",
      description:
        "Export complete multi-sheet Excel workbooks with official institutional headers, or trigger the Print Report to generate formal physical custody sheets complete with letterhead, reference numbers, and 3-column verification sign-off blocks.",
      tip: "Physical inventory reports automatically format cleanly for letter-size printing.",
      icon: FileSpreadsheet,
      renderPreview: () => (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <span>INSTITUTIONAL AUDIT LETTERHEAD</span>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
              Print &amp; Excel
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div>
              <p className="text-[10px] font-extrabold tracking-wider uppercase text-amber-700 dark:text-amber-500">
                KM100 SKILLS AND TRAINING CENTER, INC.
              </p>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                Official Physical Property Custody Audit Sheet
              </p>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-500">
              <div className="p-1 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <span className="font-semibold block text-slate-700 dark:text-slate-300">
                  Prepared By:
                </span>
                <span>Vocational Instructor</span>
              </div>
              <div className="p-1 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <span className="font-semibold block text-slate-700 dark:text-slate-300">
                  Audited By:
                </span>
                <span>Property Custodian</span>
              </div>
              <div className="p-1 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <span className="font-semibold block text-slate-700 dark:text-slate-300">
                  Approved By:
                </span>
                <span>Center Administrator</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const activeStep = TUTORIAL_STEPS[currentStep];
  const StepIcon = activeStep.icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <picture className="shrink-0 flex items-center">
              <source srcSet="/logo-sm.webp" type="image/webp" />
              <img
                src="/logo-sm.png"
                alt="KM100 Logo"
                width={24}
                height={24}
                className="h-6 w-6 object-contain select-none"
              />
            </picture>
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-extrabold text-slate-900 dark:text-white">
                KM100 Quick Guide
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Sparkles size={10} />
                {userRole === "admin" ? "Custodian Edition" : "Staff Edition"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutorial"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="px-5 pt-3 pb-1 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider text-[10px]">
              {activeStep.badge}
            </span>
            <span className="tabular-nums">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            {TUTORIAL_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-full rounded-full transition-all duration-300 ${
                  idx <= currentStep
                    ? "bg-amber-600 dark:bg-amber-500"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Step Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
              <StepIcon size={20} />
            </div>
            <div>
              <h2
                id="onboarding-modal-title"
                className="text-base sm:text-lg font-heading font-extrabold tracking-tight text-slate-900 dark:text-white"
              >
                {activeStep.title}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {activeStep.subtitle}
              </p>
            </div>
          </div>

          {/* Interactive Feature Visual Preview */}
          <div className="pt-1">{activeStep.renderPreview()}</div>

          {/* Explanation Text */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeStep.description}
          </p>

          {/* Institutional Pro-Tip Callout */}
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <span className="font-bold text-amber-800 dark:text-amber-400 shrink-0">
              Pro-Tip:
            </span>
            <span className="leading-relaxed">{activeStep.tip}</span>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Skip Guide
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer ${
                isLastStep
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                  : "bg-amber-700 hover:bg-amber-800 shadow-amber-700/20"
              }`}
            >
              {isLastStep ? (
                <>
                  <span>Explore Workspace</span>
                  <CheckCircle2 size={14} />
                </>
              ) : (
                <>
                  <span>Next Step</span>
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
