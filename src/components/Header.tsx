import React, { useState } from 'react';
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
  Printer
} from 'lucide-react';
import { Room } from '../types/inventory';

interface Props {
  onOpenColumnsModal: () => void;
  onExportExcel: (mode: 'multi' | 'current') => void;
  onTriggerUploadExcel?: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  selectedRoomId: string;
  currentRoom?: Room;
}

export const Header: React.FC<Props> = ({
  onOpenColumnsModal,
  onExportExcel,
  onTriggerUploadExcel,
  onExportBackup,
  onImportBackup,
  onResetSampleData,
  onClearAllData,
  selectedRoomId,
  currentRoom
}) => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 transition-colors no-print">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Title & Official Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="KM100 Skills and Training Center Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "./logo.png";
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base lg:text-lg font-bold tracking-tight text-slate-900 leading-tight truncate">
                <span className="sm:hidden">KM100 Training</span>
                <span className="hidden sm:inline">KM100 Skills and Training Center, Inc.</span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">
              Inventory Management System • Institutional OS
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Upload & Convert Excel Button */}
          {onTriggerUploadExcel && (
            <button
              onClick={onTriggerUploadExcel}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
              title="Upload Excel (.xlsx, .xls) or CSV to convert & add directly to inventory"
            >
              <FileSpreadsheet size={15} />
              <span className="hidden md:inline">Upload Excel</span>
            </button>
          )}

          {/* Excel Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-[0.98]"
              title="Export to Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden md:inline">Export Excel</span>
              <ChevronDown size={12} />
            </button>

            {isExportDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-modal text-xs"
                onMouseLeave={() => setIsExportDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Official System Export
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    UI Styled
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onExportExcel('multi');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 flex flex-col transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Layers size={14} />
                      Multi-Sheet Excel Workbook
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">.xlsx</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 mt-0.5">
                    Master Inventory + 4 colored room facility tabs
                  </span>
                  <div className="flex items-center gap-1 pl-5 mt-1.5">
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                      Dual Logos
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      Pill Badges
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                      =SUM() Formulas
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onExportExcel('current');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 flex flex-col border-t border-slate-100 dark:border-slate-800/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building size={14} />
                      Current View Sheet Only
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">.xlsx</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 mt-0.5">
                    {selectedRoomId === 'ALL'
                      ? 'All active catalog items with condition badges'
                      : (currentRoom?.name ?? 'Current Room')}
                  </span>
                </button>

                <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 text-center rounded-b-xl">
                  ✓ Styled to match system UI & Condition Badges
                </div>
              </div>
            )}
          </div>

          {/* Print Audit Sheet */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Print Official Physical Inventory Sheet (Letter/A4)"
          >
            <Printer size={15} />
            <span className="hidden lg:inline">Print Sheet</span>
          </button>

          {/* Schema Builder */}
          <button
            onClick={onOpenColumnsModal}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Configure Inventory Schema Columns"
          >
            <Sliders size={16} />
          </button>

          {/* Settings & Backups */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Data & Backup Settings"
            >
              <Settings size={16} />
            </button>

            {isSettingsOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-modal text-xs"
                onMouseLeave={() => setIsSettingsOpen(false)}
              >
                <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                  Data & Backup Controls
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onExportBackup();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <Download size={14} className="text-blue-500" />
                    <div>
                      <div className="font-semibold">Export JSON Backup</div>
                      <div className="text-[10px] text-slate-400">Save complete database file</div>
                    </div>
                  </button>

                  <label className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer">
                    <Upload size={14} className="text-emerald-500" />
                    <div>
                      <div className="font-semibold">Restore JSON Backup</div>
                      <div className="text-[10px] text-slate-400">Upload and restore system state</div>
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
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                    >
                      <RefreshCw size={14} />
                      <div>
                        <div className="font-semibold">Reset Official KM100 Catalog</div>
                        <div className="text-[10px] text-amber-600/70">Revert to 114 verified items</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onClearAllData();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 mt-1"
                    >
                      <Trash2 size={14} />
                      <div>
                        <div className="font-semibold">Purge All Inventory Data</div>
                        <div className="text-[10px] text-rose-500/70">Clear all records and facilities</div>
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
