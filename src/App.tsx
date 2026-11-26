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
  InventoryItem,
  Room,
  ITEM_STATUSES,
  AppUser,
  Facility,
  DEFAULT_FACILITIES,
  DEFAULT_FACILITY_ID,
  getFacility,
  normalizeFacilityId,
} from "./types/inventory";
import {
  DEFAULT_ROOMS,
  DEFAULT_ITEMS,
  DEFAULT_COLUMNS,
} from "./data/defaultData";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { InventoryTable } from "./components/InventoryTable";
import { BulkActionBar } from "./components/BulkActionBar";
import { ColumnsVisibilityMenu } from "./components/ColumnsVisibilityMenu";
import { LoginScreen } from "./components/LoginScreen";
import { SplashScreen } from "./components/SplashScreen";
import { ModalSkeleton } from "./components/SkeletonLoader";
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
const FacilityModal = lazyNamed(
  () => import("./components/FacilityModal"),
  "FacilityModal",
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
import { generateRoomId } from "./utils/ids";
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
  Package,
  Layers,
  Trash2,
  LogOut,
} from "lucide-react";

const STORAGE_KEY_ROOMS = "km100_inventory_rooms_v1";
const STORAGE_KEY_ITEMS = "km100_inventory_items_v1";
const STORAGE_KEY_COLUMNS = "km100_inventory_columns_v1";
const STORAGE_KEY_HIDDEN_COLS = "km100_hidden_columns_v1";
const STORAGE_KEY_FACILITIES = "km100_facilities_v1";
const STORAGE_KEY_TUTORIAL_COMPLETED = "km100_tutorial_completed_v1";

