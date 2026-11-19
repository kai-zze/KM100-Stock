import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnDefinition,
  InventoryItem,
  Room
} from './types/inventory';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { InventoryTable } from './components/InventoryTable';
import { ItemModal } from './components/ItemModal';
import { ColumnsSchemaModal } from './components/ColumnsSchemaModal';
import { RoomModal } from './components/RoomModal';
import { exportInventoryToExcel } from './utils/excelExport';
import { Search, Filter, X, Edit, Plus, AlertTriangle, Check, Sparkles } from 'lucide-react';

const STORAGE_KEY_ROOMS = 'km100_inventory_rooms_v1';
const STORAGE_KEY_ITEMS = 'km100_inventory_items_v1';
const STORAGE_KEY_COLUMNS = 'km100_inventory_columns_v1';
const STORAGE_KEY_THEME = 'km100_inventory_theme_v1';

const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { id: 'name', label: 'ITEM NAME', type: 'text', required: true, isSystem: true, order: 1 },
  {
    id: 'category',
    label: 'CATEGORY',
    type: 'dropdown',
    options: [
      'Tools',
      'Consumables and Maintenance',
      'Peripherals and Storage',
      'PC Hardware and Components',
      'Diagnostic and Testing',
      'Cables and Connectors',
      'Networking Equipment',
      'Operating System and Software'
    ],
    required: true,
    order: 2
  },
  { id: 'quantity', label: 'QUANTITY', type: 'number', required: true, isSystem: true, order: 3 },
  {
    id: 'units',
    label: 'UNITS',
    type: 'dropdown',
    options: ['pcs', 'case', 'box', 'bag'],
    required: true,
    order: 4
  },
  {
    id: 'status',
    label: 'Status',
    type: 'dropdown',
    options: ['Working', 'Empty', 'Deffective', 'Used', 'Incomplete'],
    required: true,
    order: 5
  }
];

const DEFAULT_ROOMS: Room[] = [
  { id: 'room-ccs', name: 'Contact Center Services', description: 'Contact Center Services Training Lab' },
  { id: 'room-admin', name: 'Admin Office', description: 'KM100 Administration & Operations Office' },
  { id: 'room-css', name: 'Computer System Servicing', description: 'Computer Systems Servicing NC II Lab' },
  { id: 'room-bp', name: 'Bread & Pastry', description: 'Bread and Pastry Production Training Facility' }
];

