import { supabase } from "../utils/supabaseClient";
import { InventoryItem, Room, ColumnDefinition } from "../types/inventory";

// Map database record to InventoryItem model
export const mapDbItemToInventoryItem = (row: any): InventoryItem => ({
  id: row.id,
  roomId: row.room_id || "",
  name: row.name || "",
  category: row.category || "General",
  quantity: Number(row.quantity) || 0,
  units: row.units || "pcs",
  status: row.condition || "Working",
  condition: row.condition || "Working",
  remarks: row.remarks || "",
  room: row.room_name || "",
  ...(row.custom_fields && typeof row.custom_fields === "object"
    ? row.custom_fields
    : {}),
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

// Map InventoryItem model to database record
export const mapInventoryItemToDb = (item: InventoryItem): any => {
  const {
    id,
    roomId,
    name,
    category,
    quantity,
    units,
    status,
    condition,
    remarks,
    createdAt,
    updatedAt,
    ...rest
  } = item;

  // Extract custom fields (ignore internal / transient properties)
  const customFields: Record<string, any> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (k !== "room") {
      customFields[k] = v;
    }
  }

  return {
    id,
    room_id: roomId,
    name,
    category: category || "General",
    quantity: Number(quantity) || 0,
    units: units || "pcs",
    condition: status || condition || "Working",
    remarks: remarks || "",
    custom_fields: customFields,
    created_at: createdAt || new Date().toISOString(),
    updated_at: updatedAt || new Date().toISOString(),
  };
};

export const inventoryService = {
  /** Fetch all rooms from Supabase */
  async fetchRooms(): Promise<Room[]> {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description || "",
      }));
    } catch (err) {
      console.warn(
        "Failed to fetch rooms from Supabase, falling back to local cache:",
        err,
      );
      return [];
    }
  },

  /** Fetch all column definitions from Supabase */
  async fetchColumns(): Promise<ColumnDefinition[]> {
    try {
      const { data, error } = await supabase
        .from("columns_schema")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return (data || []).map((c: any) => ({
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
      }));
    } catch (err) {
      console.warn(
        "Failed to fetch columns from Supabase, falling back to local cache:",
        err,
      );
      return [];
    }
  },

  /** Fetch all inventory items from Supabase */
  async fetchItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbItemToInventoryItem);
    } catch (err) {
      console.warn(
        "Failed to fetch items from Supabase, falling back to local cache:",
        err,
      );
      return [];
    }
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
    try {
      const { error } = await supabase
        .from("inventory_items")
        .update({
          condition: status,
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
      const { error } = await supabase.from("rooms").upsert({
        id: room.id,
        name: room.name,
        description: room.description || "",
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase room upsert failed:", err);
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
      return true;
    } catch (err) {
      console.error("Supabase columns save failed:", err);
      return false;
    }
  },
};
