import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import {
  ColumnDefinition,
  ColumnType,
  InventoryItem,
  Room,
  ITEM_STATUSES
} from './types/inventory';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { OverviewDashboard } from './components/OverviewDashboard';
import { InventoryTable } from './components/InventoryTable';
import { BulkActionBar } from './components/BulkActionBar';
import { ColumnsVisibilityMenu } from './components/ColumnsVisibilityMenu';
const ItemModal = (React as any).lazy(() => import('./components/ItemModal'));
const ColumnsSchemaModal = (React as any).lazy(() => import('./components/ColumnsSchemaModal'));
const RoomModal = (React as any).lazy(() => import('./components/RoomModal'));
const AssetTagModal = (React as any).lazy(() => import('./components/AssetTagModal'));
const ImportPreviewModal = (React as any).lazy(() => import('./components/ImportPreviewModal'));
const PrintReport = (React as any).lazy(() => import('./components/PrintReport'));
import { downloadInventoryCsv } from './utils/csvExport';
import type { ImportAnalysis } from './utils/importParse';
import { isNeedsAttention } from './utils/status';
import { generateItemId, generateRoomId } from './utils/ids';
import {
  Search,
  Filter,
  X,
  Edit,
  Plus,
  AlertTriangle,
  Check,
  Sparkles,
  PackageX,
  ShieldCheck,
  Package,
  Layers,
  ArrowUpDown,
  Building
} from 'lucide-react';

const STORAGE_KEY_ROOMS = 'km100_inventory_rooms_v1';
const STORAGE_KEY_ITEMS = 'km100_inventory_items_v1';
const STORAGE_KEY_COLUMNS = 'km100_inventory_columns_v1';
const STORAGE_KEY_HIDDEN_COLS = 'km100_hidden_columns_v1';
const STORAGE_KEY_THEME = 'km100_inventory_theme_v2';

const PAGE_SIZE = 25;

import { DEFAULT_COLUMNS, DEFAULT_ROOMS, DEFAULT_ITEMS } from './data/defaultData';

