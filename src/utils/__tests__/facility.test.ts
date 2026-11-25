import { describe, it, expect } from "vitest";
import {
  FACILITIES,
  DEFAULT_FACILITIES,
  normalizeFacilityId,
  getFacility,
  DEFAULT_FACILITY_ID,
  Facility,
} from "../../types/inventory";

describe("Multi-Facility Governance Model", () => {
  it("contains all 4 canonical KM100 facilities: KM100 Skills and Training Center, Inc., PETC, Knoah Mari, Red Goose", () => {
    const ids = FACILITIES.map((f) => f.id);
    expect(ids).toContain("fac-km100-stc");
    expect(ids).toContain("fac-petc");
    expect(ids).toContain("fac-knoah-mari");
    expect(ids).toContain("fac-red-goose");
    expect(FACILITIES).toHaveLength(4);

    const km100 = FACILITIES.find((f) => f.id === "fac-km100-stc");
    expect(km100?.name).toBe("KM100 Skills and Training Center, Inc.");
    expect(km100?.code).toBe("KM100");
    expect(km100?.isSystem).toBe(true);
  });

  it("normalizes facility aliases and abbreviations accurately to canonical IDs", () => {
    expect(normalizeFacilityId("petc")).toBe("fac-petc");
    expect(normalizeFacilityId("PETC")).toBe("fac-petc");
    expect(normalizeFacilityId("fac-petc")).toBe("fac-petc");
    expect(normalizeFacilityId("Knoah Mari")).toBe("fac-knoah-mari");
    expect(normalizeFacilityId("KM")).toBe("fac-knoah-mari");
    expect(normalizeFacilityId("fac-knoah-mari")).toBe("fac-knoah-mari");
    expect(normalizeFacilityId("Red Goose")).toBe("fac-red-goose");
    expect(normalizeFacilityId("RG")).toBe("fac-red-goose");
    expect(normalizeFacilityId("fac-red-goose")).toBe("fac-red-goose");
    expect(normalizeFacilityId("STC")).toBe("fac-km100-stc");
    expect(normalizeFacilityId("KM100")).toBe("fac-km100-stc");
    expect(normalizeFacilityId("fac-km100-stc")).toBe("fac-km100-stc");
    expect(normalizeFacilityId("KM100 Skills and Training Center, Inc.")).toBe(
      "fac-km100-stc",
    );
    expect(normalizeFacilityId("")).toBe(DEFAULT_FACILITY_ID);
    expect(normalizeFacilityId(null)).toBe(DEFAULT_FACILITY_ID);
    expect(normalizeFacilityId(undefined)).toBe(DEFAULT_FACILITY_ID);
  });

  it("retrieves full facility metadata using getFacility", () => {
    const petc = getFacility("PETC");
    expect(petc.id).toBe("fac-petc");
    expect(petc.name).toBe("PETC");
    expect(petc.fullName).toContain("Private Emission Testing Center");

    const km = getFacility("Knoah Mari");
    expect(km.id).toBe("fac-knoah-mari");
    expect(km.name).toBe("Knoah Mari");
    expect(km.fullName).toContain("Café & Events");

    const rg = getFacility("Red Goose");
    expect(rg.id).toBe("fac-red-goose");
    expect(rg.name).toBe("Red Goose");
    expect(rg.fullName).toContain("Resto & Café");

    const stc = getFacility("STC");
    expect(stc.id).toBe("fac-km100-stc");
    expect(stc.name).toBe("KM100 Skills and Training Center, Inc.");
    expect(stc.fullName).toBe("KM100 Skills and Training Center, Inc.");
  });

  it("supports dynamic custom facilities CRUD resolution", () => {
    const customFacility: Facility = {
      id: "fac-warehouse-1",
      code: "WH1",
      name: "Bogo Logistics Warehouse",
      shortName: "Warehouse",
      fullName: "Bogo Central Logistics & Storage Warehouse",
      description: "Central reserve storage facility",
      badgeClass: "text-purple-800 bg-purple-50",
    };

    const facilityList = [...DEFAULT_FACILITIES, customFacility];

    // Normalize using custom list
    expect(normalizeFacilityId("fac-warehouse-1", facilityList)).toBe(
      "fac-warehouse-1",
    );
    expect(normalizeFacilityId("WH1", facilityList)).toBe("fac-warehouse-1");
    expect(normalizeFacilityId("Bogo Logistics Warehouse", facilityList)).toBe(
      "fac-warehouse-1",
    );

    // Get facility from custom list
    const found = getFacility("fac-warehouse-1", facilityList);
    expect(found.code).toBe("WH1");
    expect(found.name).toBe("Bogo Logistics Warehouse");
  });
});
