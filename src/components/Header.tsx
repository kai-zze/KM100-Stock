import React, { useEffect, useRef, useState } from "react";
import {
  FileSpreadsheet,
  Sliders,
  ChevronDown,
  Layers,
  Building,
  Printer,
  Menu,
  LogOut,
  Shield,
  User,
  HelpCircle,
} from "lucide-react";
import { Room, AppUser } from "../types/inventory";

// ── Sidebar / Panel Icons (Lucide-standard SVG) ──────────────────────
const PanelLeftCloseIcon = ({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
    <path d="m16 15-3-3 3-3" />
  </svg>
);

const PanelLeftOpenIcon = ({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
    <path d="m14 9 3 3-3 3" />
  </svg>
);

interface Props {
  onOpenColumnsModal: () => void;
  onExportExcel: (mode: "multi" | "current") => void;
  onExportCsv?: () => void;
  onTriggerUploadExcel?: () => void;
  onOpenMobileMenu?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onOpenProfile?: () => void;
  selectedRoomId: string;
  currentRoom?: Room;
  currentUser?: AppUser | null;
  onSignOut?: () => void;
  onOpenTutorial?: () => void;
}

export const Header: React.FC<Props> = ({
  onOpenColumnsModal,
  onExportExcel,
  onExportCsv,
  onTriggerUploadExcel,
  onOpenMobileMenu,
  onToggleSidebar,
  isSidebarCollapsed,
  onOpenProfile,
  selectedRoomId,
  currentRoom,
  currentUser,
  onSignOut,
  onOpenTutorial,
}) => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isExportDropdownOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (exportRef.current && !exportRef.current.contains(target))
        setIsExportDropdownOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExportDropdownOpen]);

  return (
    <header className="z-30 shrink-0 border-b border-slate-200 bg-white/95 px-2.5 py-2.5 backdrop-blur sm:px-4 sm:py-3.5 lg:px-6 no-print dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex w-full items-center justify-between gap-1.5 sm:gap-4">
        {/* Navigation / Sidebar Menu Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {(onOpenMobileMenu || onToggleSidebar) && (
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 768) {
                  onOpenMobileMenu?.();
                } else {
                  onToggleSidebar?.();
                }
              }}
              aria-label={
                isSidebarCollapsed
                  ? "Expand sidebar (Ctrl+B)"
                  : "Collapse sidebar (Ctrl+B)"
              }
              title={
                isSidebarCollapsed
                  ? "Expand sidebar (Ctrl+B)"
                  : "Collapse sidebar (Ctrl+B)"
              }
              className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                isSidebarCollapsed
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-300/80 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpenIcon size={18} />
              ) : (
                <PanelLeftCloseIcon size={18} />
              )}
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <picture className="shrink-0 flex items-center">
              <source srcSet="/logo-sm.webp" type="image/webp" />
              <img
                src="/logo-sm.png"
                alt="KM100 Logo"
                width={40}
                height={40}
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-xl select-none shrink-0"
              />
            </picture>

            <div className="shrink-0">
              <h1 className="text-sm sm:text-base md:text-lg font-heading font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight whitespace-nowrap">
                <span className="text-amber-700 dark:text-amber-500">KM</span>
                100
                <span className="hidden sm:inline">
                  {" "}
                  Skills and Training Center, Inc.
                </span>
              </h1>
              <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-none mt-1 truncate">
                Inventory Management System
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions Toolbar */}
        <div
          id="tour-header-tools"
          className="flex items-center gap-1 sm:gap-2 shrink-0"
        >
          {/* Import Excel Spreadsheet Button (Desktop only; on mobile accessible via Export & Actions menu) */}
          {onTriggerUploadExcel && currentUser?.role === "admin" && (
            <button
              onClick={onTriggerUploadExcel}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98] shrink-0"
              title="Import Inventory from Excel (.xlsx, .xls, .csv)"
            >
              <FileSpreadsheet size={15} />
              <span className="hidden lg:inline">Import Excel</span>
            </button>
          )}

          {/* Excel Spreadsheet Export Dropdown */}
          <div className="relative shrink-0" ref={exportRef}>
            <button
              onClick={() => setIsExportDropdownOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isExportDropdownOpen}
              aria-label="Export inventory spreadsheet menu"
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
              title="Export Inventory to Excel Spreadsheet"
            >
              <FileSpreadsheet
                size={15}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {isExportDropdownOpen && (
              <>
                <div
                  onClick={() => setIsExportDropdownOpen(false)}
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] sm:hidden"
                  aria-hidden="true"
                />
                <div
                  role="menu"
                  aria-label="Spreadsheet export options"
                  className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-200/90 dark:border-slate-800 ring-1 ring-slate-900/5 dark:ring-white/5 p-1.5 z-50 animate-modal text-xs"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                    Export Options
                  </div>

                  {/* Multi-Tab Master Excel */}
                  <button
                    onClick={() => {
                      setIsExportDropdownOpen(false);
                      onExportExcel("multi");
                    }}
                    role="menuitem"
                    className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                  >
                    <Layers
                      size={15}
                      className="text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        Master Inventory Workbook
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1 rounded">
                          .xlsx
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Multi-sheet: Overview dashboard tab + dedicated sheet
                        per room
                      </div>
                    </div>
                  </button>

                  {/* Current Room / Filtered View Excel */}
                  <button
                    onClick={() => {
                      setIsExportDropdownOpen(false);
                      onExportExcel("current");
                    }}
                    role="menuitem"
                    className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer mt-0.5"
                  >
                    <Building
                      size={15}
                      className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {selectedRoomId === "ALL"
                          ? "Current View Catalog"
                          : `${currentRoom?.name || "Current Room"} Only`}
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:blue-950/60 px-1 rounded">
                          .xlsx
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Single sheet with active filters &amp; current room
                        items
                      </div>
                    </div>
                  </button>

                  {/* Mobile Admin Options: Import & Schema */}
                  {onTriggerUploadExcel && currentUser?.role === "admin" && (
                    <button
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        onTriggerUploadExcel();
                      }}
                      role="menuitem"
                      className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer sm:hidden border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5"
                    >
                      <FileSpreadsheet
                        size={15}
                        className="text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          Import Spreadsheet
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1 rounded">
                            .xlsx / .csv
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Upload or replace inventory data
                        </div>
                      </div>
                    </button>
                  )}

                  {currentUser?.role === "admin" && (
                    <button
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        onOpenColumnsModal();
                      }}
                      role="menuitem"
                      className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer sm:hidden mt-0.5"
                    >
                      <Sliders
                        size={15}
                        className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          Customize Columns (Schema)
                          <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1 rounded">
                            Admin
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Add, reorder, or rename table columns
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Print Official Physical Inventory Sheet */}
          <button
            onClick={() => {
              window.dispatchEvent(new Event("beforeprint"));
              setTimeout(() => {
                window.print();
              }, 50);
            }}
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
            title="Print Official Physical Inventory Sheet (Letter/A4)"
            aria-label="Print Official Physical Inventory Sheet"
          >
            <Printer size={15} />
            <span className="hidden lg:inline">Print Sheet</span>
          </button>

          {/* Schema Columns Config (Admin Only, Desktop only; on mobile accessible via dropdown) */}
          {currentUser?.role === "admin" && (
            <button
              onClick={onOpenColumnsModal}
              aria-label="Configure inventory schema columns"
              className="hidden sm:flex p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
              title="Configure Inventory Schema Columns (Admin Only)"
            >
              <Sliders size={16} />
            </button>
          )}

          {/* User Profile & Sign Out */}
          {currentUser && (
            <div
              id="tour-header-profile"
              className="flex items-center gap-1 sm:gap-1.5 pl-0.5 sm:pl-2 shrink-0"
            >
              {onOpenTutorial && (
                <button
                  type="button"
                  onClick={onOpenTutorial}
                  className="p-1.5 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                  title="Product Tour"
                  aria-label="Product Tour"
                >
                  <HelpCircle size={15} />
                </button>
              )}

              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-1 sm:gap-2 px-1.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs group shrink-0"
                title="Account Settings - Click to change name or password"
                aria-label="Account Settings"
              >
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  {currentUser.role === "admin" ? (
                    <Shield size={13} />
                  ) : (
                    <User size={13} />
                  )}
                </span>
                <span className="hidden md:inline whitespace-nowrap font-semibold truncate max-w-[120px] lg:max-w-[200px]">
                  {currentUser.fullName
                    ?.replace(/\s*\((?:Admin|Staff)\)/i, "")
                    .trim() || currentUser.email}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100/90 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {currentUser.role === "admin" ? "Admin" : "Staff"}
                </span>
              </button>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  aria-label="Sign out of KM100 System"
                  title="Sign Out"
                  className="p-1.5 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
                >
                  <LogOut size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
