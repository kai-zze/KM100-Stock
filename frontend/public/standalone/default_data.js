window.KM100_DEFAULT_ROOMS = [
    {
        "description":  "Contact Center Services Training Lab",
        "name":  "Contact Center Services",
        "id":  "room-ccs"
    },
    {
        "description":  "KM100 Administration \u0026 Operations Office",
        "name":  "Admin Office",
        "id":  "room-admin"
    },
    {
        "description":  "Computer Systems Servicing NC II Lab",
        "name":  "Computer System Servicing",
        "id":  "room-css"
    },
    {
        "description":  "Bread and Pastry Production Training Facility",
        "name":  "Bread \u0026 Pastry",
        "id":  "room-bp"
    }
];

window.KM100_DEFAULT_COLUMNS = [
    {
        "label":  "ITEM NAME",
        "key":  "name",
        "id":  "col-name",
        "type":  "text",
        "required":  true
    },
    {
        "id":  "col-category",
        "label":  "CATEGORY",
        "required":  true,
        "type":  "dropdown",
        "key":  "category",
        "options":  [
                        "Tools",
                        "Consumables and Maintenance",
                        "Peripherals and Storage",
                        "PC Hardware and Components",
                        "Diagnostic and Testing",
                        "Cables and Connectors",
                        "Networking Equipment",
                        "Operating System and Software"
                    ]
    },
    {
        "label":  "QUANTITY",
        "key":  "quantity",
        "id":  "col-quantity",
        "type":  "number",
        "required":  true
    },
    {
        "id":  "col-units",
        "label":  "UNITS",
        "required":  true,
        "type":  "dropdown",
        "key":  "units",
        "options":  [
                        "pcs",
                        "case",
                        "box",
                        "bag"
                    ]
    },
    {
        "id":  "col-status",
        "label":  "Status",
        "required":  true,
        "type":  "dropdown",
        "key":  "status",
        "options":  [
                        "Working",
                        "Empty",
                        "Deffective",
                        "Used",
                        "Incomplete"
                    ]
    }
];