export function App() {
  // ── State Initialization ──────────────────────────────────────────
  // defaultData.ts (43KB) is lazy-loaded below — only fetched when localStorage is empty
  const [facilities, setFacilities] = useState<Facility[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FACILITIES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_FACILITIES;
  });
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ROOMS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_ROOMS;
  });
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_ITEMS;
  });
  const [columns, setColumns] = useState<ColumnDefinition[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_COLUMNS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_COLUMNS;
  });
  const [hiddenColumnIds, setHiddenColumnIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HIDDEN_COLS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() =>
    getStoredUser(),
  );
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const localMutationVersionRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);
  const itemsRef = useRef<InventoryItem[]>(items);
  itemsRef.current = items;

  // ── Institutional Splash Screen Delay & Graceful Fade ──────────────────
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsSplashFading(true);
    }, 800);

    const removeTimer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 1200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // ── Listen for Supabase Password Recovery & Auth Events ───────────────
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      } else if (event === "SIGNED_OUT") {
        setIsPasswordRecovery(false);
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

  // ── Background Data Reconciliation & Real-Time Multi-Device Sync ──
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;
    const mutationVersionAtStart = localMutationVersionRef.current;

    async function syncCloudData() {
      try {
        const [roomsRes, itemsRes, colsRes, facRes] = await Promise.all([
          inventoryService.fetchRoomsWithStatus(),
          inventoryService.fetchItemsWithStatus(),
          inventoryService.fetchColumnsWithStatus(),
          inventoryService.fetchFacilitiesWithStatus(),
        ]);

        // Guard against clobbering optimistic local edits made while the fetch was in flight
        if (
          !isMounted ||
          localMutationVersionRef.current !== mutationVersionAtStart
        ) {
          return;
        }

        if (facRes.ok && facRes.data.length > 0) {
          setFacilities(facRes.data);
        }
        if (roomsRes.ok && roomsRes.data.length > 0) {
          setRooms(roomsRes.data);
        }
        if (itemsRes.ok && itemsRes.data.length > 0) {
          setItems(itemsRes.data);
        }
        if (colsRes.ok && colsRes.data.length > 0) {
          setColumns(colsRes.data);
        }
      } catch (err) {
        console.warn("Supabase background synchronization notice:", err);
      }
    }

    syncCloudData();

    const unsubscribeRealtime = inventoryService.subscribeToRealtimeChanges({
      onItemUpsert: (incomingItem) => {
        if (!isMounted) return;
        setItems((prev) => {
          const exists = prev.some((it) => it.id === incomingItem.id);
          if (exists) {
            return prev.map((it) =>
              it.id === incomingItem.id ? incomingItem : it,
            );
          }
          return [incomingItem, ...prev];
        });
      },
      onItemDelete: (deletedId) => {
        if (!isMounted) return;
        setItems((prev) => prev.filter((it) => it.id !== deletedId));
        setSelectedIds((prev) => prev.filter((id) => id !== deletedId));
      },
      onRoomUpsert: (incomingRoom) => {
        if (!isMounted) return;
        setRooms((prev) => {
          const exists = prev.some((r) => r.id === incomingRoom.id);
          if (exists) {
            return prev.map((r) =>
              r.id === incomingRoom.id ? incomingRoom : r,
            );
          }
          return [...prev, incomingRoom];
        });
      },
      onRoomDelete: (deletedRoomId) => {
        if (!isMounted) return;
        setRooms((prev) => prev.filter((r) => r.id !== deletedRoomId));
        setSelectedRoomId((prev) => (prev === deletedRoomId ? "ALL" : prev));
      },
      onColumnsChanged: async () => {
        const res = await inventoryService.fetchColumnsWithStatus();
        if (isMounted && res.ok && res.data.length > 0) {
          setColumns(res.data);
        }
      },
      onFacilityUpsert: (incomingFac) => {
        if (!isMounted) return;
        setFacilities((prev) => {
          const exists = prev.some((f) => f.id === incomingFac.id);
          if (exists) {
            return prev.map((f) => (f.id === incomingFac.id ? incomingFac : f));
          }
          return [...prev, incomingFac];
        });
      },
      onFacilityDelete: (deletedFacId) => {
        if (!isMounted) return;
        setFacilities((prev) => prev.filter((f) => f.id !== deletedFacId));
        setSelectedFacilityId((prev) => (prev === deletedFacId ? "ALL" : prev));
      },
    });

    return () => {
      isMounted = false;
      unsubscribeRealtime();
    };
  }, [currentUser?.id]);

  // ── Filtering, Search & Sorting ──────────────────────────────────
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("ALL");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("ALL");
  const mainContentRef = useRef<HTMLElement>(null);

  const handleSelectFacility = useCallback(
    (facId: string) => {
      setSelectedFacilityId(facId);
      if (selectedRoomId !== "ALL") {
        const activeRoom = rooms.find((r) => r.id === selectedRoomId);
        if (
          facId !== "ALL" &&
          normalizeFacilityId(activeRoom?.facility, facilities) !== facId
        ) {
          setSelectedRoomId("ALL");
        }
      }
    },
    [rooms, selectedRoomId, facilities],
  );

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
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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

  // ── Persistence Effects (Safe against quota/private-mode errors) ─
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
    } catch {
      // ignore storage quota errors
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch {
      // ignore storage quota errors
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
    } catch {
      // ignore storage quota errors
    }
  }, [columns]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_HIDDEN_COLS,
        JSON.stringify(hiddenColumnIds),
      );
    } catch {
      // ignore storage quota errors
    }
  }, [hiddenColumnIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FACILITIES, JSON.stringify(facilities));
    } catch {
      // ignore storage quota errors
    }
  }, [facilities]);

  // ── Toast Helper ────────────────────────────────────────────────
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      setToast({ message, type });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, 3500);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

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

  // Facility-scoped rooms & items
  const facilityScopedRooms = useMemo(() => {
    if (selectedFacilityId === "ALL") return rooms;
    return rooms.filter(
      (r) => normalizeFacilityId(r.facility, facilities) === selectedFacilityId,
    );
  }, [rooms, selectedFacilityId, facilities]);

  const facilityRoomIdSet = useMemo(() => {
    return new Set(facilityScopedRooms.map((r) => r.id));
  }, [facilityScopedRooms]);

  const facilityScopedItems = useMemo(() => {
    if (selectedFacilityId === "ALL") return items;
    return items.filter(
      (it) =>
        (it.facility &&
          normalizeFacilityId(it.facility, facilities) ===
            selectedFacilityId) ||
        facilityRoomIdSet.has(it.roomId),
    );
  }, [items, selectedFacilityId, facilityRoomIdSet, facilities]);

  // Items in active room view (prior to text/status filters)
  const roomScopedItems = useMemo(() => {
    if (selectedRoomId === "ALL") return facilityScopedItems;
    return items.filter((it) => it.roomId === selectedRoomId);
  }, [facilityScopedItems, items, selectedRoomId]);

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
        if (selectedRoomId !== "ALL") {
          if (item.roomId !== selectedRoomId) return false;
        } else if (selectedFacilityId !== "ALL") {
          const matchesItemFacility =
            Boolean(item.facility) &&
            normalizeFacilityId(item.facility, facilities) ===
              selectedFacilityId;
          if (!facilityRoomIdSet.has(item.roomId) && !matchesItemFacility) {
            return false;
          }
        }
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
    selectedFacilityId,
    facilityRoomIdSet,
    facilities,
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
      const target = itemsRef.current.find((it) => it.id === itemId);
      if (!target) return;
      const newQty = Math.max(0, (Number(target.quantity) || 0) + delta);
      const now = new Date().toISOString();
      localMutationVersionRef.current += 1;

      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, quantity: newQty, updatedAt: now } : it,
        ),
      );

      const ok = await inventoryService.updateQuantity(itemId, newQty);
      if (!ok && currentUser) {
        showToast(
          "Saved locally, but cloud quantity sync failed. Check connection.",
          "error",
        );
      }
    },
    [currentUser, showToast],
  );

  const handleSetQuantity = useCallback(
    async (itemId: string, newQty: number) => {
      const val = Math.max(0, Number.isFinite(newQty) ? newQty : 0);
      const now = new Date().toISOString();
      localMutationVersionRef.current += 1;

      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, quantity: val, updatedAt: now } : it,
        ),
      );

      const ok = await inventoryService.updateQuantity(itemId, val);
      if (!ok && currentUser) {
        showToast(
          "Saved locally, but cloud quantity sync failed. Check connection.",
          "error",
        );
      }
    },
    [currentUser, showToast],
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

  const handleBulkMove = async (targetRoomId: string) => {
    const idsSnapshot = [...selectedIds];
    const count = idsSnapshot.length;
    if (count === 0) return;
    const idSet = new Set(idsSnapshot);
    const targetRoom = rooms.find((r) => r.id === targetRoomId);
    const roomName = targetRoom?.name || "room";
    const targetFacility = normalizeFacilityId(
      targetRoom?.facility,
      facilities,
    );
    const now = new Date().toISOString();
    localMutationVersionRef.current += 1;

    const updatedSubset: InventoryItem[] = [];
    setItems((prev) =>
      prev.map((it) => {
        if (idSet.has(it.id)) {
          const updated: InventoryItem = {
            ...it,
            roomId: targetRoomId,
            room: roomName,
            facility: targetFacility,
            updatedAt: now,
          };
          updatedSubset.push(updated);
          return updated;
        }
        return it;
      }),
    );
    setSelectedIds([]);

    const ok = await inventoryService.upsertItemsBatch(updatedSubset);
    if (ok) {
      showToast(`Transferred ${count} items to "${roomName}"`, "success");
    } else {
      showToast(
        `Transferred ${count} items locally, but cloud sync failed.`,
        "error",
      );
    }
  };

  const handleBulkSetStatus = async (newStatus: string) => {
    const idsSnapshot = [...selectedIds];
    const count = idsSnapshot.length;
    if (count === 0) return;
    const idSet = new Set(idsSnapshot);
    const canonicalStatus = normalizeStatus(newStatus);
    const now = new Date().toISOString();
    localMutationVersionRef.current += 1;

    setItems((prev) =>
      prev.map((it) => {
        if (idSet.has(it.id)) {
          return {
            ...it,
            status: canonicalStatus,
            condition: canonicalStatus,
            updatedAt: now,
          };
        }
        return it;
      }),
    );
    setSelectedIds([]);

    const ok = await inventoryService.bulkUpdateStatus(
      idsSnapshot,
      canonicalStatus,
    );
    if (ok) {
      showToast(
        `Updated status to "${canonicalStatus}" for ${count} items`,
        "success",
      );
    } else {
      showToast(`Updated status locally, but cloud sync failed.`, "error");
    }
  };

  // ── Excel export: styled ExcelJS writer with SheetJS fallback ──────────
  const exportToExcel = async (
    mode: "multi" | "current",
    exportItems: InventoryItem[],
    selectedRoom?: Room,
  ) => {
    try {
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
      return true;
    } catch (err) {
      console.error("Excel export failed:", err);
      showToast(
        `Excel export failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        "error",
      );
      return false;
    }
  };

  const handleBulkExportExcel = async () => {
    const selected = items.filter((it) => selectedIds.indexOf(it.id) !== -1);
    if (selected.length === 0) return;
    const ok = await exportToExcel("current", selected, currentRoom);
    if (ok) {
      showToast(`Exported ${selected.length} items to Excel`, "success");
    }
  };

  const handleExportExcel = async (mode: "multi" | "current") => {
    const scopeItems = mode === "current" ? filteredItems : items;
    await exportToExcel(mode, scopeItems, currentRoom);
  };

  const handleBulkDelete = () => {
    const idsSnapshot = [...selectedIds];
    const count = idsSnapshot.length;
    if (count === 0) return;
    const idSet = new Set(idsSnapshot);
    setConfirmDialog({
      title: `Delete ${count} Selected Items`,
      message: `Are you sure you want to delete ${count} inventory ${
        count === 1 ? "item" : "items"
      }? This action removes them from the catalog.`,
      isDestructive: true,
      onConfirm: async () => {
        localMutationVersionRef.current += 1;
        setItems((prev) => prev.filter((it) => !idSet.has(it.id)));
        setSelectedIds((prev) => prev.filter((id) => !idSet.has(id)));
        setConfirmDialog(null);

        const ok = await inventoryService.deleteItemsBatch(idsSnapshot);
        if (ok) {
          showToast(`Deleted ${count} items`, "success");
        } else {
          showToast(
            `Deleted ${count} items locally, but cloud deletion failed.`,
            "error",
          );
        }
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
        onConfirm: async () => {
          localMutationVersionRef.current += 1;
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          setSelectedIds((prev) => prev.filter((id) => id !== item.id));
          setConfirmDialog(null);
          const ok = await inventoryService.deleteItem(item.id);
          if (ok) {
            showToast(`Deleted "${item.name}"`, "success");
          } else {
            showToast(
              `Deleted "${item.name}" locally, but cloud deletion failed.`,
              "error",
            );
          }
        },
      });
    },
    [showToast],
  );

  const confirmDeleteRoom = useCallback(
    (room: Room) => {
      const associatedItems = items.filter((i) => i.roomId === room.id);
      const count = associatedItems.length;
      const associatedIdSet = new Set(associatedItems.map((i) => i.id));
      setConfirmDialog({
        title: `Delete room: ${room.name}`,
        message: `Deleting this room will also remove its ${count} associated inventory ${
          count === 1 ? "item" : "items"
        }. This action cannot be undone. Proceed?`,
        isDestructive: true,
        onConfirm: async () => {
          localMutationVersionRef.current += 1;
          setRooms((prev) => prev.filter((r) => r.id !== room.id));
          setItems((prev) => prev.filter((i) => i.roomId !== room.id));
          setSelectedIds((prev) =>
            prev.filter((id) => !associatedIdSet.has(id)),
          );
          if (selectedRoomId === room.id) setSelectedRoomId("ALL");
          setConfirmDialog(null);

          const [itemsOk, roomOk] = await Promise.all([
            inventoryService.deleteItemsBatch(Array.from(associatedIdSet)),
            inventoryService.deleteRoom(room.id),
          ]);
          if (itemsOk && roomOk) {
            showToast(`Room "${room.name}" deleted`, "success");
          } else {
            showToast(
              `Deleted "${room.name}" locally, but cloud sync failed.`,
              "error",
            );
          }
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

  const handleImportDirect = async () => {
    if (!importAnalysis) return;
    const activeFacility =
      selectedFacilityId !== "ALL" ? selectedFacilityId : DEFAULT_FACILITY_ID;
    const existingRoomNames = new Map(
      rooms.map((r) => [r.name.trim().toLowerCase(), r.id]),
    );
    const addedRooms: Room[] = [];
    const newRooms: Room[] = [...rooms];

    importAnalysis.roomsList.forEach((roomName) => {
      const key = roomName.trim().toLowerCase();
      if (!existingRoomNames.has(key)) {
        const id = generateRoomId();
        existingRoomNames.set(key, id);
        const createdRoom: Room = {
          id,
          name: roomName,
          facility: activeFacility,
        };
        addedRooms.push(createdRoom);
        newRooms.push(createdRoom);
      }
    });

    const fallbackRoom = facilityScopedRooms[0] || newRooms[0] || rooms[0];
    const fallbackRoomId = fallbackRoom?.id || "room-ccs";
    const roomById = new Map(newRooms.map((r) => [r.id, r]));

    const mappedItems: InventoryItem[] = importAnalysis.items.map((it) => {
      const resolvedRoomId =
        existingRoomNames.get(it.room?.trim().toLowerCase()) || fallbackRoomId;
      const resolvedRoom = roomById.get(resolvedRoomId);
      return {
        ...it,
        roomId: resolvedRoomId,
        room: resolvedRoom?.name || it.room || "",
        facility: normalizeFacilityId(
          resolvedRoom?.facility || activeFacility,
          facilities,
        ),
      };
    });

    localMutationVersionRef.current += 1;
    setRooms(newRooms);
    setItems((prev) => [...mappedItems, ...prev]);
    setImportAnalysis(null);

    const [roomsOk, itemsOk] = await Promise.all([
      inventoryService.upsertRoomsBatch(addedRooms),
      inventoryService.upsertItemsBatch(mappedItems),
    ]);
    if (roomsOk && itemsOk) {
      showToast(
        `Successfully imported ${mappedItems.length} items across ${importAnalysis.roomsList.length} rooms`,
        "success",
      );
    } else {
      showToast(
        `Imported ${mappedItems.length} items locally, but cloud sync failed.`,
        "error",
      );
    }
  };

  const handleImportCurrentRoom = async () => {
    if (!importAnalysis) return;
    const fallbackRoom = facilityScopedRooms[0] || rooms[0];
    const targetRoomId =
      selectedRoomId !== "ALL" ? selectedRoomId : fallbackRoom?.id;
    if (!targetRoomId) {
      showToast("Create a room before importing items.", "error");
      return;
    }
    const targetRoom = rooms.find((r) => r.id === targetRoomId);
    const targetRoomName = targetRoom?.name || "Current Room";
    const targetFacility = normalizeFacilityId(
      targetRoom?.facility,
      facilities,
    );

    const mappedItems: InventoryItem[] = importAnalysis.items.map((it) => ({
      ...it,
      roomId: targetRoomId,
      room: targetRoomName,
      facility: targetFacility,
    }));

    localMutationVersionRef.current += 1;
    setItems((prev) => [...mappedItems, ...prev]);
    setImportAnalysis(null);

    const ok = await inventoryService.upsertItemsBatch(mappedItems);
    if (ok) {
      showToast(
        `Added ${mappedItems.length} items to "${targetRoomName}"`,
        "success",
      );
    } else {
      showToast(
        `Added ${mappedItems.length} items locally, but cloud sync failed.`,
        "error",
      );
    }
  };

  const handleReplaceAll = () => {
    if (!importAnalysis) return;
    const snapshot = importAnalysis;
    setConfirmDialog({
      title: "Replace Entire Inventory Catalog",
      message: `This will permanently delete all ${rooms.length.toLocaleString()} existing rooms and ${items.length.toLocaleString()} items and replace them with ${snapshot.totalItems.toLocaleString()} imported items. This action cannot be undone.`,
      confirmLabel: "Replace Entire Database",
      isDestructive: true,
      onConfirm: async () => {
        const activeFacility =
          selectedFacilityId !== "ALL"
            ? selectedFacilityId
            : DEFAULT_FACILITY_ID;
        const existingRoomNames = new Map<string, string>();
        const newRooms: Room[] = [];

        snapshot.roomsList.forEach((roomName) => {
          const key = roomName.trim().toLowerCase();
          const id = generateRoomId();
          existingRoomNames.set(key, id);
          newRooms.push({ id, name: roomName, facility: activeFacility });
        });

        if (newRooms.length === 0) {
          const defaultId = generateRoomId();
          existingRoomNames.set("general storage", defaultId);
          newRooms.push({
            id: defaultId,
            name: "General Storage",
            facility: activeFacility,
          });
        }

        const fallbackRoomId = newRooms[0].id;
        const roomById = new Map(newRooms.map((r) => [r.id, r]));
        const mappedItems: InventoryItem[] = snapshot.items.map((it) => {
          const resolvedRoomId =
            existingRoomNames.get(it.room?.trim().toLowerCase()) ||
            fallbackRoomId;
          const resolvedRoom = roomById.get(resolvedRoomId);
          return {
            ...it,
            roomId: resolvedRoomId,
            room: resolvedRoom?.name || it.room || "",
            facility: normalizeFacilityId(
              resolvedRoom?.facility || activeFacility,
              facilities,
            ),
          };
        });

        const obsoleteRoomIds = rooms.map((r) => r.id);
        const obsoleteItemIds = items.map((it) => it.id);

        localMutationVersionRef.current += 1;
        setRooms(newRooms);
        setItems(mappedItems);
        setSelectedIds([]);
        setSelectedRoomId("ALL");
        setImportAnalysis(null);
        setConfirmDialog(null);

        const ok = await inventoryService.replaceAllInCloud(
          newRooms,
          mappedItems,
          obsoleteRoomIds,
          obsoleteItemIds,
        );
        if (ok) {
          showToast(
            `Replaced entire catalog with ${mappedItems.length} items from spreadsheet`,
            "success",
          );
        } else {
          showToast(
            `Replaced catalog locally, but cloud replacement failed.`,
            "error",
          );
        }
      },
    });
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

  const handleAddItem = useCallback(
    (preselectedRoomId?: string) => {
      if (facilityScopedRooms.length === 0) {
        showToast(
          "Create a room in this facility before adding items.",
          "error",
        );
        return;
      }
      if (preselectedRoomId && preselectedRoomId !== "ALL") {
        setSelectedRoomId(preselectedRoomId);
      } else if (
        selectedRoomId === "ALL" &&
        selectedFacilityId !== "ALL" &&
        facilityScopedRooms.length > 0
      ) {
        // Default ItemModal to a room within the currently selected facility
        setEditingItem({
          id: "",
          roomId: facilityScopedRooms[0].id,
          facility: selectedFacilityId,
          name: "",
          category: "General",
          quantity: 1,
          units: "pcs",
          status: "Working",
          condition: "Working",
          createdAt: "",
          updatedAt: "",
        });
        setIsItemModalOpen(true);
        return;
      }
      setEditingItem(null);
      setIsItemModalOpen(true);
    },
    [facilityScopedRooms, selectedRoomId, selectedFacilityId, showToast],
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

  const handleAddFacility = useCallback(() => {
    if (currentUser?.role !== "admin") {
      showToast("Action restricted: Only Admins can add facilities.", "error");
      return;
    }
    setEditingFacility(null);
    setIsFacilityModalOpen(true);
  }, [currentUser?.role, showToast]);

  const handleEditFacility = useCallback(
    (facility: Facility) => {
      if (currentUser?.role !== "admin") {
        showToast(
          "Action restricted: Only Admins can modify facilities.",
          "error",
        );
        return;
      }
      setEditingFacility(facility);
      setIsFacilityModalOpen(true);
    },
    [currentUser?.role, showToast],
  );

  const handleSaveFacility = useCallback(
    async (savedFacility: Facility) => {
      localMutationVersionRef.current += 1;
      setFacilities((prev) => {
        const index = prev.findIndex((f) => f.id === savedFacility.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = savedFacility;
          return next;
        }
        return [...prev, savedFacility];
      });
      setIsFacilityModalOpen(false);
      await inventoryService.upsertFacility(savedFacility);
      showToast(
        `Facility "${savedFacility.name}" saved successfully!`,
        "success",
      );
    },
    [showToast],
  );

  const confirmDeleteFacility = useCallback(
    (facility: Facility) => {
      if (facility.isSystem) {
        showToast("System default facilities cannot be deleted.", "error");
        return;
      }
      const assignedRooms = rooms.filter(
        (r) => normalizeFacilityId(r.facility, facilities) === facility.id,
      );
      const assignedItems = items.filter(
        (it) =>
          it.facility &&
          normalizeFacilityId(it.facility, facilities) === facility.id,
      );
      if (assignedRooms.length > 0 || assignedItems.length > 0) {
        showToast(
          `Cannot delete "${facility.name}": ${assignedRooms.length} room(s) and ${assignedItems.length} item(s) are assigned to it. Reassign or delete them first.`,
          "error",
        );
        return;
      }
      setConfirmDialog({
        title: `Delete Facility "${facility.name}"?`,
        message: `Are you sure you want to delete the facility "${facility.name}"? This action cannot be undone.`,
        isDestructive: true,
        confirmLabel: "Delete Facility",
        onConfirm: async () => {
          localMutationVersionRef.current += 1;
          setFacilities((prev) => prev.filter((f) => f.id !== facility.id));
          if (selectedFacilityId === facility.id) {
            setSelectedFacilityId("ALL");
          }
          setConfirmDialog(null);
          setIsFacilityModalOpen(false);
          await inventoryService.deleteFacility(facility.id);
          showToast(`Deleted facility "${facility.name}"`, "success");
        },
      });
    },
    [rooms, items, facilities, selectedFacilityId, showToast],
  );

  const handleSignOut = async () => {
    await logoutCurrentSession();
    setCurrentUser(null);
    setSelectedRoomId("ALL");
    setSelectedFacilityId("ALL");
    setSelectedIds([]);
    handleResetFilters();
    setIsItemModalOpen(false);
    setIsColumnsModalOpen(false);
    setIsRoomModalOpen(false);
    setIsFacilityModalOpen(false);
    setIsProfileModalOpen(false);
    setImportAnalysis(null);
    setIsMobileNavOpen(false);
    setIsOnboardingOpen(false);
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
  // Strictly triggers ONLY for newly registered accounts on their first sign-in
  useEffect(() => {
    if (currentUser && !isSplashVisible) {
      try {
        const isPendingNewUser =
          localStorage.getItem(`km100_first_time_user_${currentUser.id}`) ===
          "pending";
        const hasCompleted = localStorage.getItem(
          `km100_tour_completed_${currentUser.id}`,
        );

        if (isPendingNewUser && !hasCompleted) {
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
      if (currentUser) {
        localStorage.removeItem(`km100_first_time_user_${currentUser.id}`);
        localStorage.setItem(`km100_tour_completed_${currentUser.id}`, "true");
      }
      localStorage.setItem(STORAGE_KEY_TUTORIAL_COMPLETED, "true");
    } catch {
      // LocalStorage access issues
    }
  }, [currentUser]);

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
        handleAddItem();
      }

      // Toggle sidebar: Ctrl + B or Cmd + B
      if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        toggleSidebar();
      }

      // Escape key closes topmost overlay first, then clears row selection
      if (e.key === "Escape" && !e.isComposing && !e.defaultPrevented) {
        if (confirmDialog) {
          setConfirmDialog(null);
        } else if (isOnboardingOpen) {
          handleCloseOnboarding();
        } else if (isProfileModalOpen) {
          setIsProfileModalOpen(false);
        } else if (importAnalysis) {
          setImportAnalysis(null);
        } else if (isItemModalOpen) {
          setIsItemModalOpen(false);
        } else if (isColumnsModalOpen) {
          setIsColumnsModalOpen(false);
        } else if (isRoomModalOpen) {
          setIsRoomModalOpen(false);
        } else if (isFacilityModalOpen) {
          setIsFacilityModalOpen(false);
        } else if (isMobileNavOpen) {
          setIsMobileNavOpen(false);
        } else if (selectedIds.length > 0) {
          setSelectedIds([]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedIds,
    confirmDialog,
    isOnboardingOpen,
    handleCloseOnboarding,
    isProfileModalOpen,
    importAnalysis,
    isItemModalOpen,
    isColumnsModalOpen,
    isRoomModalOpen,
    isFacilityModalOpen,
    isMobileNavOpen,
    handleAddItem,
    toggleSidebar,
  ]);

  // ── Authentication Guard (Institutional Login & Password Recovery) ─────────
  if (!currentUser || isPasswordRecovery) {
    return (
      <>
        <LoginScreen
          initialMode={isPasswordRecovery ? "reset" : undefined}
          onClearRecovery={() => setIsPasswordRecovery(false)}
          onLoginSuccess={(user, isFirstTimeRegistration) => {
            setIsPasswordRecovery(false);
            const cleanUser = {
              ...user,
              fullName: (user.fullName || user.email)
                .replace(/\s*\([^)]*\)/g, "")
                .trim(),
            };
            if (isFirstTimeRegistration) {
              try {
                localStorage.setItem(
                  `km100_first_time_user_${cleanUser.id}`,
                  "pending",
                );
              } catch {}
            }
            setCurrentUser(cleanUser);
            showToast(`Welcome, ${cleanUser.fullName}!`, "success");
          }}
        />
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
        onExportCsv={() => downloadInventoryCsv(filteredItems, rooms, columns)}
        onTriggerUploadExcel={handleTriggerUploadExcel}
        onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        selectedRoomId={selectedRoomId}
        selectedFacilityId={selectedFacilityId}
        facilities={facilities}
        currentRoom={currentRoom}
        currentUser={currentUser}
        onSignOut={handleRequestSignOut}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Desktop Facilities Sidebar ───────────────────────────── */}
        {!isSidebarCollapsed && (
          <Sidebar
            rooms={rooms}
            facilities={facilities}
            selectedRoomId={selectedRoomId}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={handleSelectFacility}
            onAddFacility={handleAddFacility}
            onEditFacility={handleEditFacility}
            onDeleteFacility={confirmDeleteFacility}
            onSelectRoom={setSelectedRoomId}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoom}
            onDeleteRoom={confirmDeleteRoom}
            totalItemsCount={facilityScopedItems.length}
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
                rooms={facilityScopedRooms}
                items={facilityScopedItems}
                roomItemCounts={roomItemCounts}
                onSelectRoom={setSelectedRoomId}
                onAddItem={handleAddItem}
                selectedFacilityId={selectedFacilityId}
                facilities={facilities}
              />
            )}

            {/* Individual Room Header */}
            {selectedRoomId !== "ALL" && !currentRoom && (
              <div className="p-3 sm:p-4 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
                <p className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200">
                  The selected room is no longer available.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedRoomId("ALL")}
                  className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold cursor-pointer shrink-0"
                >
                  Back to All Rooms
                </button>
              </div>
            )}

            {selectedRoomId !== "ALL" && currentRoom && (
              <div className="p-3 sm:p-4 lg:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRoomId("ALL")}
                        className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        {getFacility(currentRoom.facility, facilities).name}
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

                  <div
                    id="tour-add-item"
                    className="flex items-center gap-1.5 sm:gap-2 shrink-0"
                  >
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
                <div
                  id="tour-kpis"
                  className="mb-3 grid grid-cols-2 gap-2 sm:gap-2.5 rounded-xl border border-slate-200 bg-white p-2 sm:p-2.5 no-print animate-enter sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900"
                >
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
                      <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                        Items
                      </span>
                      <span className="mt-0.5 flex items-baseline gap-1">
                        <span
                          className="text-base sm:text-lg font-bold leading-none tabular-nums text-slate-900 dark:text-white truncate"
                          title={`${roomScopedItems.length.toLocaleString()} items`}
                        >
                          {roomScopedItems.length.toLocaleString()}
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
                      <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                        Units in stock
                      </span>
                      <span className="mt-0.5 flex items-baseline gap-1">
                        <span
                          className="text-base sm:text-lg font-bold leading-none tabular-nums text-emerald-600 dark:text-emerald-400 truncate"
                          title={`${roomScopedItems
                            .reduce(
                              (acc, it) => acc + (Number(it.quantity) || 0),
                              0,
                            )
                            .toLocaleString()} units`}
                        >
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
                      <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                        Need attention
                      </span>
                      <span className="mt-0.5 flex items-baseline gap-1">
                        <span
                          className="text-base sm:text-lg font-bold leading-none tabular-nums text-rose-600 dark:text-rose-400 truncate"
                          title={`${attentionCount.toLocaleString()} items needing attention`}
                        >
                          {attentionCount.toLocaleString()}
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
                      <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                        Out of stock
                      </span>
                      <span className="mt-0.5 flex items-baseline gap-1">
                        <span
                          className="text-base sm:text-lg font-bold leading-none tabular-nums text-amber-700 dark:text-amber-400 truncate"
                          title={`${outOfStockCount.toLocaleString()} out of stock items`}
                        >
                          {outOfStockCount.toLocaleString()}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>

                {/* ── Toolbar: Search, Filters, Column Toggle ────────────── */}
                <div
                  id="tour-search-filters"
                  className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print animate-enter relative z-20"
                >
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
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search query"
                        title="Clear search"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdowns & Column Visibility: Responsive Flex on Mobile, Inline on Desktop */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
                      {/* Category Filter */}
                      <div className="flex-1 min-w-[135px] flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 sm:px-3 py-2">
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
                      <div className="flex-1 min-w-[115px] flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 sm:px-3 py-2">
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
                      <div className="w-full sm:w-auto shrink-0">
                        <ColumnsVisibilityMenu
                          columns={columns}
                          hiddenColumnIds={hiddenColumnIds}
                          onToggleColumn={handleToggleColumn}
                          onOpenSchemaBuilder={
                            currentUser?.role === "admin"
                              ? () => setIsColumnsModalOpen(true)
                              : undefined
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
                <div
                  id="tour-table"
                  className="w-full flex-1 flex flex-col min-h-0"
                >
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
          </div>
        </main>
      </div>

      {/* ── Slide-in Mobile Drawer ──────────────────────────────────── */}
      {isMobileNavOpen && (
        <MobileNav
          rooms={rooms}
          facilities={facilities}
          selectedRoomId={selectedRoomId}
          selectedFacilityId={selectedFacilityId}
          onSelectFacility={handleSelectFacility}
          onAddFacility={handleAddFacility}
          onEditFacility={handleEditFacility}
          totalItemsCount={facilityScopedItems.length}
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
          userRole={currentUser?.role}
        />
      )}

      {/* ── Item Add / Edit Modal ───────────────────────────────────── */}
      {isItemModalOpen && (
        <Suspense fallback={null}>
          <ItemModal
            key={editingItem && editingItem.id ? editingItem.id : "new-item"}
            isOpen={isItemModalOpen}
            onClose={() => setIsItemModalOpen(false)}
            editingItem={editingItem}
            columns={columns}
            rooms={rooms}
            facilities={facilities}
            selectedRoomId={selectedRoomId}
            onSave={async (savedItem) => {
              const isEdit = Boolean(editingItem && editingItem.id);
              localMutationVersionRef.current += 1;
              if (isEdit) {
                setItems((prev) =>
                  prev.map((i) => (i.id === savedItem.id ? savedItem : i)),
                );
              } else {
                setItems((prev) => [savedItem, ...prev]);
              }
              setIsItemModalOpen(false);
              const ok = await inventoryService.upsertItem(savedItem);
              if (ok) {
                showToast(
                  isEdit
                    ? `Updated item "${savedItem.name}"`
                    : `Added item "${savedItem.name}"`,
                  "success",
                );
              } else {
                showToast(
                  `Saved "${savedItem.name}" locally, but cloud sync failed.`,
                  "error",
                );
              }
            }}
          />
        </Suspense>
      )}

      {/* ── Schema Builder Modal (Admin Only) ───────────────────────── */}
      {isColumnsModalOpen && currentUser?.role === "admin" && (
        <Suspense fallback={<ModalSkeleton size="lg" />}>
          <ColumnsSchemaModal
            isOpen={isColumnsModalOpen}
            onClose={() => setIsColumnsModalOpen(false)}
            columns={columns}
            onSave={async (newCols) => {
              localMutationVersionRef.current += 1;
              setColumns(newCols);
              try {
                localStorage.setItem(
                  STORAGE_KEY_COLUMNS,
                  JSON.stringify(newCols),
                );
              } catch {}
              setIsColumnsModalOpen(false);
              const ok = await inventoryService.saveColumns(newCols);
              if (ok) {
                showToast(
                  "Inventory column schema updated successfully!",
                  "success",
                );
              } else {
                showToast(
                  "Updated schema locally, but cloud sync failed.",
                  "error",
                );
              }
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
            facilities={facilities}
            defaultFacility={
              selectedFacilityId !== "ALL"
                ? selectedFacilityId
                : facilities[0]?.id || DEFAULT_FACILITY_ID
            }
            onDelete={(room) => confirmDeleteRoom(room)}
            onSave={async (savedRoom) => {
              localMutationVersionRef.current += 1;
              const normalizedFac = normalizeFacilityId(
                savedRoom.facility,
                facilities,
              );
              const canonicalRoom: Room = {
                ...savedRoom,
                facility: normalizedFac,
              };
              const updatedItems: InventoryItem[] = [];

              if (editingRoom) {
                setRooms((prev) =>
                  prev.map((r) =>
                    r.id === canonicalRoom.id ? canonicalRoom : r,
                  ),
                );
                // Propagate updated room name & facility to items inside this room
                const now = new Date().toISOString();
                setItems((prev) =>
                  prev.map((it) => {
                    if (it.roomId === canonicalRoom.id) {
                      const nextItem: InventoryItem = {
                        ...it,
                        room: canonicalRoom.name,
                        facility: normalizedFac,
                        updatedAt: now,
                      };
                      updatedItems.push(nextItem);
                      return nextItem;
                    }
                    return it;
                  }),
                );
              } else {
                setRooms((prev) => [...prev, canonicalRoom]);
                setSelectedRoomId(canonicalRoom.id);
              }
              setIsRoomModalOpen(false);

              const [roomOk, itemsOk] = await Promise.all([
                inventoryService.upsertRoom(canonicalRoom),
                updatedItems.length > 0
                  ? inventoryService.upsertItemsBatch(updatedItems)
                  : Promise.resolve(true),
              ]);
              if (roomOk && itemsOk) {
                showToast(
                  editingRoom
                    ? `Updated room "${canonicalRoom.name}"`
                    : `Created room "${canonicalRoom.name}"`,
                  "success",
                );
              } else {
                showToast(
                  `Saved "${canonicalRoom.name}" locally, but cloud sync failed.`,
                  "error",
                );
              }
            }}
          />
        </Suspense>
      )}

      {/* ── Facility Add / Edit Modal ─────────────────────────────── */}
      {isFacilityModalOpen && (
        <Suspense fallback={<ModalSkeleton size="sm" />}>
          <FacilityModal
            isOpen={isFacilityModalOpen}
            onClose={() => setIsFacilityModalOpen(false)}
            editingFacility={editingFacility}
            onSave={handleSaveFacility}
            onDelete={confirmDeleteFacility}
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
        facilityName={
          currentRoom
            ? `${currentRoom.name} (${getFacility(currentRoom.facility, facilities).name})`
            : selectedFacilityId !== "ALL"
              ? getFacility(selectedFacilityId, facilities).fullName
              : "All Facilities"
        }
        facilityId={
          currentRoom?.facility
            ? normalizeFacilityId(currentRoom.facility, facilities)
            : selectedFacilityId !== "ALL"
              ? selectedFacilityId
              : undefined
        }
      />

      {/* ── Action Confirmation Dialog ──────────────────────────────── */}
      {confirmDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
        >
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
              <h3
                id="confirm-dialog-title"
                className="text-base font-heading font-bold text-slate-900 dark:text-white"
              >
                {confirmDialog.title}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer ${
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
          onToggleMobileNav={setIsMobileNavOpen}
          isMobileNavOpen={isMobileNavOpen}
        />
      )}

      {/* ── Toast Notifications ─────────────────────────────────────── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
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
