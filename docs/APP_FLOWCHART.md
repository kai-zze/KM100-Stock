# KM100 Inventory Management System: User Flow Flowchart

This document contains the complete, easy-to-read **User Flow Flowchart** for the **KM100 Skills and Training Center, Inc.** Property Custody & Inventory Management System.

- **Part 1 (Entry, Login & Onboarding)**: Matches the full authentication flow from launching the app, signing in or registering with a shared passkey (Custodian or Staff), taking the 8-step interactive tour, and landing on the **Master Facilities Dashboard**.
- **Part 2 (How to Use the System — Simple)**: Continues cleanly from the dashboard into simple daily operations: picking a room, searching/filtering equipment, adjusting stock quantities or condition badges, managing rooms/passkeys (Admin only), printing custody sheets / exporting Excel / printing QR stickers, and signing out.

---

## User Flow Flowchart

![KM100 User Flow Flowchart](./flowcharts/user-flow-flowchart.png)

> **Exports**: [Ultra-HD PNG (3840×2440)](./flowcharts/user-flow-flowchart.png) • [Lossless Vector SVG](./flowcharts/user-flow-flowchart.svg) • [Mermaid Source (`ims-user-flow.mmd`)](./ims-user-flow.mmd)

---

### Mermaid Source Definition (`docs/ims-user-flow.mmd`)

```mermaid
flowchart TD
    %% PART 1: ENTRY, LOGIN & ONBOARDING
    Start(["Launches Website / App"]) --> HasSession{"Existing Session?"}
    HasSession -->|No| AuthScreen["Authentication Screen"]
    HasSession -->|Yes| Dashboard["Master Facilities Dashboard"]

    AuthScreen --> UserAction{"User Action"}
    UserAction -->|Sign In| EnterCreds["Enter Email and Password"]
    EnterCreds --> VerifyCreds{"Verify Credentials"}
    VerifyCreds -->|Invalid| LoginErr["Show Error Banner"] --> AuthScreen
    VerifyCreds -->|Valid| SetSession["Set Active Session"] --> Dashboard

    UserAction -->|Register| EnterReg["Enter Info and Shared Passkey"]
    EnterReg --> VerifyPass{"Valid Shared Passkey?"}
    VerifyPass -->|Invalid| PassErr["Show Passkey Error"] --> EnterReg
    VerifyPass -->|Valid| SelectRole{"Select Role"}
    SelectRole -->|Custodian| CreateAdmin["Create Admin Account"]
    SelectRole -->|Staff| CreateStaff["Create Staff Account"]
    CreateAdmin & CreateStaff --> Tour["8-Step Interactive Tour"]
    Tour --> SkipTour["Complete or Skip Tour"]
    SkipTour --> SaveFlag["Save Tour Flag"] --> Dashboard

    %% PART 2: HOW TO USE THE SYSTEM (SIMPLE GUIDE)
    Dashboard --> ViewTotals["View Dashboard & Summary Totals"]
    ViewTotals --> PickRoom["Select Training Room or All Facilities"]
    PickRoom --> SearchFilter["Search or Filter Equipment"]
    SearchFilter --> WhatAction{"What Do You Need to Do?"}
    WhatAction -->|Daily Audit| AdjustStock["Adjust + / - Quantity or Update Status"]
    WhatAction -->|Manage Items| AddEditItem["Add New Item or Edit Details"]
    AdjustStock & AddEditItem --> AutoSave["Changes Saved Automatically"]

    AutoSave --> IsAdmin{"Admin (Custodian)?"}
    IsAdmin -->|Yes| AdminTools["Manage Rooms, Columns & Passkeys"]
    IsAdmin -->|No Staff| ExportReports[/"Print Custody Sheet or Export Excel Workbook"/]
    AdminTools --> ExportReports

    ExportReports --> DoneCheck{"Done for Today?"}
    DoneCheck -->|No| PickRoom
    DoneCheck -->|Yes| SignOut(["Sign Out"])

    classDef startEnd fill:#ecfdf5,stroke:#059669,stroke-width:2.5px,color:#064e3b;
    classDef success fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef err fill:#fee2e2,stroke:#e11d48,stroke-width:2px,color:#9f1239;
    classDef tour fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef report fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a;

    class Start,SignOut startEnd;
    class CreateAdmin,CreateStaff,Dashboard,AutoSave success;
    class LoginErr,PassErr err;
    class Tour,AdminTools tour;
    class ExportReports report;
```
