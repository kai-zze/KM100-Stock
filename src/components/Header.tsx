import React, { useEffect, useRef, useState } from 'react';
import {
  FileSpreadsheet,
  Sliders,
  Settings,
  ChevronDown,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Layers,
  Building,
  Printer,
  Menu,
  FileDown,
  Sun,
  Moon
} from 'lucide-react';
import { Room } from '../types/inventory';

export type ThemeMode = 'light' | 'dark';

interface Props {
  onOpenColumnsModal: () => void;
  onExportExcel: (mode: 'multi' | 'current') => void;
  onExportCsv?: () => void;
  onTriggerUploadExcel?: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  onOpenMobileMenu?: () => void;
  selectedRoomId: string;
  currentRoom?: Room;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Header: React.FC<Props> = ({
  onOpenColumnsModal,
  onExportExcel,
  onExportCsv,
  onTriggerUploadExcel,
  onExportBackup,
  onImportBackup,
  onResetSampleData,
  onClearAllData,
  onOpenMobileMenu,
  selectedRoomId,
  currentRoom,
  theme,
  onToggleTheme
}) => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isExportDropdownOpen && !isSettingsOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (exportRef.current && !exportRef.current.contains(target)) setIsExportDropdownOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(target)) setIsSettingsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExportDropdownOpen(false);
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExportDropdownOpen, isSettingsOpen]);

  return (
    <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 no-print">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open facility rooms menu"
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <Menu size={17} />
          </button>

          <div className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="KM100 Skills and Training Center Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/favicon.png';
              }}
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
              <span className="sm:hidden">KM100 Training</span>
              <span className="hidden sm:inline">KM100 Skills and Training Center, Inc.</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              Inventory Management System • Institutional OS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {onTriggerUploadExcel && (
            <button
              onClick={onTriggerUploadExcel}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Upload Excel (.xlsx, .xls) or CSV to convert & add directly to inventory"
            >
              <FileSpreadsheet size={15} className="text-amber-700 dark:text-amber-400" />
              <span className="hidden md:inline">Upload Excel</span>
            </button>
          )}

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setIsExportDropdownOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isExportDropdownOpen}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98]"
              title="Export to Microsoft Excel (.xlsx) or CSV"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden md:inline">Export</span>
              <ChevronDown size={12} />
            </button>

            {isExportDropdownOpen && (
              <div
                role="menu"
                aria-label="Export options"
                className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-modal text-xs"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Official System Export
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    UI Styled
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onExportExcel('multi');
                  }}
                  role="menuitem"
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 flex flex-col transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Layers size={14} />
                      Multi-Sheet Excel Workbook
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">.xlsx</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 mt-0.5">
                    Master inventory + one colored tab per facility
                  </span>
                  <div className="flex items-center gap-1 pl-5 mt-1.5">
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                      Logo
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                      Pill Badges
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      =SUM() Formula
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onExportExcel('current');
                  }}
                  role="menuitem"
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 flex flex-col border-t border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building size={14} />
                      Current View Sheet Only
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">.xlsx</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 mt-0.5">
                    {selectedRoomId === 'ALL'
                      ? 'All active catalog items with condition badges'
                      : currentRoom?.name ?? 'Current Room'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onExportCsv?.();
                  }}
                  role="menuitem"
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 flex flex-col border-t border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileDown size={14} />
                      Clean CSV (UTF-8)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">.csv</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 mt-0.5">
                    Exact current rows, Excel-safe encoding
                  </span>
                </button>

                <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/40 text-center rounded-b-xl">
                  ✓ Styled to match system UI &amp; condition badges
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => window.print()}
            aria-label="Print official physical inventory sheet"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Print Official Physical Inventory Sheet (Letter/A4)"
          >
            <Printer size={15} />
            <span className="hidden lg:inline">Print Sheet</span>
          </button>

          <button
            onClick={onOpenColumnsModal}
            aria-label="Configure inventory schema columns"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Configure Inventory Schema Columns"
          >
            <Sliders size={16} />
          </button>

          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isSettingsOpen}
              aria-label="Data and backup settings"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Data & Backup Settings"
            >
              <Settings size={16} />
            </button>

            {isSettingsOpen && (
              <div
                role="menu"
                aria-label="Data and backup settings"
                className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-modal text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                  Data &amp; Backup Controls
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onExportBackup();
                    }}
                    role="menuitem"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Download size={14} className="text-amber-700 dark:text-amber-400" />
                    <div>
                      <div className="font-semibold">Export JSON Backup</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Save complete database file</div>
                    </div>
                  </button>

                  <label className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer">
                    <Upload size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="font-semibold">Restore JSON Backup</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Upload and restore system state</div>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        setIsSettingsOpen(false);
                        onImportBackup(e);
                      }}
                      className="hidden"
                    />
                  </label>

                  <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onResetSampleData();
                      }}
                      role="menuitem"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                    >
                      <RefreshCw size={14} />
                      <div>
                        <div className="font-semibold">Reset Official KM100 Catalog</div>
                        <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                          Revert to the verified seed inventory
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onClearAllData();
                      }}
                      role="menuitem"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 mt-1"
                    >
                      <Trash2 size={14} />
                      <div>
                        <div className="font-semibold">Purge All Inventory Data</div>
                        <div className="text-[11px] text-rose-500 dark:text-rose-400/80">Clear all records and facilities</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
