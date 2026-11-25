import { supabase } from "../utils/supabaseClient";
import {
  InventoryItem,
  Room,
  ColumnDefinition,
  Facility,
  normalizeFacilityId,
} from "../types/inventory";
import { normalizeStatus } from "../utils/status";

// Map database record to InventoryItem model
export const mapDbItemToInventoryItem = (row: any): InventoryItem => {
  const customFields =
    row.custom_fields && typeof row.custom_fields === "object"
      ? row.custom_fields
      : {};
  const cond = normalizeStatus(
    row.condition || customFields.status || customFields.condition || "Working",
  );
  const deployedTo =
    customFields.deployedTo ||
    customFields.deployedLocation ||
    row.deployed_to ||
    undefined;
  return {
    id: row.id,
    roomId: row.room_id || "",
    facility: row.facility || customFields.facility || undefined,
    name: row.name || "",
    category: row.category || "General",
    quantity: Number(row.quantity) || 0,
    units: row.units || "pcs",
    status: cond,
    condition: cond,
    remarks: row.remarks || "",
    room: row.room_name || "",
    deployedTo,
    deployedLocation: deployedTo,
    ...customFields,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
};

// Map InventoryItem model to database record
export const mapInventoryItemToDb = (item: InventoryItem): any => {
  const {
    id,
    roomId,
    facility,
    name,
    category,
    quantity,
    units,
    status,
    condition,
    remarks,
    createdAt,
    updatedAt,
    custom_fields,
    deployedTo,
    deployedLocation,
    ...rest
  } = item;

  // Extract custom fields (merge any existing custom_fields + rest)
  const mergedCustomFields: Record<string, any> = {
    ...(custom_fields && typeof custom_fields === "object"
      ? custom_fields
      : {}),
  };
  if (facility) {
    mergedCustomFields.facility = facility;
  }
  if (deployedTo || deployedLocation) {
    mergedCustomFields.deployedTo = deployedTo || deployedLocation;
    mergedCustomFields.deployedLocation = deployedLocation || deployedTo;
  }
  for (const [k, v] of Object.entries(rest)) {
    if (k !== "room" && k !== "custom_fields") {
      mergedCustomFields[k] = v;
    }
  }

  const finalCondition = normalizeStatus(status || condition || "Working");

  return {
    id,
    room_id: roomId,
    name,
    category: category || "General",
    quantity: Math.max(0, Number(quantity) || 0),
    units: units || "pcs",
    condition: finalCondition,
    remarks: remarks || "",
    custom_fields: mergedCustomFields,
    created_at: createdAt || new Date().toISOString(),
    updated_at: updatedAt || new Date().toISOString(),
  };
};

export interface FetchResult<T> {
  ok: boolean;
  data: T;
}

const mapDbRoom = (r: any): Room => {
  let facility = r.facility;
  const desc = r.description || "";
  if (!facility && desc.includes("[FACILITY:")) {
    const match = desc.match(/\[FACILITY:([A-Za-z0-9_-]+)\]/);
    if (match) facility = match[1];
  }
  if (!facility) {
    if (r.id?.startsWith("room-petc")) facility = "fac-petc";
    else if (r.id?.startsWith("room-km")) facility = "fac-knoah-mari";
    else if (r.id?.startsWith("room-rg")) facility = "fac-red-goose";
    else facility = "fac-km100-stc";
  } else {
    facility = normalizeFacilityId(facility);
  }
  return {
    id: r.id,
    name: r.name,
    description: desc.replace(/\s*\[FACILITY:[A-Za-z0-9_-]+\]/g, "").trim(),
    facility,
  };
};

const mapDbFacility = (f: any): Facility => ({
  id: f.id,
  code: f.code || String(f.id).slice(0, 4).toUpperCase(),
  name: f.name,
  shortName: f.short_name || f.name,
  fullName: f.full_name || f.name,
  description: f.description || "",
  badgeClass: f.badge_class || undefined,
  isSystem: Boolean(f.is_system),
});

const mapDbColumn = (c: any): ColumnDefinition => ({
  id: c.id,
  label: c.label,
  type: c.type || "text",
  options: Array.isArray(c.options) ? c.options : [],
  order: Number(c.order_index) || 0,
  isSystem:
    c.id === "name" ||
    c.id === "category" ||
    c.id === "quantity" ||
    c.id === "units" ||
    c.id === "status",
});

export const inventoryService = {
  /** Fetch all facilities from Supabase (gracefully ignores missing table if migration 003 not yet applied) */
  async fetchFacilitiesWithStatus(): Promise<FetchResult<Facility[]>> {
    try {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return { ok: true, data: (data || []).map(mapDbFacility) };
    } catch {
      return { ok: false, data: [] };
    }
  },

  async upsertFacility(facility: Facility): Promise<boolean> {
    try {
      const { error } = await supabase.from("facilities").upsert({
        id: facility.id,
        code: facility.code,
        name: facility.name,
        short_name: facility.shortName,
        full_name: facility.fullName,
        description: facility.description || "",
        badge_class: facility.badgeClass || "",
        is_system: Boolean(facility.isSystem),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn("Supabase facility upsert skipped/failed:", err);
      return false;
    }
  },

  async deleteFacility(facilityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("facilities")
        .delete()
        .eq("id", facilityId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn("Supabase facility delete skipped/failed:", err);
      return false;
    }
  },

  /** Fetch all rooms from Supabase with status */
  async fetchRoomsWithStatus(): Promise<FetchResult<Room[]>> {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return { ok: true, data: (data || []).map(mapDbRoom) };
    } catch (err) {
      console.warn(
        "Failed to fetch rooms from Supabase, falling back to local cache:",
        err,
      );
      return { ok: false, data: [] };
    }
  },

  /** Fetch all rooms from Supabase */
  async fetchRooms(): Promise<Room[]> {
    const res = await this.fetchRoomsWithStatus();
    return res.data;
  },

  /** Fetch all column definitions from Supabase with status */
  async fetchColumnsWithStatus(): Promise<FetchResult<ColumnDefinition[]>> {
    try {
      const { data, error } = await supabase
        .from("columns_schema")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return { ok: true, data: (data || []).map(mapDbColumn) };
    } catch (err) {
      console.warn(
        "Failed to fetch columns from Supabase, falling back to local cache:",
        err,
      );
      return { ok: false, data: [] };
    }
  },

  /** Fetch all column definitions from Supabase */
  async fetchColumns(): Promise<ColumnDefinition[]> {
    const res = await this.fetchColumnsWithStatus();
    return res.data;
  },

  /** Fetch all inventory items from Supabase with status */
  async fetchItemsWithStatus(): Promise<FetchResult<InventoryItem[]>> {
    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return { ok: true, data: (data || []).map(mapDbItemToInventoryItem) };
    } catch (err) {
      console.warn(
        "Failed to fetch items from Supabase, falling back to local cache:",
        err,
      );
      return { ok: false, data: [] };
    }
  },

  /** Fetch all inventory items from Supabase */
  async fetchItems(): Promise<InventoryItem[]> {
    const res = await this.fetchItemsWithStatus();
    return res.data;
  },

  /** Save or update an item in Supabase */
  async upsertItem(item: InventoryItem): Promise<boolean> {
    try {
      const dbRow = mapInventoryItemToDb(item);
      const { error } = await supabase.from("inventory_items").upsert(dbRow);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase item upsert failed:", err);
      return false;
    }
  },

  /** Batch save or update items in Supabase */
  async upsertItemsBatch(items: InventoryItem[]): Promise<boolean> {
    if (items.length === 0) return true;
    try {
      const dbRows = items.map(mapInventoryItemToDb);
      const { error } = await supabase.from("inventory_items").upsert(dbRows);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase batch item upsert failed:", err);
      return false;
    }
  },

  /** Delete an item from Supabase */
  async deleteItem(itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase item delete failed:", err);
      return false;
    }
  },

  /** Delete multiple items from Supabase */
  async deleteItemsBatch(itemIds: string[]): Promise<boolean> {
    if (itemIds.length === 0) return true;
    try {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .in("id", itemIds);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase batch item delete failed:", err);
      return false;
    }
  },

  /** Quick inline quantity update in Supabase */
  async updateQuantity(itemId: string, quantity: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("inventory_items")
        .update({
          quantity: Math.max(0, quantity),
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase quantity update failed:", err);
      return false;
    }
  },

  /** Bulk update item status */
  async bulkUpdateStatus(itemIds: string[], status: string): Promise<boolean> {
    if (itemIds.length === 0) return true;
    try {
      const { error } = await supabase
        .from("inventory_items")
        .update({
          condition: normalizeStatus(status),
          updated_at: new Date().toISOString(),
        })
        .in("id", itemIds);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase bulk status update failed:", err);
      return false;
    }
  },

  /** Bulk move items to target room */
  async bulkMoveRoom(
    itemIds: string[],
    targetRoomId: string,
  ): Promise<boolean> {
    if (itemIds.length === 0) return true;
    try {
      const { error } = await supabase
        .from("inventory_items")
        .update({
          room_id: targetRoomId,
          updated_at: new Date().toISOString(),
        })
        .in("id", itemIds);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase bulk room move failed:", err);
      return false;
    }
  },

  /** Save or update a facility room in Supabase */
  async upsertRoom(room: Room): Promise<boolean> {
    try {
      const facility = normalizeFacilityId(room.facility || "fac-km100-stc");
      const baseDesc = (room.description || "")
        .replace(/\s*\[FACILITY:[A-Za-z0-9_-]+\]/g, "")
        .trim();
      const enrichedDesc = baseDesc
        ? `${baseDesc} [FACILITY:${facility}]`
        : `[FACILITY:${facility}]`;

      const { error } = await supabase.from("rooms").upsert({
        id: room.id,
        name: room.name,
        description: enrichedDesc,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase room upsert failed:", err);
      return false;
    }
  },

  /** Batch save or update rooms in Supabase */
  async upsertRoomsBatch(rooms: Room[]): Promise<boolean> {
    if (rooms.length === 0) return true;
    try {
      const now = new Date().toISOString();
      const rows = rooms.map((room) => {
        const facility = normalizeFacilityId(room.facility || "fac-km100-stc");
        const baseDesc = (room.description || "")
          .replace(/\s*\[FACILITY:[A-Za-z0-9_-]+\]/g, "")
          .trim();
        return {
          id: room.id,
          name: room.name,
          description: baseDesc
            ? `${baseDesc} [FACILITY:${facility}]`
            : `[FACILITY:${facility}]`,
          updated_at: now,
        };
      });
      const { error } = await supabase.from("rooms").upsert(rows);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase batch room upsert failed:", err);
      return false;
    }
  },

  /** Delete a facility room from Supabase */
  async deleteRoom(roomId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", roomId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase room delete failed:", err);
      return false;
    }
  },

  /** Replace entire catalog in Supabase (deletes obsolete items/rooms, then upserts new ones) */
  async replaceAllInCloud(
    newRooms: Room[],
    newItems: InventoryItem[],
    obsoleteRoomIds: string[],
    obsoleteItemIds: string[],
  ): Promise<boolean> {
    try {
      if (obsoleteItemIds.length > 0) {
        const { error } = await supabase
          .from("inventory_items")
          .delete()
          .in("id", obsoleteItemIds);
        if (error) throw error;
      }
      if (obsoleteRoomIds.length > 0) {
        const { error } = await supabase
          .from("rooms")
          .delete()
          .in("id", obsoleteRoomIds);
        if (error) throw error;
      }
      const roomsOk = await this.upsertRoomsBatch(newRooms);
      if (!roomsOk) return false;
      const itemsOk = await this.upsertItemsBatch(newItems);
      return itemsOk;
    } catch (err) {
      console.error("Supabase replaceAll failed:", err);
      return false;
    }
  },

  /** Save column definitions to Supabase */
  async saveColumns(columns: ColumnDefinition[]): Promise<boolean> {
    try {
      const records = columns.map((col, idx) => ({
        id: col.id,
        label: col.label,
        type: col.type || "text",
        order_index: idx + 1,
        options: col.options || [],
      }));
      const { error } = await supabase.from("columns_schema").upsert(records);
      if (error) throw error;

      // Safely clean up deleted columns without raw filter string interpolation
      const keepSet = new Set(columns.map((c) => c.id));
      const { data: existingRows, error: fetchErr } = await supabase
        .from("columns_schema")
        .select("id");
      if (fetchErr) throw fetchErr;

      const removedIds = (existingRows || [])
        .map((r: { id: string }) => r.id)
        .filter((id: string) => !keepSet.has(id));
      if (removedIds.length > 0) {
        const { error: delErr } = await supabase
          .from("columns_schema")
          .delete()
          .in("id", removedIds);
        if (delErr) throw delErr;
      }
      return true;
    } catch (err) {
      console.error("Supabase columns save failed:", err);
      return false;
    }
  },

  /** Subscribe to real-time Postgres changes across inventory tables */
  subscribeToRealtimeChanges(handlers: {
    onItemUpsert: (item: InventoryItem) => void;
    onItemDelete: (id: string) => void;
    onRoomUpsert: (room: Room) => void;
    onRoomDelete: (id: string) => void;
    onColumnsChanged: () => void;
    onFacilityUpsert?: (facility: Facility) => void;
    onFacilityDelete?: (id: string) => void;
  }): () => void {
    try {
      const channel = supabase
        .channel("km100-inventory-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "inventory_items" },
          (payload: any) => {
            if (payload.eventType === "DELETE" && payload.old?.id) {
              handlers.onItemDelete(payload.old.id);
            } else if (payload.new) {
              handlers.onItemUpsert(mapDbItemToInventoryItem(payload.new));
            }
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "rooms" },
          (payload: any) => {
            if (payload.eventType === "DELETE" && payload.old?.id) {
              handlers.onRoomDelete(payload.old.id);
            } else if (payload.new) {
              handlers.onRoomUpsert(mapDbRoom(payload.new));
            }
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "columns_schema" },
          () => {
            handlers.onColumnsChanged();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "facilities" },
          (payload: any) => {
            if (payload.eventType === "DELETE" && payload.old?.id) {
              handlers.onFacilityDelete?.(payload.old.id);
            } else if (payload.new) {
              handlers.onFacilityUpsert?.(mapDbFacility(payload.new));
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel).catch(() => {});
      };
    } catch {
      return () => {};
    }
  },
};
