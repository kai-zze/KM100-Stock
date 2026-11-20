import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnDefinition,
  ColumnType,
  InventoryItem,
  Room,
  ITEM_STATUSES
} from './types/inventory';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { InventoryTable } from './components/InventoryTable';
import { ItemModal } from './components/ItemModal';
import { ColumnsSchemaModal } from './components/ColumnsSchemaModal';
import { RoomModal } from './components/RoomModal';
import { exportInventoryToExcel } from './utils/excelExport';
import { parseCsvText, parseImportRows } from './utils/csvImport';
import { supabase } from './utils/supabaseClient';
import * as XLSX from 'xlsx';
import { Search, Filter, X, Edit, Plus, AlertTriangle, Check, Sparkles } from 'lucide-react';

const STORAGE_KEY_ROOMS = 'km100_inventory_rooms_v1';
const STORAGE_KEY_ITEMS = 'km100_inventory_items_v1';
const STORAGE_KEY_COLUMNS = 'km100_inventory_columns_v1';
const STORAGE_KEY_THEME = 'km100_inventory_theme_v1';

import { DEFAULT_COLUMNS, DEFAULT_ROOMS, DEFAULT_ITEMS } from './data/defaultData';

export function App() {
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

  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Supabase cloud sync state
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Excel/CSV import state
  const [importPending, setImportPending] = useState<{ file: File; data: any[] } | null>(null);

  // Map Supabase row -> InventoryItem
  const toInventoryItem = (row: any): InventoryItem => ({
    id: row.id,
    roomId: row.room_id,
    name: row.name,
    category: row.category ?? 'General',
    quantity: Number(row.quantity) || 0,
    units: row.units ?? 'pcs',
    status: row.condition ?? 'Working',
    condition: row.condition ?? 'Working',
    remarks: row.remarks ?? '',
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString()
  });

  // Map InventoryItem -> Supabase inventory_items row shape
  const toItemRow = (item: InventoryItem) => ({
    id: item.id,
    room_id: item.roomId,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    units: item.units,
    condition: item.condition ?? item.status ?? 'Working',
    remarks: item.remarks ?? '',
    custom_fields: {}
  });

  // --- Supabase write helpers (fire-and-forget; local state is source of truth for UI) ---
  const syncRoomsToSupabase = async (roomsToSync: Room[]) => {
    try {
      await supabase.from('rooms').upsert(
        roomsToSync.map((r) => ({ id: r.id, name: r.name, description: r.description }))
      );
    } catch {
      // Silently fail; localStorage remains the fallback
    }
  };

  const syncColumnsToSupabase = async (columnsToSync: ColumnDefinition[]) => {
    try {
      await supabase.from('columns_schema').upsert(
        columnsToSync.map((c) => ({
          id: c.id,
          label: c.label,
          type: c.type,
          order_index: c.order,
          options: c.options ?? []
        }))
      );
    } catch {
      // Silently fail
    }
  };

  const syncItemsToSupabase = async (itemsToSync: InventoryItem[]) => {
    try {
      await supabase.from('inventory_items').upsert(itemsToSync.map(toItemRow));
    } catch {
      // Silently fail
    }
  };

  const syncSingleItemToSupabase = async (item: InventoryItem) => {
    try {
      await supabase.from('inventory_items').upsert(toItemRow(item));
    } catch {
      // Silently fail
    }
  };

  const deleteItemFromSupabase = async (itemId: string) => {
    try {
      await supabase.from('inventory_items').delete().eq('id', itemId);
    } catch {
      // Silently fail
    }
  };

  const deleteRoomFromSupabase = async (roomId: string) => {
    try {
      await supabase.from('inventory_items').delete().eq('room_id', roomId);
      await supabase.from('rooms').delete().eq('id', roomId);
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    // Lock system strictly to Light Mode
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem(STORAGE_KEY_THEME);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
  }, [columns]);

  // --- Supabase cloud sync: load on mount, fall back to localStorage defaults ---
  useEffect(() => {
    let mounted = true;

    const loadFromSupabase = async () => {
      try {
        const [roomsRes, columnsRes, itemsRes] = await Promise.all([
          supabase.from('rooms').select('*').order('name', { ascending: true }),
          supabase.from('columns_schema').select('*').order('order_index', { ascending: true }),
          supabase.from('inventory_items').select('*').order('created_at', { ascending: false })
        ]);

        if (!mounted) return;

        if (roomsRes.data && roomsRes.data.length > 0) {
          setRooms(
            roomsRes.data.map((r: any) => ({
              id: r.id,
              name: r.name,
              description: r.description
            }))
          );
        }
        if (columnsRes.data && columnsRes.data.length > 0) {
          setColumns(
            columnsRes.data.map((c: any) => ({
              id: c.id,
              label: c.label,
              type: c.type as ColumnType,
              options: c.options ?? [],
              required: false,
              isSystem: false,
              order: c.order_index ?? 0
            }))
          );
        }
        if (itemsRes.data && itemsRes.data.length > 0) {
          setItems(itemsRes.data.map(toInventoryItem));
        }
        setIsSupabaseReady(true);
      } catch (err) {
        if (!mounted) return;
        setSupabaseError(err instanceof Error ? err.message : 'Supabase connection failed');
        setIsSupabaseReady(true); // allow local fallback to proceed
      }
    };

    loadFromSupabase();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Supabase realtime subscription: mirror remote changes into local state ---
  useEffect(() => {
    if (!isSupabaseReady) return;

    const channel = supabase
      .channel('km100-inventory-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        (payload: any) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setRooms((prev) => {
              const exists = prev.some((r) => r.id === payload.new.id);
              if (exists) return prev;
              return [...prev, { id: payload.new.id, name: payload.new.name, description: payload.new.description }];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setRooms((prev) =>
              prev.map((r) =>
                r.id === payload.new.id
                  ? { ...r, name: payload.new.name, description: payload.new.description }
                  : r
              )
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setRooms((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'columns_schema' },
        (payload: any) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setColumns((prev) => {
              const exists = prev.some((c) => c.id === payload.new.id);
              if (exists) return prev;
              return [
                ...prev,
                {
                  id: payload.new.id,
                  label: payload.new.label,
                  type: payload.new.type as ColumnType,
                  options: payload.new.options ?? [],
                  order: payload.new.order_index ?? 0
                }
              ];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setColumns((prev) =>
              prev.map((c) =>
                c.id === payload.new.id
                  ? { ...c, label: payload.new.label, type: payload.new.type as ColumnType, order: payload.new.order_index }
                  : c
              )
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setColumns((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        (payload: any) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setItems((prev) => {
              const exists = prev.some((i) => i.id === payload.new.id);
              if (exists) return prev;
              return [toInventoryItem(payload.new), ...prev];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setItems((prev) =>
              prev.map((i) => (i.id === payload.new.id ? toInventoryItem(payload.new) : i))
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setItems((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseReady]);

  // Impeccable A11y: Escape Key to dismiss modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDialog) setConfirmDialog(null);
        else if (isItemModalOpen) setIsItemModalOpen(false);
        else if (isColumnsModalOpen) setIsColumnsModalOpen(false);
        else if (isRoomModalOpen) setIsRoomModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog, isItemModalOpen, isColumnsModalOpen, isRoomModalOpen]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const currentRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId);
  }, [rooms, selectedRoomId]);

  const roomItemCounts = useMemo(() => {
    const counts: Record<string, { unique: number; totalQty: number }> = {};
    rooms.forEach(r => {
      counts[r.id] = { unique: 0, totalQty: 0 };
    });
    items.forEach(item => {
      if (counts[item.roomId]) {
        counts[item.roomId].unique += 1;
        counts[item.roomId].totalQty += Number(item.quantity) || 0;
      }
    });
    return counts;
  }, [rooms, items]);

  const availableCategories = useMemo(() => {
    const catCol = columns.find(c => c.id === 'category');
    if (catCol && catCol.options && catCol.options.length > 0) {
      return catCol.options;
    }
    const set = new Set<string>();
    items.forEach(it => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set);
  }, [columns, items]);

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        if (selectedRoomId !== 'ALL' && item.roomId !== selectedRoomId) return false;
        if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
        if (conditionFilter !== 'ALL' && item.condition !== conditionFilter) return false;
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
  }, [items, selectedRoomId, categoryFilter, conditionFilter, searchQuery, sortField, sortDirection]);

  const handleQuantityChange = async (itemId: string, delta: number) => {
    const item = items.find((i) => i.id === itemId);
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const newQty = Math.max(0, (Number(it.quantity) || 0) + delta);
          return { ...it, quantity: newQty, updatedAt: new Date().toISOString() };
        }
        return it;
      })
    );
    if (item) {
      await syncSingleItemToSupabase({
        ...item,
        quantity: Math.max(0, (Number(item.quantity) || 0) + delta),
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleSetQuantity = async (itemId: string, newQty: number) => {
    const val = Math.max(0, newQty || 0);
    const item = items.find((i) => i.id === itemId);
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return { ...it, quantity: val, updatedAt: new Date().toISOString() };
        }
        return it;
      })
    );
    if (item) {
      await syncSingleItemToSupabase({ ...item, quantity: val, updatedAt: new Date().toISOString() });
    }
  };

  const confirmDeleteItem = (item: InventoryItem) => {
    setConfirmDialog({
      title: 'Delete Inventory Item',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      isDestructive: true,
      onConfirm: async () => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        await deleteItemFromSupabase(item.id);
        showToast(`Deleted "${item.name}"`, 'success');
        setConfirmDialog(null);
      }
    });
  };

  const confirmDeleteRoom = (room: Room) => {
    const roomItems = items.filter(i => i.roomId === room.id);
    const count = roomItems.length;
    setConfirmDialog({
      title: `Delete Room: ${room.name}`,
      message: `Deleting this room will also permanently delete ${count} associated inventory ${
        count === 1 ? 'item' : 'items'
      }. Proceed?`,
      isDestructive: true,
      onConfirm: async () => {
        setRooms((prev) => prev.filter((r) => r.id !== room.id));
        setItems((prev) => prev.filter((i) => i.roomId !== room.id));
        await deleteRoomFromSupabase(room.id);
        if (selectedRoomId === room.id) setSelectedRoomId('ALL');
        showToast(`Room "${room.name}" removed`, 'success');
        setConfirmDialog(null);
      }
    });
  };

  const handleResetSampleData = () => {
    setConfirmDialog({
      title: 'Reset to Sample Data',
      message:
        'This will replace all current rooms, custom columns, and items with the default KM100 training center catalog. Proceed?',
      isDestructive: true,
      onConfirm: async () => {
        setRooms(DEFAULT_ROOMS);
        setItems(DEFAULT_ITEMS);
        setColumns(DEFAULT_COLUMNS);
        setSelectedRoomId('ALL');
        await syncRoomsToSupabase(DEFAULT_ROOMS);
        await syncColumnsToSupabase(DEFAULT_COLUMNS);
        await syncItemsToSupabase(DEFAULT_ITEMS);
        showToast('Reset to default training center sample data', 'info');
        setConfirmDialog(null);
      }
    });
  };

  const handleClearAllData = () => {
    setConfirmDialog({
      title: 'Clear All Inventory Data',
      message:
        'Are you sure you want to clear all rooms and items? This creates a completely empty fresh inventory workspace.',
      isDestructive: true,
      onConfirm: async () => {
        setRooms([]);
        setItems([]);
        setSelectedRoomId('ALL');
        try {
          await supabase.from('inventory_items').delete().gte('id', '');
          await supabase.from('rooms').delete().gte('id', '');
          await supabase.from('columns_schema').delete().gte('id', '');
        } catch {
          // Supabase clear best-effort
        }
        showToast('All inventory cleared', 'info');
        setConfirmDialog(null);
      }
    });
  };

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
    reader.onload = event => {
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

  // --- Excel/CSV import: trigger file picker ---
  const handleTriggerUploadExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (ev: Event) => {
      const target = ev.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      setImportPending({ file, data: [] });
      handleImportExcelFile(file);
    };
    input.click();
  };

  // --- Excel/CSV import: parse file and merge into inventory ---
  const handleImportExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        let rows: any[] = [];

        if (file.name.toLowerCase().endsWith('.csv')) {
          const text = typeof result === 'string' ? result : new TextDecoder().decode(result as ArrayBuffer);
          rows = parseCsvText(text);
        } else {
          const data = new Uint8Array(result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        }

        const defaultRoomId =
          selectedRoomId !== 'ALL' ? selectedRoomId : 'room-ccs';
        const importedItems = parseImportRows(rows, defaultRoomId);

        if (importedItems.length === 0) {
          alert('No valid rows found in the file.');
          setImportPending(null);
          return;
        }

        setItems((prev) => [...importedItems, ...prev]);
        setSelectedRoomId('ALL');
        syncItemsToSupabase(importedItems);
        showToast(`Imported ${importedItems.length} item(s) from ${file.name}`, 'success');
        setImportPending(null);
      } catch (err) {
        alert('Failed to import file: ' + (err instanceof Error ? err.message : String(err)));
        setImportPending(null);
      }
    };
    reader.onerror = () => {
      alert('Failed to read file.');
      setImportPending(null);
    };

    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSort = (columnId: string) => {
    if (sortField === columnId) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(columnId);
      setSortDirection('asc');
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header
        onOpenColumnsModal={() => setIsColumnsModalOpen(true)}
        onExportExcel={mode => exportInventoryToExcel(mode, rooms, items, columns, currentRoom)}
        onTriggerUploadExcel={handleTriggerUploadExcel}
        onExportBackup={handleBackupExport}
        onImportBackup={handleBackupImport}
        onResetSampleData={handleResetSampleData}
        onClearAllData={handleClearAllData}
        selectedRoomId={selectedRoomId}
        currentRoom={currentRoom}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
          onAddRoom={() => {
            setEditingRoom(null);
            setIsRoomModalOpen(true);
          }}
          onEditRoom={room => {
            setEditingRoom(room);
            setIsRoomModalOpen(true);
          }}
          onDeleteRoom={confirmDeleteRoom}
          totalItemsCount={items.length}
          roomItemCounts={roomItemCounts}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {selectedRoomId === 'ALL' && (
            <OverviewDashboard
              rooms={rooms}
              items={items}
              roomItemCounts={roomItemCounts}
              onSelectRoom={setSelectedRoomId}
              onAddItem={() => {
                if (rooms.length === 0) {
                  alert('Please create at least one room first.');
                  return;
                }
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
            />
          )}

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
                    {currentRoom.description || 'Room Inventory Catalog'} &bull;{' '}
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
                    className="p-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Edit Room Details"
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

          {/* Table Area */}
          <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
            <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
              {/* Filter Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search items, category, remarks, or custom fields..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400"
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

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
                    <Filter size={13} className="text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-500">Cat:</span>
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-medium text-slate-500">Condition:</span>
                    <select
                      value={conditionFilter}
                      onChange={e => setConditionFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Conditions</option>
                      <option value="Working">Working</option>
                      <option value="Used">Used</option>
                      <option value="Defective">Defective</option>
                      <option value="Empty">Empty</option>
                      <option value="Incomplete">Incomplete</option>
                    </select>
                  </div>

                  {(searchQuery || categoryFilter !== 'ALL' || conditionFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('ALL');
                        setConditionFilter('ALL');
                      }}
                      className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-semibold"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              <InventoryTable
                items={filteredItems}
                columns={columns}
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectRoom={setSelectedRoomId}
                onQuantityChange={handleQuantityChange}
                onSetQuantity={handleSetQuantity}
                onEditItem={item => {
                  setEditingItem(item);
                  setIsItemModalOpen(true);
                }}
                onDeleteItem={confirmDeleteItem}
                onAddItem={() => {
                  if (rooms.length === 0) {
                    alert('Please create a room first.');
                    return;
                  }
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                onResetFilters={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                  setConditionFilter('ALL');
                }}
                isFiltered={Boolean(searchQuery || categoryFilter !== 'ALL' || conditionFilter !== 'ALL')}
                totalItemsInCatalog={items.length}
              />
            </div>
          </div>
        </main>
      </div>

      {isItemModalOpen && (
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
              await syncSingleItemToSupabase(savedItem);
              showToast(`Updated item "${savedItem.name}"`, 'success');
            } else {
              setItems((prev) => [savedItem, ...prev]);
              await syncSingleItemToSupabase(savedItem);
              showToast(`Added item "${savedItem.name}"`, 'success');
            }
            setIsItemModalOpen(false);
          }}
        />
      )}

      {isColumnsModalOpen && (
        <ColumnsSchemaModal
          isOpen={isColumnsModalOpen}
          onClose={() => setIsColumnsModalOpen(false)}
          columns={columns}
          onSave={async (newCols) => {
            setColumns(newCols);
            await syncColumnsToSupabase(newCols);
            showToast('Inventory column schema updated successfully!', 'success');
            setIsColumnsModalOpen(false);
          }}
        />
      )}

      {isRoomModalOpen && (
        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          editingRoom={editingRoom}
          onSave={async savedRoom => {
            if (editingRoom) {
              setRooms((prev) => prev.map((r) => (r.id === savedRoom.id ? savedRoom : r)));
              await syncRoomsToSupabase([savedRoom]);
              showToast(`Renamed room to "${savedRoom.name}"`, 'success');
            } else {
              setRooms((prev) => [...prev, savedRoom]);
              await syncRoomsToSupabase([...rooms, savedRoom]);
              setSelectedRoomId(savedRoom.id);
              showToast(`Created facility room "${savedRoom.name}"`, 'success');
            }
            setIsRoomModalOpen(false);
          }}
        />
      )}

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
