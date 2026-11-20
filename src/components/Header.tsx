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
  Printer,
  Menu,
  Database,
  FileDown
} from 'lucide-react';
import { Room } from '../types/inventory';

export type SupabaseStatus = 'connecting' | 'online' | 'offline';

interface Props {
  onOpenColumnsModal: () => void;
  onExportExcel: (mode: 'multi' | 'current') => void;
  onExportCsv: () => void;
  onTriggerUploadExcel?: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  onOpenMobileMenu: () => void;
  onSyncNow: () => void;
  supabaseStatus: SupabaseStatus;
  supabaseError: string | null;
  selectedRoomId: string;
  currentRoom?: Room;
}

const STATUS_COPY: Record<SupabaseStatus, { label: string; dot: string; pill: string }> = {
  connecting: {
    label: 'Connecting…',
    dot: 'bg-amber-500 animate-pulse',
    pill: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  online: {
    label: 'Cloud Connected',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  offline: {
    label: 'Local Only',
    dot: 'bg-rose-500',
    pill: 'bg-rose-50 text-rose-700 border-rose-200'
  }
};

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
  onSyncNow,
  supabaseStatus,
  supabaseError,
  selectedRoomId,
  currentRoom
}) => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const status = STATUS_COPY[supabaseStatus];

  return (
    <header className="shrink-0 bg-white border-b border-slate-200 z-30 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 no-print">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open facility rooms menu"
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
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

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span
            className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border ${status.pill}`}
            title={supabaseError || 'Supabase realtime sync status'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>

          {onTriggerUploadExcel && (
            <button
              onClick={onTriggerUploadExcel}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
              title="Upload Excel (.xlsx, .xls) or CSV to convert & add directly to inventory"
            >
              <FileSpreadsheet size={15} />
              <span className="hidden md:inline">Upload Excel</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-[0.98]"
              title="Export to Microsoft Excel (.xlsx) or CSV"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden md:inline">Export</span>
              <ChevronDown size={12} />
            </button>

            {isExportDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-modal text-xs"
                onMouseLeave={() => setIsExportDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Official System Export
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                    UI Styled
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onExportExcel('multi');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 text-slate-800 flex flex-col transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                      <Layers size={14} />
                      Multi-Sheet Excel Workbook
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">.xlsx</span>
                  </div>
                  <span className="text-[11px] text-slate-500 pl-5 mt-0.5">
                    Master inventory + one colored tab per facility
                  </span>
                  <div className="flex items-center gap-1 pl-5 mt-1.5">
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-amber-50 text-amber-700">
                      Logo
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-50 text-emerald-600">
                      Pill Badges
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-purple-50 text-purple-600">
                      =SUM() Formula
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onExportExcel('current');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 text-slate-800 flex flex-col border-t border-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building size={14} />
                      Current View Sheet Only
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">.xlsx</span>
                  </div>
                  <span className="text-[11px] text-slate-500 pl-5 mt-0.5">
                    {selectedRoomId === 'ALL'
                      ? 'All active catalog items with condition badges'
                      : currentRoom?.name ?? 'Current Room'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onExportCsv();
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 text-slate-800 flex flex-col border-t border-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileDown size={14} />
                      Clean CSV (UTF-8)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">.csv</span>
                  </div>
                  <span className="text-[11px] text-slate-500 pl-5 mt-0.5">
                    Exact current rows, Excel-safe encoding
                  </span>
                </button>

                <div className="px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-400 bg-slate-50/50 text-center rounded-b-xl">
                  ✓ Styled to match system UI &amp; condition badges
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Print Official Physical Inventory Sheet (Letter/A4)"
          >
            <Printer size={15} />
            <span className="hidden lg:inline">Print Sheet</span>
          </button>

          <button
            onClick={onOpenColumnsModal}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Configure Inventory Schema Columns"
          >
            <Sliders size={16} />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Data & Backup Settings"
            >
              <Settings size={16} />
            </button>

            {isSettingsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-modal text-xs"
                onMouseLeave={() => setIsSettingsOpen(false)}
              >
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                  Data &amp; Cloud Controls
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                      <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                        Supabase Cloud
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.pill}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {supabaseError
                      ? supabaseError
                      : 'PostgreSQL realtime sync across every device using this app.'}
                  </p>
                  <button
                    onClick={onSyncNow}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100"
                  >
                    <Database size={13} /> Sync now
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onExportBackup();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 text-slate-700"
                  >
                    <Download size={14} className="text-amber-600" />
                    <div>
                      <div className="font-semibold">Export JSON Backup</div>
                      <div className="text-[10px] text-slate-400">Save complete database file</div>
                    </div>
                  </button>

                  <label className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 text-slate-700 cursor-pointer">
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

                  <div className="border-t border-slate-200 my-2 pt-2">
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onResetSampleData();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-amber-700"
                    >
                      <RefreshCw size={14} />
                      <div>
                        <div className="font-semibold">Reset Official KM100 Catalog</div>
                        <div className="text-[10px] text-amber-600/70">
                          Revert to the verified seed inventory
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onClearAllData();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-rose-50 text-rose-600 mt-1"
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