window.KM100_DEFAULT_ITEMS = [
    {
        "id":  "km100-001",
        "name":  "100 in 1 Precision Screwdriver",
        "category":  "Tools",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-002",
        "name":  "191ml WD-40",
        "category":  "Consumables and Maintenance",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-003",
        "name":  "2.0 Flash Drive 16GB",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-004",
        "name":  "2.5 HDD External Case",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-005",
        "name":  "2.5 HDD External Case",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Empty",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-006",
        "name":  "3 in 1 Printer with Wireless Access",
        "category":  "PC Hardware and Components",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Deffective",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-007",
        "name":  "3.0 Flash Drive 128GB",
        "category":  "Peripherals and Storage",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-008",
        "name":  "32 in 1 Precision Screwdriver",
        "category":  "Tools",
        "quantity":  4,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-009",
        "name":  "44 in 1 Precision Screwdriver",
        "category":  "Tools",
        "quantity":  5,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-010",
        "name":  "7 in 1 Stainless Steel Cutter",
        "category":  "Tools",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-011",
        "name":  "9V Battery",
        "category":  "Consumables and Maintenance",
        "quantity":  27,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-012",
        "name":  "A4Tech HU-9 USB Headset",
        "category":  "Peripherals and Storage",
        "quantity":  14,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-013",
        "name":  "ALHUA CCTV",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-014",
        "name":  "Allen Wrench 8pcs",
        "category":  "Tools",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-015",
        "name":  "Allen Wrench 9pcs",
        "category":  "Tools",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-016",
        "name":  "Analog Multimeter Sanwa",
        "category":  "Diagnostic and Testing",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-017",
        "name":  "Anti-static Wrist Strap",
        "category":  "Consumables and Maintenance",
        "quantity":  19,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-018",
        "name":  "Bootable Drive",
        "category":  "Peripherals and Storage",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-019",
        "name":  "Cat 6",
        "category":  "Cables and Connectors",
        "quantity":  26,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-020",
        "name":  "CDR ",
        "category":  "PC Hardware and Components",
        "quantity":  27,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-021",
        "name":  "CDR-W",
        "category":  "PC Hardware and Components",
        "quantity":  64,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-022",
        "name":  "China Router",
        "category":  "Networking Equipment",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-023",
        "name":  "Cisco Switch Catalyst 3750",
        "category":  "Networking Equipment",
        "quantity":  8,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-024",
        "name":  "Cleaning Brush",
        "category":  "Consumables and Maintenance",
        "quantity":  24,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-025",
        "name":  "Combination Pliers",
        "category":  "Tools",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-026",
        "name":  "Cooling Pan",
        "category":  "PC Hardware and Components",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-027",
        "name":  "Coupler",
        "category":  "Cables and Connectors",
        "quantity":  32,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-028",
        "name":  "Crimping Tools Non-Pass through",
        "category":  "Tools",
        "quantity":  18,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-029",
        "name":  "Crimping Tools Non-Pass through",
        "category":  "Tools",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-030",
        "name":  "CSS Books",
        "category":  "Peripherals and Storage",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-031",
        "name":  "Cutter",
        "category":  "Tools",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-032",
        "name":  "Digital Multimeter",
        "category":  "Diagnostic and Testing",
        "quantity":  5,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-033",
        "name":  "Digital Multimeter Standard",
        "category":  "Diagnostic and Testing",
        "quantity":  5,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-034",
        "name":  "Dito Home",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-035",
        "name":  "Double A Battery",
        "category":  "Consumables and Maintenance",
        "quantity":  18,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-036",
        "name":  "Drill Bit x13",
        "category":  "Tools",
        "quantity":  2,
        "units":  "case",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-037",
        "name":  "Dual Modular Box",
        "category":  "Cables and Connectors",
        "quantity":  7,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-038",
        "name":  "DVDR 16X",
        "category":  "Consumables and Maintenance",
        "quantity":  73,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-039",
        "name":  "Electrical Contact Cleaner",
        "category":  "Consumables and Maintenance",
        "quantity":  4,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-040",
        "name":  "EPSON Printer L121",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-041",
        "name":  "Ethernal Wall Plate",
        "category":  "Networking Equipment",
        "quantity":  12,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-042",
        "name":  "Exernal Optical Drive",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-043",
        "name":  "Filler Clead-free",
        "category":  "Consumables and Maintenance",
        "quantity":  5,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-044",
        "name":  "Flat Head Screwdriver",
        "category":  "Tools",
        "quantity":  4,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-045",
        "name":  "Globe at Home",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-046",
        "name":  "Half used Contact Cleaner 450ml",
        "category":  "Consumables and Maintenance",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-047",
        "name":  "HDD 500GB",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-048",
        "name":  "HDMI to Display Port",
        "category":  "Cables and Connectors",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-049",
        "name":  "Heatsink Compound",
        "category":  "Consumables and Maintenance",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-050",
        "name":  "Helping Hand Magnifier LED light with Soldering Stand",
        "category":  "Tools",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-051",
        "name":  "HP 800G1 Charger",
        "category":  "Cables and Connectors",
        "quantity":  7,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-052",
        "name":  "HP EliteDesk 800 GI USDI - System Unit",
        "category":  "PC Hardware and Components",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Deffective",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-053",
        "name":  "INPLAY X10 Case",
        "category":  "PC Hardware and Components",
        "quantity":  4,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-054",
        "name":  "INPLAY X50 Case",
        "category":  "PC Hardware and Components",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-055",
        "name":  "JUHER SSD",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-056",
        "name":  "K2 Web Cam",
        "category":  "Peripherals and Storage",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-057",
        "name":  "Lan Tester",
        "category":  "Diagnostic and Testing",
        "quantity":  43,
        "units":  "pcs",
        "status":  "Deffective",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-058",
        "name":  "Long Nose Pliers",
        "category":  "Tools",
        "quantity":  19,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-059",
        "name":  "Magnetic Mat",
        "category":  "Consumables and Maintenance",
        "quantity":  7,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-060",
        "name":  "MERCUSYS Router",
        "category":  "Networking Equipment",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-061",
        "name":  "Multi-function Induction Headlamp",
        "category":  "Tools",
        "quantity":  9,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-062",
        "name":  "NAS USB",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-063",
        "name":  "Network Attached Storage",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-064",
        "name":  "Network Controller",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-065",
        "name":  "NPC Monitor",
        "category":  "PC Hardware and Components",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-066",
        "name":  "NPC Monitor",
        "category":  "PC Hardware and Components",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Used",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-067",
        "name":  "PCI\u0026PCI Express Card",
        "category":  "PC Hardware and Components",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-068",
        "name":  "Portable Electric Drill",
        "category":  "Tools",
        "quantity":  2,
        "units":  "box",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-069",
        "name":  "Procurve Switch",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-070",
        "name":  "Punch Down",
        "category":  "Tools",
        "quantity":  17,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-071",
        "name":  "RAMSTA Motherboard",
        "category":  "PC Hardware and Components",
        "quantity":  5,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-072",
        "name":  "Rework Station",
        "category":  "Tools",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-073",
        "name":  "RJ45 Connector Cups Blue",
        "category":  "Cables and Connectors",
        "quantity":  176,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-074",
        "name":  "RJ45 Network Connector",
        "category":  "Cables and Connectors",
        "quantity":  280,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-075",
        "name":  "RJ45 Network Connector",
        "category":  "Cables and Connectors",
        "quantity":  397,
        "units":  "pcs",
        "status":  "Deffective",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-076",
        "name":  "RJ45 Network Connector Pass-through",
        "category":  "Cables and Connectors",
        "quantity":  46,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-077",
        "name":  "SAMWA Multimeter",
        "category":  "Diagnostic and Testing",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-078",
        "name":  "Screwdriver",
        "category":  "Tools",
        "quantity":  16,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-079",
        "name":  "Screws",
        "category":  "Consumables and Maintenance",
        "quantity":  32,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-080",
        "name":  "Single Modular Box",
        "category":  "Cables and Connectors",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-081",
        "name":  "Solder Sucker",
        "category":  "Tools",
        "quantity":  15,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-082",
        "name":  "Solder Wire",
        "category":  "Consumables and Maintenance",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-083",
        "name":  "Soldering Kit",
        "category":  "Tools",
        "quantity":  11,
        "units":  "bag",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-084",
        "name":  "Steel Tape",
        "category":  "Consumables and Maintenance",
        "quantity":  9,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-085",
        "name":  "Switch Catalyst 2960G",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-086",
        "name":  "Switch Catalyst 3560G",
        "category":  "Networking Equipment",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-087",
        "name":  "System Unit Wire",
        "category":  "Cables and Connectors",
        "quantity":  28,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-088",
        "name":  "TENDA Router",
        "category":  "Networking Equipment",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-089",
        "name":  "TENDA Router",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "room":  "Admin Office"
    },
    {
        "id":  "km100-090",
        "name":  "TENDA Router",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "room":  "Computer System Servicing"
    },
    {
        "id":  "km100-091",
        "name":  "TENDA Router",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "room":  "Bread \u0026 Pastry"
    },
    {
        "id":  "km100-092",
        "name":  "TENDA Tilt Camera",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "room":  "Bread \u0026 Pastry"
    },
    {
        "id":  "km100-093",
        "name":  "TENDA Tilt Camera",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "room":  "Computer System Servicing"
    },
    {
        "id":  "km100-094",
        "name":  "TP-Link Router Archer C64",
        "category":  "Networking Equipment",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Empty",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-095",
        "name":  "Unidentified Motherboard",
        "category":  "PC Hardware and Components",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Deffective",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-096",
        "name":  "Unidentified System Unit Case",
        "category":  "PC Hardware and Components",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-097",
        "name":  "UPS",
        "category":  "PC Hardware and Components",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-098",
        "name":  "USB External HDD All-in-one External Inclosure Storage",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-099",
        "name":  "USB External HDD, 3.5 Enclosure",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-100",
        "name":  "USB to RJ45",
        "category":  "Cables and Connectors",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-101",
        "name":  "USB TO RS232",
        "category":  "Cables and Connectors",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-102",
        "name":  "VGA to Display Port",
        "category":  "Cables and Connectors",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-103",
        "name":  "VGA Wire",
        "category":  "Cables and Connectors",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-104",
        "name":  "Video Card",
        "category":  "PC Hardware and Components",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-105",
        "name":  "Web Cam",
        "category":  "Peripherals and Storage",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-106",
        "name":  "Windows 10 Pro",
        "category":  "Operating System and Software",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-107",
        "name":  "Windows Server 2022",
        "category":  "Operating System and Software",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-108",
        "name":  "Wire Stripper",
        "category":  "Tools",
        "quantity":  19,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-109",
        "name":  "Wireless Landline",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-110",
        "name":  "Wireless N Ceiling Mount Access Point",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-111",
        "name":  "Wireless N Ceiling Mount Access Point",
        "category":  "Networking Equipment",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Incomplete",
        "room":  "Contact Center Services"
    },
    {
        "id":  "km100-112",
        "name":  "YALE Smoke Detector",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "room":  "Contact Center Services"
    }
];