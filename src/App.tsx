import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useDeferredValue,
  Suspense,
} from "react";
import {
  ColumnDefinition,
  ColumnType,
  InventoryItem,
  Room,
  ITEM_STATUSES,
  AppUser,
} from "./types/inventory";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { InventoryTable } from "./components/InventoryTable";
import { BulkActionBar } from "./components/BulkActionBar";
import { ColumnsVisibilityMenu } from "./components/ColumnsVisibilityMenu";
import { LoginScreen } from "./components/LoginScreen";
import { SplashScreen } from "./components/SplashScreen";
import {
  AppShellSkeleton,
  DashboardSkeleton,
  ModalSkeleton,
} from "./components/SkeletonLoader";
import { getStoredUser, logoutCurrentSession } from "./utils/auth";
import { supabase } from "./utils/supabaseClient";
import { inventoryService } from "./services/inventoryService";
const lazyNamed = (loader: () => Promise<any>, name: string) =>
  (React as any).lazy(() => loader().then((mod) => ({ default: mod[name] })));

const ItemModal = lazyNamed(
  () => import("./components/ItemModal"),
  "ItemModal",
);
const ColumnsSchemaModal = lazyNamed(
  () => import("./components/ColumnsSchemaModal"),
  "ColumnsSchemaModal",
);
const RoomModal = lazyNamed(
  () => import("./components/RoomModal"),
  "RoomModal",
);
const AssetTagModal = lazyNamed(
  () => import("./components/AssetTagModal"),
  "AssetTagModal",
);
const ImportPreviewModal = lazyNamed(
  () => import("./components/ImportPreviewModal"),
  "ImportPreviewModal",
);
import { PrintReport } from "./components/PrintReport";
import { UserProfileModal } from "./components/UserProfileModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { downloadInventoryCsv } from "./utils/csvExport";
import type { ImportAnalysis } from "./utils/importParse";
import {
  isNeedsAttention,
  isOutOfStockOrEmpty,
  normalizeStatus,
} from "./utils/status";
import { generateItemId, generateRoomId } from "./utils/ids";
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
  Building,
  Trash2,
  LogOut,
} from "lucide-react";

const STORAGE_KEY_ROOMS = "km100_inventory_rooms_v1";
const STORAGE_KEY_ITEMS = "km100_inventory_items_v1";
const STORAGE_KEY_COLUMNS = "km100_inventory_columns_v1";
const STORAGE_KEY_HIDDEN_COLS = "km100_hidden_columns_v1";
const STORAGE_KEY_TUTORIAL_COMPLETED = "km100_tutorial_completed_v1";

// Module-level deduplication for initial cloud data fetch (prevents duplicate requests in React StrictMode)
let initialCloudFetchPromise: Promise<[any, any, any]> | null = null;