const DEFAULT_ITEMS: InventoryItem[] = [
  {
    id: 'item-101',
    roomId: 'room-1',
    name: 'Dell OptiPlex 7090 Desktop PC',
    category: 'Computer Equipment',
    quantity: 24,
    condition: 'Good',
    remarks: 'Intel i7, 16GB RAM, dual boot Windows/Ubuntu',
    createdAt: '2026-10-15T08:30:00Z',
    updatedAt: '2026-11-10T14:20:00Z'
  },
  {
    id: 'item-102',
    roomId: 'room-1',
    name: 'Dell 24" IPS FHD Monitors',
    category: 'Computer Equipment',
    quantity: 24,
    condition: 'Good',
    remarks: 'Connected via DisplayPort; calibrated',
    createdAt: '2026-10-15T08:30:00Z',
    updatedAt: '2026-11-10T14:20:00Z'
  },
  {
    id: 'item-103',
    roomId: 'room-1',
    name: 'Cisco Catalyst 2960-X 48-Port Switch',
    category: 'Network Gear',
    quantity: 2,
    condition: 'Good',
    remarks: 'Mounted in Server Rack 1',
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z'
  },
  {
    id: 'item-104',
    roomId: 'room-1',
    name: 'Epson EB-2250U 3LCD Projector',
    category: 'Audio/Visual',
    quantity: 1,
    condition: 'Fair',
    remarks: 'Lamp hours at 2,450; filter cleaned',
    createdAt: '2026-10-20T11:15:00Z',
    updatedAt: '2026-11-05T09:00:00Z'
  },
  {
    id: 'item-105',
    roomId: 'room-1',
    name: 'Ergonomic Mesh Task Chairs',
    category: 'Furniture',
    quantity: 26,
    condition: 'Good',
    remarks: 'Lumbar support; 2 spares in back',
    createdAt: '2026-10-12T09:00:00Z',
    updatedAt: '2026-10-12T09:00:00Z'
  },
  {
    id: 'item-201',
    roomId: 'room-2',
    name: 'Interactive Smart Board 75" 4K',
    category: 'Audio/Visual',
    quantity: 1,
    condition: 'Good',
    remarks: 'Touch stylus and wall-mount operational',
    createdAt: '2026-10-14T13:00:00Z',
    updatedAt: '2026-11-01T16:30:00Z'
  },
  {
    id: 'item-202',
    roomId: 'room-2',
    name: 'Shure Wireless Lapel & Handheld Mic Kit',
    category: 'Audio/Visual',
    quantity: 2,
    condition: 'Needs Repair',
    remarks: 'Receiver channel B intermittent RF noise',
    createdAt: '2026-10-16T14:00:00Z',
    updatedAt: '2026-11-18T11:20:00Z'
  },
  {
    id: 'item-203',
    roomId: 'room-2',
    name: 'Trainee Tablet Armchairs (Steel Frame)',
    category: 'Furniture',
    quantity: 40,
    condition: 'Good',
    remarks: 'Foldable tablet arm with cup holder',
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-12T10:00:00Z'
  },
  {
    id: 'item-204',
    roomId: 'room-2',
    name: 'Institutional First Aid Emergency Kit',
    category: 'Supplies',
    quantity: 1,
    condition: 'Good',
    remarks: 'Red Cross certified; inspect expiry monthly',
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'item-301',
    roomId: 'room-3',
    name: 'HP LaserJet Enterprise MFP M528',
    category: 'Computer Equipment',
    quantity: 1,
    condition: 'Good',
    remarks: 'Network scanner/printer; toner at 75%',
    createdAt: '2026-10-08T09:30:00Z',
    updatedAt: '2026-11-12T10:15:00Z'
  },
  {
    id: 'item-401',
    roomId: 'room-4',
    name: 'Fluke 117 Electrician Multimeter',
    category: 'Tools & Hardware',
    quantity: 6,
    condition: 'Good',
    remarks: 'For electrical training module practicals',
    createdAt: '2026-10-22T15:00:00Z',
    updatedAt: '2026-10-22T15:00:00Z'
  },
  {
    id: 'item-402',
    roomId: 'room-4',
    name: 'Legacy CRT Monitor 17"',
    category: 'Computer Equipment',
    quantity: 3,
    condition: 'Condemned',
    remarks: 'Scheduled for environmental e-waste disposal',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-01T09:00:00Z'
  }
];

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

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
  }, [columns]);

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

  const handleQuantityChange = (itemId: string, delta: number) => {
    setItems(prev =>
      prev.map(it => {
        if (it.id === itemId) {
          const newQty = Math.max(0, (Number(it.quantity) || 0) + delta);
          return { ...it, quantity: newQty, updatedAt: new Date().toISOString() };
        }
        return it;
      })
    );
  };

  const handleSetQuantity = (itemId: string, newQty: number) => {
    const val = Math.max(0, newQty || 0);
    setItems(prev =>
      prev.map(it => {
        if (it.id === itemId) {
          return { ...it, quantity: val, updatedAt: new Date().toISOString() };
        }
        return it;
      })
    );
  };

  const confirmDeleteItem = (item: InventoryItem) => {
    setConfirmDialog({
      title: 'Delete Inventory Item',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      isDestructive: true,
      onConfirm: () => {
        setItems(prev => prev.filter(i => i.id !== item.id));
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
      onConfirm: () => {
        setRooms(prev => prev.filter(r => r.id !== room.id));
        setItems(prev => prev.filter(i => i.roomId !== room.id));
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
      onConfirm: () => {
        setRooms(DEFAULT_ROOMS);
        setItems(DEFAULT_ITEMS);
        setColumns(DEFAULT_COLUMNS);
        setSelectedRoomId('ALL');
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
      onConfirm: () => {
        setRooms([]);
        setItems([]);
        setSelectedRoomId('ALL');
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
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onOpenColumnsModal={() => setIsColumnsModalOpen(true)}
        onExportExcel={mode => exportInventoryToExcel(mode, rooms, items, columns, currentRoom)}
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
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all active:scale-[0.98]"
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
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400"
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
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Repair">Needs Repair</option>
                      <option value="Condemned">Condemned</option>
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
          onSave={savedItem => {
            if (editingItem) {
              setItems(prev => prev.map(i => (i.id === savedItem.id ? savedItem : i)));
              showToast(`Updated item "${savedItem.name}"`, 'success');
            } else {
              setItems(prev => [savedItem, ...prev]);
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
          onSave={newCols => {
            setColumns(newCols);
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
          onSave={savedRoom => {
            if (editingRoom) {
              setRooms(prev => prev.map(r => (r.id === savedRoom.id ? savedRoom : r)));
              showToast(`Renamed room to "${savedRoom.name}"`, 'success');
            } else {
              setRooms(prev => [...prev, savedRoom]);
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
                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
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
                    : 'bg-blue-600 hover:bg-blue-700'
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
              : 'bg-blue-600 text-white'
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