export function App() {
  // ── State Initialization ──────────────────────────────────────────
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROOMS);
      return saved ? JSON.parse(saved) : DEFAULT_ROOMS;
    } catch {
      return DEFAULT_ROOMS;
    }
  });

  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : DEFAULT_ITEMS;
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  const [columns, setColumns] = useState<ColumnDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLUMNS);
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    } catch {
      return DEFAULT_COLUMNS;
    }
  });

  const [hiddenColumnIds, setHiddenColumnIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIDDEN_COLS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Filtering, Search & Sorting ──────────────────────────────────
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState(false);
  const [outOfStockFilter, setOutOfStockFilter] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // ── Pagination & Bulk Selection ─────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ── Modals & Overlays ───────────────────────────────────────────
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [assetTagItem, setAssetTagItem] = useState<InventoryItem | null>(null);
  const [importAnalysis, setImportAnalysis] = useState<ImportAnalysis | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore storage access errors
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Theme Application ───────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
      // ignore storage access errors
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ── Persistence Effects ─────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HIDDEN_COLS, JSON.stringify(hiddenColumnIds));
  }, [hiddenColumnIds]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, conditionFilter, needsAttentionFilter, outOfStockFilter, selectedRoomId]);

  // ── Keyboard Shortcuts (Standard Pro Operator Shortcuts) ────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search: press '/' when not typing in form fields
      if (e.key === '/' && !e.isComposing) {
        const target = e.target as HTMLElement;
        const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
        if (!inInput) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }

      // Quick add item: Alt + N
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setEditingItem(null);
        setIsItemModalOpen(true);
      }

      // Escape key clears selection or closes overlay
      if (e.key === 'Escape' && !e.isComposing) {
        if (selectedIds.length > 0) {
          setSelectedIds([]);
        } else if (confirmDialog) {
          setConfirmDialog(null);
        } else if (assetTagItem) {
          setAssetTagItem(null);
        } else if (importAnalysis) {
          setImportAnalysis(null);
        } else if (isItemModalOpen) {
          setIsItemModalOpen(false);
        } else if (isColumnsModalOpen) {
          setIsColumnsModalOpen(false);
        } else if (isRoomModalOpen) {
          setIsRoomModalOpen(false);
        } else if (isMobileNavOpen) {
          setIsMobileNavOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, confirmDialog, assetTagItem, importAnalysis, isItemModalOpen, isColumnsModalOpen, isRoomModalOpen, isMobileNavOpen]);

  // ── Toast Helper ────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ── Derived Data ────────────────────────────────────────────────
  const currentRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId);
  }, [rooms, selectedRoomId]);

  const roomItemCounts = useMemo(() => {
    const counts: Record<string, { unique: number; totalQty: number }> = {};
    rooms.forEach((r) => {
      counts[r.id] = { unique: 0, totalQty: 0 };
    });
    items.forEach((item) => {
      if (counts[item.roomId]) {
        counts[item.roomId].unique += 1;
        counts[item.roomId].totalQty += Number(item.quantity) || 0;
      }
    });
    return counts;
  }, [rooms, items]);

  const availableCategories = useMemo(() => {
    const catCol = columns.find((c) => c.id === 'category');
    if (catCol?.options && catCol.options.length > 0) {
      return catCol.options;
    }
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set);
  }, [columns, items]);

  // Items in active room view (prior to text/status filters)
  const roomScopedItems = useMemo(() => {
    if (selectedRoomId === 'ALL') return items;
    return items.filter((it) => it.roomId === selectedRoomId);
  }, [items, selectedRoomId]);

  // Quick KPI metrics for current view
  const attentionCount = useMemo(() => {
    return roomScopedItems.filter((it) => isNeedsAttention(it)).length;
  }, [roomScopedItems]);

  const outOfStockCount = useMemo(() => {
    return roomScopedItems.filter((it) => (Number(it.quantity) || 0) <= 0).length;
  }, [roomScopedItems]);

  // Visible columns based on show/hide checklist
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => hiddenColumnIds.indexOf(col.id) === -1);
  }, [columns, hiddenColumnIds]);

  // Filtered and sorted dataset
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedRoomId !== 'ALL' && item.roomId !== selectedRoomId) return false;
        if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
        if (conditionFilter !== 'ALL' && item.condition !== conditionFilter && item.status !== conditionFilter) {
          return false;
        }
        if (needsAttentionFilter && !isNeedsAttention(item)) return false;
        if (outOfStockFilter && (Number(item.quantity) || 0) > 0) return false;

        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matches = Object.entries(item).some(([k, val]) => {
            if (k === 'id' || k === 'roomId' || k === 'createdAt' || k === 'updatedAt') return false;
            return String(val).toLowerCase().includes(q);
          });
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (valA === undefined) valA = '';
        if (valB === undefined) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const comp = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: 'base'
        });
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [
    items,
    selectedRoomId,
    categoryFilter,
    conditionFilter,
    needsAttentionFilter,
    outOfStockFilter,
    searchQuery,
    sortField,
    sortDirection
  ]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  // ── Item Quantity Direct Manipulation ───────────────────────────
  const handleQuantityChange = async (itemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const newQty = Math.max(0, (Number(it.quantity) || 0) + delta);
          return { ...it, quantity: newQty, updatedAt: new Date().toISOString() };
        }
        return it;
      })
    );
  };

  const handleSetQuantity = async (itemId: string, newQty: number) => {
    const val = Math.max(0, newQty || 0);
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return { ...it, quantity: val, updatedAt: new Date().toISOString() };
        }
        return it;
      })
    );
  };

  // ── Bulk Selection Handlers ─────────────────────────────────────
  const handleToggleSelect = (itemId: string) => {
    setSelectedIds((prev) => {
      const idx = prev.indexOf(itemId);
      if (idx === -1) return [...prev, itemId];
      return prev.filter((id) => id !== itemId);
    });
  };

  const handleToggleSelectPage = (pageIds: string[], select: boolean) => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (select) {
        pageIds.forEach((id) => set.add(id));
      } else {
        pageIds.forEach((id) => set.delete(id));
      }
      return Array.from(set);
    });
  };

  const handleBulkMove = (targetRoomId: string) => {
    const count = selectedIds.length;
    if (count === 0) return;
    const targetRoom = rooms.find((r) => r.id === targetRoomId);
    const roomName = targetRoom?.name || 'facility room';
    const now = new Date().toISOString();

    setItems((prev) =>
      prev.map((it) => {
        if (selectedIds.indexOf(it.id) !== -1) {
          return { ...it, roomId: targetRoomId, room: roomName, updatedAt: now };
        }
        return it;
      })
    );
    showToast(`Transferred ${count} items to "${roomName}"`, 'success');
    setSelectedIds([]);
  };

  const handleBulkSetStatus = (newStatus: string) => {
    const count = selectedIds.length;
    if (count === 0) return;
    const now = new Date().toISOString();

    setItems((prev) =>
      prev.map((it) => {
        if (selectedIds.indexOf(it.id) !== -1) {
          return { ...it, status: newStatus, condition: newStatus, updatedAt: now };
        }
        return it;
      })
    );
    showToast(`Updated status to "${newStatus}" for ${count} items`, 'success');
    setSelectedIds([]);
  };

  const handleBulkExportExcel = async () => {
    const selected = items.filter((it) => selectedIds.indexOf(it.id) !== -1);
    if (selected.length === 0) return;
    const { exportInventoryToExcel } = await import('./utils/excelExport');
    exportInventoryToExcel('current', rooms, selected, columns, currentRoom);
    showToast(`Exported ${selected.length} items to Excel`, 'success');
  };

  const handleExportExcel = async (mode: 'multi' | 'current') => {
    const { exportInventoryToExcel } = await import('./utils/excelExport');
    exportInventoryToExcel(mode, rooms, items, columns, currentRoom);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    if (count === 0) return;
    setConfirmDialog({
      title: `Delete ${count} Selected Items`,
      message: `Are you sure you want to delete ${count} inventory ${
        count === 1 ? 'item' : 'items'
      }? This action removes them from the catalog.`,
      isDestructive: true,
      onConfirm: () => {
        setItems((prev) => prev.filter((it) => selectedIds.indexOf(it.id) === -1));
        showToast(`Deleted ${count} items`, 'success');
        setSelectedIds([]);
        setConfirmDialog(null);
      }
    });
  };

  // ── Column Visibility Toggle ────────────────────────────────────
  const handleToggleColumn = (columnId: string) => {
    setHiddenColumnIds((prev) => {
      const idx = prev.indexOf(columnId);
      if (idx === -1) return [...prev, columnId];
      return prev.filter((id) => id !== columnId);
    });
  };

  // ── Delete Confirmations ────────────────────────────────────────
  const confirmDeleteItem = (item: InventoryItem) => {
    setConfirmDialog({
      title: 'Delete Inventory Item',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      isDestructive: true,
      onConfirm: () => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        showToast(`Deleted "${item.name}"`, 'success');
        setConfirmDialog(null);
      }
    });
  };

  const confirmDeleteRoom = (room: Room) => {
    const count = items.filter((i) => i.roomId === room.id).length;
    setConfirmDialog({
      title: `Delete Facility Room: ${room.name}`,
      message: `Deleting this room will also remove its ${count} associated inventory ${
        count === 1 ? 'item' : 'items'
      }. Proceed?`,
      isDestructive: true,
      onConfirm: () => {
        setRooms((prev) => prev.filter((r) => r.id !== room.id));
        setItems((prev) => prev.filter((i) => i.roomId !== room.id));
        if (selectedRoomId === room.id) setSelectedRoomId('ALL');
        showToast(`Room "${room.name}" removed`, 'success');
        setConfirmDialog(null);
      }
    });
  };

  // ── Reset & Clear ───────────────────────────────────────────────
  const handleResetSampleData = () => {
    setConfirmDialog({
      title: 'Reset to Sample Data',
      message:
        'This will replace all current rooms and items with the official KM100 Skills and Training Center catalog. Proceed?',
      isDestructive: true,
      onConfirm: () => {
        setRooms(DEFAULT_ROOMS);
        setItems(DEFAULT_ITEMS);
        setColumns(DEFAULT_COLUMNS);
        setSelectedRoomId('ALL');
        showToast('Reset to default training center sample catalog', 'info');
        setConfirmDialog(null);
      }
    });
  };

  const handleClearAllData = () => {
    setConfirmDialog({
      title: 'Purge All Inventory Data',
      message:
        'Are you sure you want to clear all rooms and items? This creates a completely empty fresh inventory workspace.',
      isDestructive: true,
      onConfirm: () => {
        setRooms([]);
        setItems([]);
        setSelectedRoomId('ALL');
        showToast('All inventory cleared', 'info');
        setConfirmDialog(null);
      }
    });
  };

  // ── Backup JSON Handlers ────────────────────────────────────────
  const handleBackupExport = () => {
    const payload = {
      version: '1.0',
      organization: 'KM100 Skills and Training Center, Inc.',
      exportedAt: new Date().toISOString(),
      rooms,
      columns,
      items
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KM100_Inventory_Backup_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded successfully');
  };

  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.rooms || !data.items || !data.columns) {
          throw new Error('Invalid backup file structure.');
        }
        setRooms(data.rooms);
        setItems(data.items);
        setColumns(data.columns);
        setSelectedRoomId('ALL');
        showToast('Inventory backup successfully restored!', 'success');
      } catch {
        alert('Failed to parse backup JSON file. Please ensure it is a valid KM100 backup export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── High-Craft Spreadsheet Import with Preview Modal ───────────
  const handleTriggerUploadExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (ev: Event) => {
      const target = ev.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      try {
        const { analyzeSpreadsheet } = await import('./utils/importParse');
        const analysis = await analyzeSpreadsheet(file);
        if (analysis.totalItems === 0) {
          showToast('No valid inventory items found in the file.', 'error');
          return;
        }
        setImportAnalysis(analysis);
      } catch (err) {
        showToast('Failed to analyze spreadsheet: ' + (err instanceof Error ? err.message : String(err)), 'error');
      }
    };
    input.click();
  };

  const handleImportDirect = () => {
    if (!importAnalysis) return;
    const existingRoomNames = new Map(rooms.map((r) => [r.name.trim().toLowerCase(), r.id]));
    const newRooms: Room[] = [...rooms];

    importAnalysis.roomsList.forEach((roomName) => {
      const key = roomName.trim().toLowerCase();
      if (!existingRoomNames.has(key)) {
        const id = generateRoomId();
        existingRoomNames.set(key, id);
        newRooms.push({ id, name: roomName });
      }
    });

    const fallbackRoomId = rooms[0]?.id || 'room-ccs';
    const mappedItems: InventoryItem[] = importAnalysis.items.map((it) => ({
      ...it,
      roomId: existingRoomNames.get(it.room?.trim().toLowerCase()) || fallbackRoomId
    }));

    setRooms(newRooms);
    setItems((prev) => [...mappedItems, ...prev]);
    showToast(`Successfully imported ${mappedItems.length} items across ${importAnalysis.roomsList.length} facilities`, 'success');
    setImportAnalysis(null);
  };

  const handleImportCurrentRoom = () => {
    if (!importAnalysis) return;
    const targetRoomId = selectedRoomId !== 'ALL' ? selectedRoomId : (rooms[0]?.id || 'room-ccs');
    const targetRoomName = rooms.find((r) => r.id === targetRoomId)?.name || 'Current Room';

    const mappedItems: InventoryItem[] = importAnalysis.items.map((it) => ({
      ...it,
      roomId: targetRoomId,
      room: targetRoomName
    }));

    setItems((prev) => [...mappedItems, ...prev]);
    showToast(`Added ${mappedItems.length} items to "${targetRoomName}"`, 'success');
    setImportAnalysis(null);
  };

  const handleReplaceAll = () => {
    if (!importAnalysis) return;
    const existingRoomNames = new Map<string, string>();
    const newRooms: Room[] = [];

    importAnalysis.roomsList.forEach((roomName) => {
      const key = roomName.trim().toLowerCase();
      const id = generateRoomId();
      existingRoomNames.set(key, id);
      newRooms.push({ id, name: roomName });
    });

    const fallbackRoomId = newRooms[0]?.id || 'room-ccs';
    const mappedItems: InventoryItem[] = importAnalysis.items.map((it) => ({
      ...it,
      roomId: existingRoomNames.get(it.room?.trim().toLowerCase()) || fallbackRoomId
    }));

    setRooms(newRooms);
    setItems(mappedItems);
    setSelectedRoomId('ALL');
    showToast(`Replaced entire catalog with ${mappedItems.length} items from spreadsheet`, 'success');
    setImportAnalysis(null);
  };

  const handleSort = (columnId: string) => {
    if (sortField === columnId) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(columnId);
      setSortDirection('asc');
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* ── Global Institutional Header ─────────────────────────────── */}
      <Header
        onOpenColumnsModal={() => setIsColumnsModalOpen(true)}
        onExportExcel={handleExportExcel}
        onExportCsv={() => downloadInventoryCsv(items, rooms, columns)}
        onTriggerUploadExcel={handleTriggerUploadExcel}
        onExportBackup={handleBackupExport}
        onImportBackup={handleBackupImport}
        onResetSampleData={handleResetSampleData}
        onClearAllData={handleClearAllData}
        onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        selectedRoomId={selectedRoomId}
        currentRoom={currentRoom}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Desktop Facilities Sidebar ───────────────────────────── */}
        <Sidebar
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
          onAddRoom={() => {
            setEditingRoom(null);
            setIsRoomModalOpen(true);
          }}
          onEditRoom={(room) => {
            setEditingRoom(room);
            setIsRoomModalOpen(true);
          }}
          onDeleteRoom={confirmDeleteRoom}
          totalItemsCount={items.length}
          roomItemCounts={roomItemCounts}
        />

        {/* ── Main Content Area ────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Overview Dashboard (When "All Rooms" is selected) */}
          {selectedRoomId === 'ALL' && (
            <OverviewDashboard
              rooms={rooms}
              items={items}
              roomItemCounts={roomItemCounts}
              onSelectRoom={setSelectedRoomId}
              onAddItem={() => {
                if (rooms.length === 0) {
                  showToast('Create a facility room before adding inventory items.', 'error');
                  return;
                }
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
            />
          )}

          {/* Individual Room Header */}
          {selectedRoomId !== 'ALL' && currentRoom && (
            <div className="p-4 lg:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRoomId('ALL')}
                      className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Facilities
                    </button>
                    <span className="text-slate-400 text-xs">/</span>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {currentRoom.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentRoom.description || 'Facility Inventory Catalog'} &bull;{' '}
                    {roomItemCounts[currentRoom.id]?.unique || 0} unique items,{' '}
                    {roomItemCounts[currentRoom.id]?.totalQty || 0} total units
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingRoom(currentRoom);
                      setIsRoomModalOpen(true);
                    }}
                    className="p-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Edit Facility Name / Description"
                  >
                    <Edit size={15} />
                  </button>

                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsItemModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm shadow-amber-600/20 transition-all active:scale-[0.98]"
                  >
                    <Plus size={16} /> Add Item to {currentRoom.name}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Table & Interactive Control Area ───────────────────── */}
          <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col min-h-0">
            <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
              {/* Quick Status KPI Strip (Industry Standard Bar) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 no-print">
                <button
                  onClick={() => {
                    setNeedsAttentionFilter(false);
                    setOutOfStockFilter(false);
                    setConditionFilter('ALL');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    !needsAttentionFilter && !outOfStockFilter && conditionFilter === 'ALL'
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">Catalog SKUs</span>
                    <Package size={14} className="text-amber-700" />
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {roomScopedItems.length}
                  </div>
                  <span className="text-xs text-slate-400">Total tracked items</span>
                </button>

                <button
                  onClick={() => {
                    setNeedsAttentionFilter(false);
                    setOutOfStockFilter(false);
                  }}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">In-Stock Units</span>
                    <Layers size={14} className="text-emerald-600" />
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {roomScopedItems.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)}
                  </div>
                  <span className="text-xs text-slate-400">Physical total</span>
                </button>

                <button
                  onClick={() => setNeedsAttentionFilter((prev) => !prev)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    needsAttentionFilter
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">Needs Attention</span>
                    <AlertTriangle size={14} className="text-rose-500" />
                  </div>
                  <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                    {attentionCount}
                  </div>
                  {attentionCount > 0 && (
                    <span className="text-xs font-sans px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold inline-block mt-1">
                      Filter
                    </span>
                  )}
                  <span className="text-xs text-slate-400">Defective, empty, incomplete</span>
                </button>

                <button
                  onClick={() => setOutOfStockFilter((prev) => !prev)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    outOfStockFilter
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-800 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">Depleted / Out</span>
                    <PackageX size={14} className="text-amber-600" />
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums">
                    {outOfStockCount}
                  </div>
                  {outOfStockCount > 0 && (
                    <span className="text-xs font-sans px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold inline-block mt-1">
                      Filter
                    </span>
                  )}
                  <span className="text-xs text-slate-400">0 quantity recorded</span>
                </button>
              </div>

              {/* ── Toolbar: Search, Filters, Column Toggle ────────────── */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
                {/* Search box with keyboard shortcut indicator */}
                <div className="relative flex-1 min-w-[220px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={15} />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search catalog by name, category, remarks, or serial... (Press '/' to focus)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns & Column Visibility */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
                    <Filter size={13} className="text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-500">Cat:</span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-medium text-slate-500">Condition:</span>
                    <select
                      value={conditionFilter}
                      onChange={(e) => setConditionFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Conditions</option>
                      {ITEM_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Column Visibility Menu */}
                  <ColumnsVisibilityMenu
                    columns={columns}
                    hiddenColumnIds={hiddenColumnIds}
                    onToggleColumn={handleToggleColumn}
                    onOpenSchemaBuilder={() => setIsColumnsModalOpen(true)}
                  />

                  {/* Reset Filters Button */}
                  {(searchQuery ||
                    categoryFilter !== 'ALL' ||
                    conditionFilter !== 'ALL' ||
                    needsAttentionFilter ||
                    outOfStockFilter) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('ALL');
                        setConditionFilter('ALL');
                        setNeedsAttentionFilter(false);
                        setOutOfStockFilter(false);
                      }}
                      className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-semibold"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* ── Contextual Inline Bulk Action Bar ───────────────── */}
              <BulkActionBar
                count={selectedIds.length}
                rooms={rooms}
                onClear={() => setSelectedIds([])}
                onMove={handleBulkMove}
                onSetStatus={handleBulkSetStatus}
                onExportExcel={handleBulkExportExcel}
                onDelete={handleBulkDelete}
              />

              {/* ── Main Data Table ─────────────────────────────────── */}
              <InventoryTable
                items={paginatedItems}
                columns={visibleColumns}
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectRoom={setSelectedRoomId}
                onQuantityChange={handleQuantityChange}
                onSetQuantity={handleSetQuantity}
                onEditItem={(item) => {
                  setEditingItem(item);
                  setIsItemModalOpen(true);
                }}
                onDeleteItem={confirmDeleteItem}
                onPrintAssetTag={(item) => setAssetTagItem(item)}
                onAddItem={() => {
                  if (rooms.length === 0) {
                    showToast('Create a facility room before adding inventory items.', 'error');
                    return;
                  }
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                onResetFilters={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                  setConditionFilter('ALL');
                  setNeedsAttentionFilter(false);
                  setOutOfStockFilter(false);
                }}
                isFiltered={Boolean(
                  searchQuery ||
                  categoryFilter !== 'ALL' ||
                  conditionFilter !== 'ALL' ||
                  needsAttentionFilter ||
                  outOfStockFilter
                )}
                totalItemsInCatalog={items.length}
                totalFilteredCount={filteredItems.length}
                totalFilteredUnits={filteredItems.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectPage={handleToggleSelectPage}
                page={currentPage}
                pageSize={PAGE_SIZE}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </main>
      </div>

      {/* ── Slide-in Mobile Drawer ──────────────────────────────────── */}
      {isMobileNavOpen && (
        <MobileNav
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          totalItemsCount={items.length}
          roomItemCounts={roomItemCounts}
          onSelectRoom={(id) => {
            setSelectedRoomId(id);
            setIsMobileNavOpen(false);
          }}
          onAddRoom={() => {
            setIsMobileNavOpen(false);
            setEditingRoom(null);
            setIsRoomModalOpen(true);
          }}
          onClose={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* ── Item Add / Edit Modal ───────────────────────────────────── */}
      {isItemModalOpen && (
        <Suspense fallback={null}>
          <ItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          editingItem={editingItem}
          columns={columns}
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSave={async (savedItem) => {
            if (editingItem) {
              setItems((prev) => prev.map((i) => (i.id === savedItem.id ? savedItem : i)));
              showToast(`Updated item "${savedItem.name}"`, 'success');
            } else {
              setItems((prev) => [savedItem, ...prev]);
              showToast(`Added item "${savedItem.name}"`, 'success');
            }
            setIsItemModalOpen(false);
          }}
        />
        </Suspense>
      )}

      {/* ── Schema Builder Modal ────────────────────────────────────── */}
      {isColumnsModalOpen && (
        <Suspense fallback={null}>
          <ColumnsSchemaModal
          isOpen={isColumnsModalOpen}
          onClose={() => setIsColumnsModalOpen(false)}
          columns={columns}
          onSave={async (newCols) => {
            setColumns(newCols);
            showToast('Inventory column schema updated successfully!', 'success');
            setIsColumnsModalOpen(false);
          }}
        />
        </Suspense>
      )}

      {/* ── Room Add / Rename Modal ─────────────────────────────────── */}
      {isRoomModalOpen && (
        <Suspense fallback={null}>
          <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          editingRoom={editingRoom}
          onSave={async (savedRoom) => {
            if (editingRoom) {
              setRooms((prev) => prev.map((r) => (r.id === savedRoom.id ? savedRoom : r)));
              showToast(`Renamed room to "${savedRoom.name}"`, 'success');
            } else {
              setRooms((prev) => [...prev, savedRoom]);
              setSelectedRoomId(savedRoom.id);
              showToast(`Created facility room "${savedRoom.name}"`, 'success');
            }
            setIsRoomModalOpen(false);
          }}
        />
        </Suspense>
      )}

      {/* ── Equipment Asset Tag Printable Sticker Modal ─────────────── */}
      {assetTagItem && (
        <Suspense fallback={null}>
          <AssetTagModal
          item={assetTagItem}
          rooms={rooms}
          onClose={() => setAssetTagItem(null)}
        />
        </Suspense>
      )}

      {/* ── Spreadsheet Upload Preview & Strategy Modal ─────────────── */}
      {importAnalysis && (
        <Suspense fallback={null}>
          <ImportPreviewModal
          analysis={importAnalysis}
          currentRoom={currentRoom}
          onCancel={() => setImportAnalysis(null)}
          onImportDirect={handleImportDirect}
          onImportCurrentRoom={handleImportCurrentRoom}
          onReplaceAll={handleReplaceAll}
        />
        </Suspense>
      )}

      {/* ── Formal Printable Audit Report (Revealed on window.print) ── */}
      <Suspense fallback={null}>
        <PrintReport
        items={filteredItems}
        rooms={rooms}
        facilityName={currentRoom ? currentRoom.name : 'Master Inventory (All Facilities)'}
      />
      </Suspense>

      {/* ── Action Confirmation Dialog ──────────────────────────────── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700'
                }`}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {confirmDialog.title}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.98] ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-700 hover:bg-amber-800'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ─────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-toast ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-amber-700 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check size={18} /> : <Sparkles size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;