export function App() {
  // ── State Initialization ──────────────────────────────────────────
  // defaultData.ts (43KB) is lazy-loaded below — only fetched when localStorage is empty
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [hiddenColumnIds, setHiddenColumnIds] = useState<string[]>([]);
  const [defaultsLoaded, setDefaultsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() =>
    getStoredUser(),
  );
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // ── Institutional Splash Screen Delay & Graceful Fade ──────────────────
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsSplashFading(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // ── Listen for Supabase Password Recovery Events & Direct Link Activation ──
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }
    });

    const hash = window.location.hash || "";
    const search = window.location.search || "";
    if (hash.includes("type=recovery") || search.includes("type=recovery")) {
      setIsPasswordRecovery(true);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ── Initial Data Load: Local Cache Fast-Render + Live Supabase Fetch ─
  useEffect(() => {
    if (defaultsLoaded) return;

    let isMounted = true;

    async function initializeInventory() {
      // 1. Instant optimistic load from local cache if available
      try {
        const rawRooms = localStorage.getItem(STORAGE_KEY_ROOMS);
        const rawItems = localStorage.getItem(STORAGE_KEY_ITEMS);
        const rawColumns = localStorage.getItem(STORAGE_KEY_COLUMNS);
        const rawHidden = localStorage.getItem(STORAGE_KEY_HIDDEN_COLS);

        if (rawRooms) setRooms(JSON.parse(rawRooms));
        if (rawItems) setItems(JSON.parse(rawItems));
        if (rawColumns) setColumns(JSON.parse(rawColumns));
        if (rawHidden) setHiddenColumnIds(JSON.parse(rawHidden));
      } catch {
        // ignore cache parse errors
      }

      // 2. Fetch official cloud data directly from Supabase (deduplicated across rapid mounts)
      try {
        if (!initialCloudFetchPromise) {
          initialCloudFetchPromise = Promise.all([
            inventoryService.fetchRooms(),
            inventoryService.fetchItems(),
            inventoryService.fetchColumns(),
          ]);
        }

        const [supaRooms, supaItems, supaColumns] =
          await initialCloudFetchPromise;

        if (isMounted) {
          if (supaRooms && supaRooms.length > 0) {
            setRooms(supaRooms);
          }
          if (supaItems && supaItems.length > 0) {
            setItems(supaItems);
          }
          if (supaColumns && supaColumns.length > 0) {
            setColumns(supaColumns);
          }
          setDefaultsLoaded(true);
        }
      } catch (err) {
        console.warn("Supabase initial load error, using cache/defaults:", err);
        if (isMounted) {
          // If both cache and Supabase failed, fallback to seed
          import("./data/defaultData").then(
            ({ DEFAULT_ROOMS, DEFAULT_ITEMS, DEFAULT_COLUMNS }) => {
              if (isMounted) {
                setRooms((prev) => (prev.length > 0 ? prev : DEFAULT_ROOMS));
                setItems((prev) => (prev.length > 0 ? prev : DEFAULT_ITEMS));
                setColumns((prev) =>
                  prev.length > 0 ? prev : DEFAULT_COLUMNS,
                );
                setDefaultsLoaded(true);
              }
            },
          );
        }
      }
    }

    initializeInventory();

    return () => {
      isMounted = false;
    };
  }, [defaultsLoaded]);

  // ── Filtering, Search & Sorting ──────────────────────────────────
  const [selectedRoomId, setSelectedRoomId] = useState<string>("ALL");
  const mainContentRef = useRef<HTMLElement>(null);

  // Smoothly reset scroll position to top on room/view switch
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedRoomId]);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [conditionFilter, setConditionFilter] = useState("ALL");
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState(false);
  const [outOfStockFilter, setOutOfStockFilter] = useState(false);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // ── Bulk Selection ─────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ── Modals & Overlays ───────────────────────────────────────────
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [assetTagItem, setAssetTagItem] = useState<InventoryItem | null>(null);
  const [importAnalysis, setImportAnalysis] = useState<ImportAnalysis | null>(
    null,
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("km100_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("km100_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    icon?: React.ReactNode;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Permanent Institutional Light Mode ──────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    try {
      localStorage.removeItem("km100_inventory_theme_v2");
      localStorage.removeItem("km100_inventory_theme_v1");
    } catch {
      // ignore storage access errors
    }
  }, []);

  // ── Persistence Effects (Only save after initial defaults are loaded) ─
  useEffect(() => {
    if (!defaultsLoaded) return;
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
  }, [rooms, defaultsLoaded]);

  useEffect(() => {
    if (!defaultsLoaded) return;
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items, defaultsLoaded]);

  useEffect(() => {
    if (!defaultsLoaded) return;
    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
  }, [columns, defaultsLoaded]);

  useEffect(() => {
    if (!defaultsLoaded) return;
    localStorage.setItem(
      STORAGE_KEY_HIDDEN_COLS,
      JSON.stringify(hiddenColumnIds),
    );
  }, [hiddenColumnIds, defaultsLoaded]);

  // ── Keyboard Shortcuts (Standard Pro Operator Shortcuts) ────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search: press '/' when not typing in form fields
      if (e.key === "/" && !e.isComposing) {
        const target = e.target as HTMLElement;
        const inInput =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT";
        if (!inInput) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }

      // Quick add item: Alt + N
      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setEditingItem(null);
        setIsItemModalOpen(true);
      }

      // Toggle sidebar: Ctrl + B or Cmd + B
      if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        toggleSidebar();
      }

      // Escape key clears selection or closes overlay
      if (e.key === "Escape" && !e.isComposing) {
        if (selectedIds.length > 0) {
          setSelectedIds([]);
        } else if (confirmDialog) {
          setConfirmDialog(null);
        } else if (isOnboardingOpen) {
          handleCloseOnboarding();
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
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedIds,
    confirmDialog,
    assetTagItem,
    importAnalysis,
    isItemModalOpen,
    isColumnsModalOpen,
    isRoomModalOpen,
    isMobileNavOpen,
    toggleSidebar,
  ]);

  // ── Toast Helper ────────────────────────────────────────────────
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ message, type });
      setTimeout(() => {
        setToast(null);
      }, 3500);
    },
    [],
  );

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

  const roomAttentionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rooms.forEach((room) => {
      counts[room.id] = 0;
    });
    items.forEach((item) => {
      if (counts[item.roomId] !== undefined && isNeedsAttention(item)) {
        counts[item.roomId] += 1;
      }
    });
    return counts;
  }, [rooms, items]);

  const availableCategories = useMemo(() => {
    const catCol = columns.find((c) => c.id === "category");
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
    if (selectedRoomId === "ALL") return items;
    return items.filter((it) => it.roomId === selectedRoomId);
  }, [items, selectedRoomId]);

  // Quick KPI metrics for current view
  const attentionCount = useMemo(() => {
    return roomScopedItems.filter((it) => isNeedsAttention(it)).length;
  }, [roomScopedItems]);

  const outOfStockCount = useMemo(() => {
    return roomScopedItems.filter((it) => isOutOfStockOrEmpty(it)).length;
  }, [roomScopedItems]);

  // Visible columns based on show/hide checklist
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => hiddenColumnIds.indexOf(col.id) === -1);
  }, [columns, hiddenColumnIds]);

  // Filtered and sorted dataset
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedRoomId !== "ALL" && item.roomId !== selectedRoomId)
          return false;
        if (categoryFilter !== "ALL" && item.category !== categoryFilter)
          return false;
        if (
          conditionFilter !== "ALL" &&
          item.condition !== conditionFilter &&
          item.status !== conditionFilter &&
          normalizeStatus(item.status ?? item.condition) !== conditionFilter
        ) {
          return false;
        }
        if (needsAttentionFilter && !isNeedsAttention(item)) return false;
        if (outOfStockFilter && !isOutOfStockOrEmpty(item)) return false;

        if (deferredSearchQuery.trim() !== "") {
          const q = deferredSearchQuery.toLowerCase();
          const matches = Object.entries(item).some(([k, val]) => {
            if (
              k === "id" ||
              k === "roomId" ||
              k === "createdAt" ||
              k === "updatedAt"
            )
              return false;
            return String(val).toLowerCase().includes(q);
          });
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (valA === undefined) valA = "";
        if (valB === undefined) valB = "";

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }
        const comp = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: "base",
        });
        return sortDirection === "asc" ? comp : -comp;
      });
  }, [
    items,
    selectedRoomId,
    categoryFilter,
    conditionFilter,
    needsAttentionFilter,
    outOfStockFilter,
    deferredSearchQuery,
    sortField,
    sortDirection,
  ]);

  const totalFilteredUnits = useMemo(
    () =>
      filteredItems.reduce(
        (acc, item) => acc + (Number(item.quantity) || 0),
        0,
      ),
    [filteredItems],
  );

  const isFiltered = useMemo(
    () =>
      Boolean(
        searchQuery ||
        categoryFilter !== "ALL" ||
        conditionFilter !== "ALL" ||
        needsAttentionFilter ||
        outOfStockFilter,
      ),
    [
      searchQuery,
      categoryFilter,
      conditionFilter,
      needsAttentionFilter,
      outOfStockFilter,
    ],
  );

  // ── Item Quantity Direct Manipulation ───────────────────────────
  const handleQuantityChange = useCallback(
    async (itemId: string, delta: number) => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === itemId) {
            const newQty = Math.max(0, (Number(it.quantity) || 0) + delta);
            inventoryService.updateQuantity(itemId, newQty);
            return {
              ...it,
              quantity: newQty,
              updatedAt: new Date().toISOString(),
            };
          }
          return it;
        }),
      );
    },
    [],
  );

  const handleSetQuantity = useCallback(
    async (itemId: string, newQty: number) => {
      const val = Math.max(0, newQty || 0);
      inventoryService.updateQuantity(itemId, val);
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === itemId) {
            return {
              ...it,
              quantity: val,
              updatedAt: new Date().toISOString(),
            };
          }
          return it;
        }),
      );
    },
    [],
  );

  // ── Bulk Selection Handlers ─────────────────────────────────────
  const handleToggleSelect = useCallback((itemId: string) => {
    setSelectedIds((prev) => {
      const idx = prev.indexOf(itemId);
      if (idx === -1) return [...prev, itemId];
      return prev.filter((id) => id !== itemId);
    });
  }, []);

  const handleToggleSelectPage = useCallback(
    (pageIds: string[], select: boolean) => {
      setSelectedIds((prev) => {
        const set = new Set(prev);
        if (select) {
          pageIds.forEach((id) => set.add(id));
        } else {
          pageIds.forEach((id) => set.delete(id));
        }
        return Array.from(set);
      });
    },
    [],
  );

  const handleBulkMove = (targetRoomId: string) => {
    const count = selectedIds.length;
    if (count === 0) return;
    const targetRoom = rooms.find((r) => r.id === targetRoomId);
    const roomName = targetRoom?.name || "room";
    const now = new Date().toISOString();

    inventoryService.bulkMoveRoom(selectedIds, targetRoomId);

    setItems((prev) =>
      prev.map((it) => {
        if (selectedIds.indexOf(it.id) !== -1) {
          return {
            ...it,
            roomId: targetRoomId,
            room: roomName,
            updatedAt: now,
          };
        }
        return it;
      }),
    );
    showToast(`Transferred ${count} items to "${roomName}"`, "success");
    setSelectedIds([]);
  };

  const handleBulkSetStatus = (newStatus: string) => {
    const count = selectedIds.length;
    if (count === 0) return;
    const now = new Date().toISOString();

    inventoryService.bulkUpdateStatus(selectedIds, newStatus);

    setItems((prev) =>
      prev.map((it) => {
        if (selectedIds.indexOf(it.id) !== -1) {
          return {
            ...it,
            status: newStatus,
            condition: newStatus,
            updatedAt: now,
          };
        }
        return it;
      }),
    );
    showToast(`Updated status to "${newStatus}" for ${count} items`, "success");
    setSelectedIds([]);
  };

  // ── Excel export: styled ExcelJS writer with SheetJS fallback ──────────
  const exportToExcel = async (
    mode: "multi" | "current",
    exportItems: InventoryItem[],
    selectedRoom?: Room,
  ) => {
    const { exportInventoryToStyledExcel } =
      await import("./utils/excelStyledExport");
    const styledOk = await exportInventoryToStyledExcel({
      mode,
      rooms,
      items,
      currentItems: exportItems,
      columns,
      selectedRoom,
    });
    if (!styledOk) {
      // Fallback to the plain SheetJS writer when ExcelJS is unavailable.
      const { exportInventoryToExcel } = await import("./utils/excelExport");
      exportInventoryToExcel(mode, rooms, exportItems, columns, selectedRoom);
    }
  };

  const handleBulkExportExcel = async () => {
    const selected = items.filter((it) => selectedIds.indexOf(it.id) !== -1);
    if (selected.length === 0) return;
    await exportToExcel("current", selected, currentRoom);
    showToast(`Exported ${selected.length} items to Excel`, "success");
  };

  const handleExportExcel = async (mode: "multi" | "current") => {
    await exportToExcel(mode, items, currentRoom);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    if (count === 0) return;
    setConfirmDialog({
      title: `Delete ${count} Selected Items`,
      message: `Are you sure you want to delete ${count} inventory ${
        count === 1 ? "item" : "items"
      }? This action removes them from the catalog.`,
      isDestructive: true,
      onConfirm: () => {
        selectedIds.forEach((id) => inventoryService.deleteItem(id));
        setItems((prev) =>
          prev.filter((it) => selectedIds.indexOf(it.id) === -1),
        );
        showToast(`Deleted ${count} items`, "success");
        setSelectedIds([]);
        setConfirmDialog(null);
      },
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
  const confirmDeleteItem = useCallback(
    (item: InventoryItem) => {
      setConfirmDialog({
        title: "Delete Inventory Item",
        message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
        isDestructive: true,
        onConfirm: () => {
          inventoryService.deleteItem(item.id);
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          showToast(`Deleted "${item.name}"`, "success");
          setConfirmDialog(null);
        },
      });
    },
    [showToast],
  );

  const confirmDeleteRoom = useCallback(
    (room: Room) => {
      const count = items.filter((i) => i.roomId === room.id).length;
      setConfirmDialog({
        title: `Delete room: ${room.name}`,
        message: `Deleting this room will also remove its ${count} associated inventory ${
          count === 1 ? "item" : "items"
        }. This action cannot be undone. Proceed?`,
        isDestructive: true,
        onConfirm: () => {
          inventoryService.deleteRoom(room.id);
          setRooms((prev) => prev.filter((r) => r.id !== room.id));
          setItems((prev) => prev.filter((i) => i.roomId !== room.id));
          if (selectedRoomId === room.id) setSelectedRoomId("ALL");
          showToast(`Room "${room.name}" deleted`, "success");
          setConfirmDialog(null);
        },
      });
    },
    [items, selectedRoomId, showToast],
  );

  // ── High-Craft Spreadsheet Import with Preview Modal ───────────
  const handleTriggerUploadExcel = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = async (ev: Event) => {
      const target = ev.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      try {
        const { analyzeSpreadsheet } = await import("./utils/importParse");
        const analysis = await analyzeSpreadsheet(file);
        if (analysis.totalItems === 0) {
          showToast("No valid inventory items found in the file.", "error");
          return;
        }
        setImportAnalysis(analysis);
      } catch (err) {
        showToast(
          "Failed to analyze spreadsheet: " +
            (err instanceof Error ? err.message : String(err)),
          "error",
        );
      }
    };
    input.click();
  };

  const handleImportDirect = () => {
    if (!importAnalysis) return;
    const existingRoomNames = new Map(
      rooms.map((r) => [r.name.trim().toLowerCase(), r.id]),
    );
    const newRooms: Room[] = [...rooms];

    importAnalysis.roomsList.forEach((roomName) => {
      const key = roomName.trim().toLowerCase();
      if (!existingRoomNames.has(key)) {
        const id = generateRoomId();
        existingRoomNames.set(key, id);
        newRooms.push({ id, name: roomName });
      }
    });

    const fallbackRoomId = rooms[0]?.id || "room-ccs";
    const mappedItems: InventoryItem[] = importAnalysis.items.map((it) => ({
      ...it,
      roomId:
        existingRoomNames.get(it.room?.trim().toLowerCase()) || fallbackRoomId,
    }));

    newRooms.forEach((r) => inventoryService.upsertRoom(r));
    mappedItems.forEach((it) => inventoryService.upsertItem(it));
    setRooms(newRooms);
    setItems((prev) => [...mappedItems, ...prev]);
    showToast(
      `Successfully imported ${mappedItems.length} items across ${importAnalysis.roomsList.length} rooms`,
      "success",
    );
    setImportAnalysis(null);
  };

  const handleImportCurrentRoom = () => {
    if (!importAnalysis) return;
    const targetRoomId =
      selectedRoomId !== "ALL" ? selectedRoomId : rooms[0]?.id || "room-ccs";
    const targetRoomName =
      rooms.find((r) => r.id === targetRoomId)?.name || "Current Room";

    const mappedItems: InventoryItem[] = importAnalysis.items.map((it) => ({
      ...it,
      roomId: targetRoomId,
      room: targetRoomName,
    }));

    mappedItems.forEach((it) => inventoryService.upsertItem(it));
    setItems((prev) => [...mappedItems, ...prev]);
    showToast(
      `Added ${mappedItems.length} items to "${targetRoomName}"`,
      "success",
    );
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

    const fallbackRoomId = newRooms[0]?.id || "room-ccs";
    const mappedItems: InventoryItem[] = importAnalysis.items.map((it) => ({
      ...it,
      roomId:
        existingRoomNames.get(it.room?.trim().toLowerCase()) || fallbackRoomId,
    }));

    newRooms.forEach((r) => inventoryService.upsertRoom(r));
    mappedItems.forEach((it) => inventoryService.upsertItem(it));
    setRooms(newRooms);
    setItems(mappedItems);
    setSelectedRoomId("ALL");
    showToast(
      `Replaced entire catalog with ${mappedItems.length} items from spreadsheet`,
      "success",
    );
    setImportAnalysis(null);
  };

  const handleSort = useCallback(
    (columnId: string) => {
      if (sortField === columnId) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(columnId);
        setSortDirection("asc");
      }
    },
    [sortField],
  );

  const handleEditItem = useCallback((item: InventoryItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  }, []);

  const handlePrintAssetTag = useCallback((item: InventoryItem) => {
    setAssetTagItem(item);
  }, []);

  const handleAddItem = useCallback(
    (preselectedRoomId?: string) => {
      if (rooms.length === 0) {
        showToast("Create a room before adding items.", "error");
        return;
      }
      if (preselectedRoomId && preselectedRoomId !== "ALL") {
        setSelectedRoomId(preselectedRoomId);
      }
      setEditingItem(null);
      setIsItemModalOpen(true);
    },
    [rooms.length, showToast],
  );

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setConditionFilter("ALL");
    setNeedsAttentionFilter(false);
    setOutOfStockFilter(false);
  }, []);

  const handleAddRoom = useCallback(() => {
    setEditingRoom(null);
    setIsRoomModalOpen(true);
  }, []);

  const handleEditRoom = useCallback((room: Room) => {
    setEditingRoom(room);
    setIsRoomModalOpen(true);
  }, []);

  const handleSignOut = async () => {
    await logoutCurrentSession();
    setCurrentUser(null);
    showToast("Signed out of KM100 System", "info");
  };

  const handleRequestSignOut = () => {
    setConfirmDialog({
      title: "Sign Out of Workspace",
      message:
        "Are you sure you want to sign out? You will need to sign back in with your employee credentials or authorized passkey to access the property register.",
      confirmLabel: "Sign Out",
      icon: <LogOut size={22} />,
      isDestructive: false,
      onConfirm: async () => {
        setConfirmDialog(null);
        await handleSignOut();
      },
    });
  };

  // ── First-Time User Interactive Guided Tutorial ───────────────────
  useEffect(() => {
    if (currentUser && !isSplashVisible) {
      try {
        const hasCompleted = localStorage.getItem(
          STORAGE_KEY_TUTORIAL_COMPLETED,
        );
        if (!hasCompleted) {
          const timer = setTimeout(() => {
            setIsOnboardingOpen(true);
          }, 450);
          return () => clearTimeout(timer);
        }
      } catch {
        // LocalStorage access issues
      }
    }
  }, [currentUser, isSplashVisible]);

  const handleCloseOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY_TUTORIAL_COMPLETED, "true");
    } catch {
      // LocalStorage access issues
    }
  }, []);

  // ── Authentication Guard (Institutional Login & Password Recovery) ─────────
  if (!currentUser || isPasswordRecovery) {
    return (
      <>
        <LoginScreen
          initialMode={isPasswordRecovery ? "reset" : undefined}
          onLoginSuccess={(user) => {
            setIsPasswordRecovery(false);
            const cleanUser = {
              ...user,
              fullName: (user.fullName || user.email)
                .replace(/\s*\([^)]*\)/g, "")
                .trim(),
            };
            setCurrentUser(cleanUser);
            showToast(`Welcome, ${cleanUser.fullName}!`, "success");
          }}
        />
        {isSplashVisible && <SplashScreen isFading={isSplashFading} />}
      </>
    );
  }

  // ── Institutional Skeleton Loader (Enterprise Fast-Boot Mirror) ─────────
  if (!defaultsLoaded) {
    return (
      <>
        <AppShellSkeleton />
        {isSplashVisible && <SplashScreen isFading={isSplashFading} />}
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* ── Global Institutional Header ─────────────────────────────── */}
      <Header
        onOpenColumnsModal={() => {
          if (currentUser?.role !== "admin") {
            showToast(
              "Action restricted: Only Admins can modify inventory schema.",
              "error",
            );
            return;
          }
          setIsColumnsModalOpen(true);
        }}
        onExportExcel={handleExportExcel}
        onExportCsv={() => downloadInventoryCsv(items, rooms, columns)}
        onTriggerUploadExcel={handleTriggerUploadExcel}
        onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        selectedRoomId={selectedRoomId}
        currentRoom={currentRoom}
        currentUser={currentUser}
        onSignOut={handleRequestSignOut}
        onOpenTutorial={() => setIsOnboardingOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Desktop Facilities Sidebar ───────────────────────────── */}
        {!isSidebarCollapsed && (
          <Sidebar
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoom}
            onDeleteRoom={confirmDeleteRoom}
            totalItemsCount={items.length}
            roomItemCounts={roomItemCounts}
            roomAttentionCounts={roomAttentionCounts}
            userRole={currentUser?.role}
          />
        )}

        {/* ── Main Content Area ────────────────────────────────────── */}
        <main
          ref={mainContentRef}
          className="flex-1 flex flex-col min-w-0 overflow-y-auto scroll-smooth [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-200 dark:[&::-webkit-scrollbar-track]:bg-slate-800 [&::-webkit-scrollbar-thumb]:bg-amber-500 dark:[&::-webkit-scrollbar-thumb]:bg-amber-400 [&::-webkit-scrollbar-thumb:hover]:bg-amber-600 dark:[&::-webkit-scrollbar-thumb:hover]:bg-amber-300"
        >
          <div
            key={selectedRoomId}
            className="animate-view-transition flex flex-col flex-1 min-h-full"
          >
            {/* Overview Dashboard (When "All Rooms" is selected) */}
            {selectedRoomId === "ALL" && (
              <OverviewDashboard
                rooms={rooms}
                items={items}
                roomItemCounts={roomItemCounts}
                onSelectRoom={setSelectedRoomId}
                onAddItem={handleAddItem}
              />
            )}

            {/* Individual Room Header */}
            {selectedRoomId !== "ALL" && currentRoom && (
              <div className="p-3 sm:p-4 lg:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRoomId("ALL")}
                        className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Rooms
                      </button>
                      <span className="text-slate-400 text-xs">/</span>
                      <h2 className="text-lg sm:text-xl font-heading font-bold tracking-tight text-slate-900 dark:text-white">
                        {currentRoom.name}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {currentRoom.description || "Room inventory"} &bull;{" "}
                      {roomItemCounts[currentRoom.id]?.unique || 0} items,{" "}
                      {(
                        roomItemCounts[currentRoom.id]?.totalQty || 0
                      ).toLocaleString()}{" "}
                      units
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingRoom(currentRoom);
                        setIsRoomModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Rename room"
                      aria-label="Rename room"
                    >
                      <Edit size={14} />
                      <span className="hidden sm:inline">Rename</span>
                    </button>

                    <button
                      onClick={() => confirmDeleteRoom(currentRoom)}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete room"
                      aria-label="Delete room"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setIsItemModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm shadow-amber-600/20 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Plus size={16} /> Add item
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Table & Interactive Control Area ───────────────────── */}
            <div className="flex-1 p-2.5 sm:p-4 lg:p-6 flex flex-col min-h-0">
              <div className="w-full flex-1 flex flex-col">
                {/* Quick Status KPI Strip */}
                <div className="mb-3 grid grid-cols-2 gap-2 sm:gap-2.5 rounded-xl border border-slate-200 bg-white p-2 sm:p-2.5 no-print animate-enter sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
                  <button
                    onClick={() => {
                      setNeedsAttentionFilter(false);
                      setOutOfStockFilter(false);
                      setConditionFilter("ALL");
                    }}
                    aria-pressed={
                      !needsAttentionFilter &&
                      !outOfStockFilter &&
                      conditionFilter === "ALL"
                    }
                    className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200 ${
                      !needsAttentionFilter &&
                      !outOfStockFilter &&
                      conditionFilter === "ALL"
                        ? "bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                      <Package size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Items
                      </span>
                      <span className="mt-0.5 flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-bold leading-none tabular-nums text-slate-900 dark:text-white">
                          {roomScopedItems.length}
                        </span>
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setNeedsAttentionFilter(false);
                      setOutOfStockFilter(false);
                      setConditionFilter("ALL");
                    }}
                    className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Layers size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Units in stock
                      </span>
                      <span className="mt-0.5 flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-bold leading-none tabular-nums text-emerald-600 dark:text-emerald-400">
                          {roomScopedItems
                            .reduce(
                              (acc, it) => acc + (Number(it.quantity) || 0),
                              0,
                            )
                            .toLocaleString()}
                        </span>
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setOutOfStockFilter(false);
                      setConditionFilter("ALL");
                      setNeedsAttentionFilter((prev) => !prev);
                    }}
                    aria-pressed={needsAttentionFilter}
                    className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200 cursor-pointer ${
                      needsAttentionFilter
                        ? "bg-rose-50 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:ring-rose-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                      <AlertTriangle size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Need attention
                      </span>
                      <span className="mt-0.5 flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-bold leading-none tabular-nums text-rose-600 dark:text-rose-400">
                          {attentionCount}
                        </span>
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setNeedsAttentionFilter(false);
                      setConditionFilter("ALL");
                      setOutOfStockFilter((prev) => !prev);
                    }}
                    aria-pressed={outOfStockFilter}
                    className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200 cursor-pointer ${
                      outOfStockFilter
                        ? "bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                      <PackageX size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Out of stock
                      </span>
                      <span className="mt-0.5 flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-bold leading-none tabular-nums text-amber-700 dark:text-amber-400">
                          {outOfStockCount}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>

                {/* ── Toolbar: Search, Filters, Column Toggle ────────────── */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print animate-enter relative z-20">
                  {/* Search box with keyboard shortcut indicator */}
                  <div className="relative flex-1 min-w-[220px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search size={16} />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search items, category, or serial no."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdowns & Column Visibility: Adaptive Grid on Mobile, Inline on Desktop */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row md:items-center gap-2">
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full md:w-auto md:flex md:items-center">
                      {/* Category Filter */}
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 sm:px-3 py-2 min-w-0">
                        <Filter size={14} className="text-slate-400 shrink-0" />
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer truncate"
                          title="Filter by Category"
                          aria-label="Filter by Category"
                        >
                          <option value="ALL">Category: All</option>
                          {availableCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Condition / Status Filter */}
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 sm:px-3 py-2 min-w-0">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                          Status:
                        </span>
                        <select
                          value={conditionFilter}
                          onChange={(e) => setConditionFilter(e.target.value)}
                          className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer truncate"
                          title="Filter by Status"
                          aria-label="Filter by Status"
                        >
                          <option value="ALL">All</option>
                          {ITEM_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Column Visibility Menu */}
                      <div className="min-w-0 w-full md:w-auto">
                        <ColumnsVisibilityMenu
                          columns={columns}
                          hiddenColumnIds={hiddenColumnIds}
                          onToggleColumn={handleToggleColumn}
                          onOpenSchemaBuilder={() =>
                            setIsColumnsModalOpen(true)
                          }
                        />
                      </div>
                    </div>

                    {/* Reset Filters Button */}
                    {(searchQuery ||
                      categoryFilter !== "ALL" ||
                      conditionFilter !== "ALL" ||
                      needsAttentionFilter ||
                      outOfStockFilter) && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCategoryFilter("ALL");
                          setConditionFilter("ALL");
                          setNeedsAttentionFilter(false);
                          setOutOfStockFilter(false);
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-semibold border border-rose-200 dark:border-rose-900/50"
                        title="Clear active filters"
                      >
                        <X size={13} />
                        <span>Reset Filters</span>
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
                  items={filteredItems}
                  columns={visibleColumns}
                  rooms={rooms}
                  selectedRoomId={selectedRoomId}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onSelectRoom={setSelectedRoomId}
                  onQuantityChange={handleQuantityChange}
                  onSetQuantity={handleSetQuantity}
                  onEditItem={handleEditItem}
                  onDeleteItem={confirmDeleteItem}
                  onAddItem={handleAddItem}
                  onResetFilters={handleResetFilters}
                  isFiltered={isFiltered}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectPage}
                />
              </div>
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
          roomAttentionCounts={roomAttentionCounts}
          onSelectRoom={(id) => {
            setSelectedRoomId(id);
            setIsMobileNavOpen(false);
          }}
          onAddRoom={() => {
            setIsMobileNavOpen(false);
            setEditingRoom(null);
            setIsRoomModalOpen(true);
          }}
          onEditRoom={(room) => {
            setEditingRoom(room);
            setIsRoomModalOpen(true);
          }}
          onDeleteRoom={(room) => {
            confirmDeleteRoom(room);
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
              inventoryService.upsertItem(savedItem);
              if (editingItem) {
                setItems((prev) =>
                  prev.map((i) => (i.id === savedItem.id ? savedItem : i)),
                );
                showToast(`Updated item "${savedItem.name}"`, "success");
              } else {
                setItems((prev) => [savedItem, ...prev]);
                showToast(`Added item "${savedItem.name}"`, "success");
              }
              setIsItemModalOpen(false);
            }}
          />
        </Suspense>
      )}

      {/* ── Schema Builder Modal ────────────────────────────────────── */}
      {isColumnsModalOpen && (
        <Suspense fallback={<ModalSkeleton size="lg" />}>
          <ColumnsSchemaModal
            isOpen={isColumnsModalOpen}
            onClose={() => setIsColumnsModalOpen(false)}
            columns={columns}
            onSave={async (newCols) => {
              inventoryService.saveColumns(newCols);
              setColumns(newCols);
              showToast(
                "Inventory column schema updated successfully!",
                "success",
              );
              setIsColumnsModalOpen(false);
            }}
          />
        </Suspense>
      )}

      {/* ── Room Add / Rename Modal ─────────────────────────────────── */}
      {isRoomModalOpen && (
        <Suspense fallback={<ModalSkeleton size="sm" />}>
          <RoomModal
            key={editingRoom ? editingRoom.id : "new-room"}
            isOpen={isRoomModalOpen}
            onClose={() => setIsRoomModalOpen(false)}
            editingRoom={editingRoom}
            onDelete={(room) => confirmDeleteRoom(room)}
            onSave={async (savedRoom) => {
              inventoryService.upsertRoom(savedRoom);
              if (editingRoom) {
                setRooms((prev) =>
                  prev.map((r) => (r.id === savedRoom.id ? savedRoom : r)),
                );
                showToast(`Renamed room to "${savedRoom.name}"`, "success");
              } else {
                setRooms((prev) => [...prev, savedRoom]);
                setSelectedRoomId(savedRoom.id);
                showToast(`Created room "${savedRoom.name}"`, "success");
              }
              setIsRoomModalOpen(false);
            }}
          />
        </Suspense>
      )}

      {/* ── Equipment Asset Tag Printable Sticker Modal ─────────────── */}
      {assetTagItem && (
        <Suspense fallback={<ModalSkeleton size="sm" />}>
          <AssetTagModal
            item={assetTagItem}
            rooms={rooms}
            onClose={() => setAssetTagItem(null)}
          />
        </Suspense>
      )}

      {/* ── Spreadsheet Upload Preview & Strategy Modal ─────────────── */}
      {importAnalysis && (
        <Suspense fallback={<ModalSkeleton size="lg" />}>
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
      <PrintReport
        items={filteredItems}
        rooms={rooms}
        facilityName={currentRoom ? currentRoom.name : "All Facilities"}
      />

      {/* ── Action Confirmation Dialog ──────────────────────────────── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  confirmDialog.isDestructive
                    ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                }`}
              >
                {confirmDialog.icon || <AlertTriangle size={22} />}
              </div>
              <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">
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
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-amber-700 hover:bg-amber-800"
                }`}
              >
                {confirmDialog.confirmLabel || "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── User Profile & Account Settings Modal ─────────────────── */}
      {isProfileModalOpen && currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          currentUser={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onUserUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
            showToast("Account settings updated successfully!", "success");
          }}
          onPasswordChanged={async () => {
            const userEmail = currentUser.email;
            setIsProfileModalOpen(false);
            try {
              sessionStorage.setItem(
                "km100_auth_success_notice",
                "Password updated successfully! Please sign in with your new password to verify.",
              );
              if (userEmail) {
                sessionStorage.setItem("km100_auth_prefill_email", userEmail);
              }
            } catch {
              // ignore
            }
            await logoutCurrentSession();
            setCurrentUser(null);
            showToast(
              "Password updated. Please sign in with your new password.",
              "success",
            );
          }}
        />
      )}

      {/* ── First-Time Onboarding & System Guide Modal ───────────────── */}
      {isOnboardingOpen && currentUser && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={handleCloseOnboarding}
          userRole={currentUser.role}
        />
      )}

      {/* ── Toast Notifications ─────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-toast ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : toast.type === "error"
                ? "bg-rose-600 text-white"
                : "bg-amber-700 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <Check size={18} />
          ) : (
            <Sparkles size={18} />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
      {/* ── Institutional Splash Screen Delay Overlay ──────────────── */}
      {isSplashVisible && <SplashScreen isFading={isSplashFading} />}
    </div>
  );
}

export default App;
