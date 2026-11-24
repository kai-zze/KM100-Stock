import React from "react";

// ── Shared Pulse Bone Atom ──────────────────────────────────────────
export const SkeletonBone: React.FC<{
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}> = ({ className = "h-4 w-full", rounded = "lg" }) => {
  const roundedClass = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 ${roundedClass} ${className}`}
    />
  );
};

// ── Overview Dashboard Skeleton (1:1 with OverviewDashboard.tsx) ──────
export const DashboardSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading facilities dashboard..."
      className="border-b border-slate-200 bg-slate-50/60 px-3 py-4 dark:border-slate-800 dark:bg-slate-950/60 sm:px-4 sm:py-5 lg:px-6 lg:py-6"
    >
      <div className="w-full space-y-4 sm:space-y-5">
        {/* Header Strip */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <SkeletonBone
              className="h-7 sm:h-8 lg:h-9 w-40 sm:w-48"
              rounded="xl"
            />
            <SkeletonBone className="h-3.5 sm:h-4 w-56 sm:w-64" />
          </div>

          <div className="flex items-center gap-2">
            {/* Stats Pill (Rooms • Items • Units) */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <SkeletonBone className="h-4 w-16" />
              <span className="text-slate-300 dark:text-slate-700">
                &middot;
              </span>
              <SkeletonBone className="h-4 w-16" />
              <span className="text-slate-300 dark:text-slate-700">
                &middot;
              </span>
              <SkeletonBone className="h-4 w-16" />
            </div>

            {/* "+ Add item" Button */}
            <SkeletonBone className="h-9 sm:h-10 w-28 rounded-xl bg-amber-700/40 dark:bg-amber-700/30" />
          </div>
        </div>

        {/* Status Strip & Legend */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <SkeletonBone className="h-4 w-4 shrink-0" rounded="md" />
                <SkeletonBone className="h-5 w-24" />
              </div>
              <SkeletonBone className="mt-1.5 h-3.5 w-44" />
            </div>

            {/* Legend Pills Skeleton */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <SkeletonBone className="h-6 w-24" rounded="md" />
              <SkeletonBone className="h-6 w-28" rounded="md" />
              <SkeletonBone className="h-6 w-20" rounded="md" />
            </div>
          </div>

          {/* Active Rooms Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3"
              >
                <div>
                  <SkeletonBone className="h-5 w-3/4" />
                  <SkeletonBone className="mt-1 h-3 w-1/2" />

                  {/* 2-Column Stats Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/70 space-y-1.5">
                      <SkeletonBone className="h-3 w-10" />
                      <SkeletonBone className="h-6 w-8" />
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/70 space-y-1.5">
                      <SkeletonBone className="h-3 w-10" />
                      <SkeletonBone className="h-6 w-12" />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
                  <SkeletonBone className="h-5 w-24" rounded="md" />
                  <SkeletonBone className="h-3.5 w-8" />
                </div>
              </div>
            ))}
          </div>

          {/* Empty Rooms Compact Section */}
          <div className="pt-2">
            <div className="mb-2.5 flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <SkeletonBone className="h-4 w-32" />
                <SkeletonBone className="h-3 w-48 hidden sm:block" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="space-y-1 flex-1">
                    <SkeletonBone className="h-4 w-3/4" />
                    <SkeletonBone className="h-3 w-12" />
                  </div>
                  <SkeletonBone className="h-7 w-20 shrink-0" rounded="lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Table View Skeleton (1:1 with InventoryTable.tsx) ─────────────────
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 8 }) => {
  return (
    <div
      role="status"
      aria-label="Loading inventory records..."
      className="w-full bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm min-w-[720px] lg:min-w-full">
          <thead className="bg-slate-50/95 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-3.5 pl-3 sm:pl-4 pr-1 w-9">
                <SkeletonBone className="h-4 w-4" rounded="sm" />
              </th>
              <th className="py-3 px-3 sm:px-4 w-36">
                <SkeletonBone className="h-3.5 w-24" />
              </th>
              <th className="py-3 px-3 sm:px-4 w-1/3">
                <SkeletonBone className="h-3.5 w-28" />
              </th>
              <th className="py-3 px-3 sm:px-4 w-28">
                <SkeletonBone className="h-3.5 w-20" />
              </th>
              <th className="py-3 px-3 sm:px-4 w-24 text-center">
                <SkeletonBone className="h-3.5 w-14 mx-auto" />
              </th>
              <th className="py-3 px-3 sm:px-4 w-16 text-center">
                <SkeletonBone className="h-3.5 w-10 mx-auto" />
              </th>
              <th className="py-3 px-3 sm:px-4 w-24 text-center">
                <SkeletonBone className="h-3.5 w-16 mx-auto" />
              </th>
              <th className="py-3 px-3 sm:px-4 w-20 text-right">
                <SkeletonBone className="h-3.5 w-14 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: rows }).map((_, index) => (
              <tr
                key={index}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
              >
                {/* Selection Checkbox */}
                <td className="py-3 pl-3 sm:pl-4 pr-1">
                  <SkeletonBone className="h-4 w-4" rounded="sm" />
                </td>

                {/* Location / Room */}
                <td className="py-3 px-3 sm:px-4">
                  <SkeletonBone className="h-5 w-24" rounded="md" />
                </td>

                {/* Item Name & Spec */}
                <td className="py-3 px-3 sm:px-4">
                  <div className="space-y-1">
                    <SkeletonBone className="h-4 w-4/5" />
                    <SkeletonBone className="h-3 w-1/2" />
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-3 sm:px-4">
                  <SkeletonBone className="h-5 w-24" rounded="md" />
                </td>

                {/* Quantity Stepper (- [qty] +) */}
                <td className="py-3 px-3 sm:px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <SkeletonBone className="h-7 w-7" rounded="lg" />
                    <SkeletonBone className="h-6 w-8" rounded="md" />
                    <SkeletonBone className="h-7 w-7" rounded="lg" />
                  </div>
                </td>

                {/* Units */}
                <td className="py-3 px-3 sm:px-4 text-center">
                  <SkeletonBone className="h-4 w-8 mx-auto" />
                </td>

                {/* Condition Status Badge */}
                <td className="py-3 px-3 sm:px-4 text-center">
                  <SkeletonBone className="h-6 w-20 mx-auto" rounded="full" />
                </td>

                {/* Actions (Edit / Delete) */}
                <td className="py-3 px-3 sm:px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <SkeletonBone className="h-7 w-7" rounded="lg" />
                    <SkeletonBone className="h-7 w-7" rounded="lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Full Application Shell Skeleton (1:1 with App.tsx, Header, Sidebar)
export const AppShellSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading KM100 Inventory System..."
      className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100"
    >
      {/* Header Skeleton */}
      <header className="flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <SkeletonBone className="h-9 w-9 shrink-0" rounded="full" />
          <div className="space-y-1 hidden sm:block">
            <SkeletonBone className="h-3.5 w-40" />
            <SkeletonBone className="h-2.5 w-24" />
          </div>
        </div>

        {/* Global Search Bar Placeholder */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <SkeletonBone className="h-9 w-full" rounded="xl" />
        </div>

        {/* Header Right Actions (Export, Print, Profile) */}
        <div className="flex items-center gap-2">
          <SkeletonBone className="h-8 w-20 sm:w-24" rounded="xl" />
          <SkeletonBone className="h-8 w-24 sm:w-28" rounded="xl" />
          <SkeletonBone className="h-8 w-8 sm:w-28" rounded="full" />
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Skeleton (Desktop 1:1 with Sidebar.tsx) */}
        <aside className="hidden md:flex w-64 lg:w-72 xl:w-80 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shrink-0 space-y-3">
          <div className="flex items-center justify-between px-1">
            <SkeletonBone className="h-4 w-24" />
          </div>

          {/* 2-Box Stat Counters (Rooms & Items) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2.5 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <SkeletonBone className="h-5 w-5 rounded-md" />
                <SkeletonBone className="h-2.5 w-10" />
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <SkeletonBone className="h-5 w-8" />
                <SkeletonBone className="h-2.5 w-8" />
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2.5 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <SkeletonBone className="h-5 w-5 rounded-md" />
                <SkeletonBone className="h-2.5 w-10" />
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <SkeletonBone className="h-5 w-8" />
                <SkeletonBone className="h-2.5 w-8" />
              </div>
            </div>
          </div>

          {/* Search Rooms Input */}
          <SkeletonBone className="h-9 w-full" rounded="xl" />

          {/* "All rooms" button */}
          <SkeletonBone className="h-10 w-full" rounded="xl" />

          {/* Room List Items */}
          <div className="space-y-1 pt-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg px-2 py-1.5"
              >
                <div className="flex items-center gap-2 flex-1">
                  <SkeletonBone className="h-2 w-2 shrink-0" rounded="full" />
                  <SkeletonBone className="h-3.5 w-3/4" />
                </div>
                <SkeletonBone className="h-4 w-6 shrink-0" rounded="md" />
              </div>
            ))}
          </div>
        </aside>

        {/* Content Pane Skeleton */}
        <main className="flex-1 overflow-y-auto">
          <DashboardSkeleton />
        </main>
      </div>
    </div>
  );
};

// ── Modal Dialog Suspense Fallback Skeleton ───────────────────────────
export const ModalSkeleton: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
  size = "md",
}) => {
  const maxWidth = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }[size];

  return (
    <div
      role="status"
      aria-label="Loading dialog..."
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 space-y-4`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <SkeletonBone className="h-9 w-9 shrink-0" rounded="xl" />
            <div className="space-y-1">
              <SkeletonBone className="h-4 w-36" />
              <SkeletonBone className="h-3 w-48" />
            </div>
          </div>
          <SkeletonBone className="h-7 w-7 shrink-0" rounded="lg" />
        </div>

        {/* Body Fields */}
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <SkeletonBone className="h-3.5 w-24" />
            <SkeletonBone className="h-10 w-full" rounded="xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <SkeletonBone className="h-3.5 w-20" />
              <SkeletonBone className="h-10 w-full" rounded="xl" />
            </div>
            <div className="space-y-1.5">
              <SkeletonBone className="h-3.5 w-20" />
              <SkeletonBone className="h-10 w-full" rounded="xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <SkeletonBone className="h-3.5 w-28" />
            <SkeletonBone className="h-16 w-full" rounded="xl" />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <SkeletonBone className="h-9 w-20" rounded="xl" />
          <SkeletonBone className="h-9 w-28 rounded-xl bg-amber-700/40 dark:bg-amber-700/30" />
        </div>
      </div>
    </div>
  );
};
