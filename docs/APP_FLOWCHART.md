# KM100 Inventory Management System: Architecture & Workflow Diagrams (Light Mode)

This document provides light-mode architectural blueprints, role-based access control, and operational lifecycles for the **KM100 Skills and Training Center, Inc.** Property Custody & Inventory Management System.

All diagrams are formatted to fit standard **Short Bond Paper (Letter: 8.5" × 11")** and rendered as high-resolution PNG images with an **opaque solid pure white background** in [`docs/flowcharts/`](./flowcharts/).

> 🖨️ **Print-Ready Bond Paper Document**: Open [`docs/KM100_Inventory_Flowcharts_Bondpaper.html`](./KM100_Inventory_Flowcharts_Bondpaper.html) in your browser to print all 5 flowcharts on standard bond paper sheets or save as a multi-page PDF.

---

## 0. Master System Flowchart (End-to-End Operational Lifecycle)

![Master System Flowchart](./flowcharts/00-master-system-flowchart.png)

> **Export**: [Download / View PNG (00-master-system-flowchart.png)](./flowcharts/00-master-system-flowchart.png) • **Print Layout**: Fits Short Bond Paper (8.5" × 11")

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart TD
    %% Section 1: Authentication & Shared Passkey
    subgraph AuthLayer["1. Authentication & Shared Institutional Security"]
        StartApp([User Launches App]) --> Splash["3D Logo Splash & Cache Pre-load"]
        Splash --> AuthState{"Active Session?"}
        AuthState -->|No| LoginModal["Sign In / Registration View"]
        LoginModal --> PasskeyCheck{"Valid Shared Institutional Passkey?"}
        PasskeyCheck -->|Invalid Passkey| RejectAuth["Access Denied Error Banner"]
        RejectAuth --> LoginModal
        PasskeyCheck -->|Valid Passkey| RoleChoice{"Select System Role"}
        RoleChoice -->|Property Custodian| CustodianRole["Role: Property Custodian (Admin)"]
        RoleChoice -->|Training Instructor| InstructorRole["Role: Training Instructor (Staff)"]
    end

    %% Section 2: Local-First Core Architecture
    subgraph ClientEngine["2. Local-First Client Engine (React + Vite)"]
        CustodianRole --> BootSession["Initialize User Session"]
        InstructorRole --> BootSession
        AuthState -->|Yes| BootSession
        BootSession --> LocalStore["Local-First Cache (localStorage - 0ms Paint)"]
        LocalStore --> ReactiveState["React Hooks State Engine"]
        ReactiveState --> UIRender["Tailwind CSS High-Density UI"]
    end

    %% Section 3: Inventory Lifecycle Operations
    subgraph OpsLayer["3. Facilities & Inventory Management"]
        UIRender --> FacilityNav["Facility Scope Navigation (All Rooms or Specific Room)"]
        FacilityNav --> KPIMetrics["Live KPI Telemetry (Total Items, Quantities, Defective, Empty)"]
        KPIMetrics --> SearchFilter["Live Search-as-You-Type & Attribute Filters"]
        SearchFilter --> TableGrid["High-Density Equipment Table (Sticky Headers)"]

        TableGrid --> DirectOps{"Direct Manipulation Controls"}
        DirectOps -->|Inline Steppers| StepperAdjust["Inline + / - Quantity & Physical Audits"]
        DirectOps -->|Status Pills| StatusUpdate["Condition Tagging (Working, Fair, Needs Repair)"]
        DirectOps -->|Enroll Equipment| EnrollModal["Add Equipment Specification"]
        DirectOps -->|Decommission| DeleteModal["Delete Item (Admin Confirmation)"]
    end

    %% Section 4: Cloud Persistence & Automation
    subgraph CloudLayer["4. Cloud Infrastructure & Synchronization"]
        StepperAdjust --> CloudSync["Supabase Cloud Backend (PostgreSQL)"]
        StatusUpdate --> CloudSync
        EnrollModal --> CloudSync
        DeleteModal --> CloudSync
        CloudSync -->|Realtime CDC WebSockets| RealtimeSync["Push Updates to All Connected Devices"]
        RealtimeSync --> ReactiveState
        GHA["GitHub Actions Keep-Alive Cron (Every 3 Days)"] -->|REST Keepalive Ping| CloudSync
    end

    %% Section 5: Institutional Governance & Reporting
    subgraph ReportingLayer["5. Institutional Auditing & Compliance"]
        TableGrid --> ExportReport{"Institutional Document Generation"}
        ExportReport -->|Formal Print| PrintSheet["Print Physical Custody Sheet (Official 3-Signatures Block)"]
        ExportReport -->|Spreadsheet| ExcelExport["Generate Multi-Sheet Formatted Excel Workbook (.xlsx)"]
        ExportReport -->|Schema Control| SchemaConfig["Dynamic Column Customization (Admin Only)"]
        ExportReport -->|Security| PasskeyMgmt["Passkey Governance & Profile Management"]
    end

    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef amber fill:#fffbeb,stroke:#b45309,stroke-width:1.5px,color:#78350f;
    classDef emerald fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px,color:#14532d;
    classDef rose fill:#fff1f2,stroke:#e11d48,stroke-width:1.5px,color:#9f1239;

    class CustodianRole,PasskeyCheck,StepperAdjust,KPIMetrics amber;
    class InstructorRole,CloudSync,RealtimeSync,LocalStore emerald;
    class RejectAuth rose;
```

</details>

---

## 1. High-Level System Architecture & Data Flow

![High-Level System Architecture](./flowcharts/01-architecture-data-flow.png)

> **Export**: [Download / View PNG (01-architecture-data-flow.png)](./flowcharts/01-architecture-data-flow.png) • **Print Layout**: Fits Short Bond Paper (8.5" × 11")

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart TD
    subgraph Client["Client Application (React + Vite)"]
        UI["Web & Mobile UI (Tailwind CSS)"]
        LocalCache["Local-First Cache (localStorage)"]
        State["Application State (React Hooks)"]
    end

    subgraph Supabase["Supabase Cloud Backend"]
        AuthService["Supabase Auth (auth.users)"]
        PostgresDB[("PostgreSQL Database")]
        RealtimeEngine["Realtime WebSockets (CDC Engine)"]
    end

    subgraph Automation["Automated Services"]
        GHA["GitHub Actions Keep-Alive Cron"]
    end

    %% Client Interactions
    UI -->|Instant Paint 0ms| LocalCache
    LocalCache -->|Initial State| State
    State -->|Display| UI

    %% Cloud Sync
    State -->|Async Reconcile & Writes| PostgresDB
    AuthService -->|Auto-Profile Trigger| PostgresDB
    RealtimeEngine -->|Push Changes <200ms| State

    %% Cron
    GHA -->|Every 3 Days REST Ping| PostgresDB

    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef highlight fill:#fffbeb,stroke:#b45309,stroke-width:2px,color:#78350f;
    class UI,LocalCache,State,AuthService,PostgresDB,RealtimeEngine,GHA default;
```

</details>

---

## 2. Authentication & First-Time Onboarding Flow (Shared Passkey)

> **Access Governance**: Property Custodians (Admin) and Training Instructors (Staff) share the same institutional passkey. The user selects their organizational role during enrollment.

![Authentication & First-Time Onboarding Flow](./flowcharts/02-authentication-onboarding-flow.png)

> **Export**: [Download / View PNG (02-authentication-onboarding-flow.png)](./flowcharts/02-authentication-onboarding-flow.png) • **Print Layout**: Fits Short Bond Paper (8.5" × 11")

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart TD
    Start([User Opens Application]) --> Splash["Splash Screen Assembly and Boot"]
    Splash --> CheckSession{"Existing Valid Session?"}

    CheckSession -->|Yes| NormalDashboard["Display Master Facilities Dashboard"]
    CheckSession -->|No| LoginScreen["Display Authentication Screen"]

    LoginScreen --> ModeChoice{"User Action"}

    ModeChoice -->|Sign In| EnterCreds["Enter Email and Password"]
    EnterCreds --> VerifyAuth{"Verify Credentials"}
    VerifyAuth -->|Invalid| LoginError["Show Error Banner"]
    LoginError --> LoginScreen
    VerifyAuth -->|Valid| SetSession["Set Active User Session"]
    SetSession --> NormalDashboard

    ModeChoice -->|Register| EnterReg["Enter Name, Email, Password, Role and Passkey"]
    EnterReg --> CheckSharedPasskey{"Valid Shared Institutional Passkey?"}

    CheckSharedPasskey -->|Invalid| PasskeyError["Show Invalid Passkey Error"]
    PasskeyError --> EnterReg

    CheckSharedPasskey -->|Valid| SelectRole{"Selected Role"}
    SelectRole -->|Property Custodian| CreateAdmin["Register Admin Account in Cloud"]
    SelectRole -->|Training Instructor| CreateStaff["Register Staff Account in Cloud"]

    CreateAdmin --> OnboardingTour["Launch 8-Step Interactive System Tour"]
    CreateStaff --> OnboardingTour

    OnboardingTour --> CompleteTour["User Completes or Skips Tour"]
    CompleteTour --> SaveTourDone["Save Tour Completed in Storage"]
    SaveTourDone --> NormalDashboard

    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef amber fill:#fffbeb,stroke:#b45309,stroke-width:1.5px,color:#78350f;
    classDef rose fill:#fff1f2,stroke:#e11d48,stroke-width:1.5px,color:#9f1239;
    classDef emerald fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px,color:#14532d;

    class OnboardingTour,CheckSharedPasskey amber;
    class PasskeyError,LoginError rose;
    class CreateAdmin,CreateStaff,NormalDashboard emerald;
```

</details>

---

## 3. Core Operational Inventory Lifecycle

![Core Operational Inventory Lifecycle](./flowcharts/03-inventory-lifecycle-flow.png)

> **Export**: [Download / View PNG (03-inventory-lifecycle-flow.png)](./flowcharts/03-inventory-lifecycle-flow.png) • **Print Layout**: Fits Short Bond Paper (8.5" × 11")

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart TD
    subgraph Stage1["1. Facility Scope & Telemetry"]
        Scope{"Select Scope"}
        Scope -->|All Facilities| MasterOverview["Overview Dashboard (Room Cards Grid)"]
        Scope -->|Specific Room| RoomView["Room Inventory View"]

        MasterOverview --> KPICards["Live KPI Telemetry (Total Items, Quantities, Defective, Empty)"]
        RoomView --> KPICards
        KPICards --> SearchFilterBar["Live Search-as-You-Type & Attribute Filters"]
    end

    subgraph Stage2["2. Equipment Direct Manipulation"]
        SearchFilterBar --> TableGrid["High-Density Equipment Table (Sticky Headers)"]
        TableGrid --> ActionChoice{"Perform Operation"}

        ActionChoice -->|Stock Adjust| Steppers["Inline + / - Quantity Steppers & Direct Numeric Input"]
        ActionChoice -->|Condition| StatusPill["Condition Badges (Working, Fair, Needs Repair)"]
        ActionChoice -->|Add Item| AddModal["Equipment Enrollment Modal"]
        ActionChoice -->|Edit Item| EditModal["Specification & Room Reassignment"]
        ActionChoice -->|Delete Item| DeleteModal["Confirm Deletion Dialog (Admin Only)"]

        Steppers --> CloudSync["Instant Cloud Sync (Supabase PostgreSQL + localStorage)"]
        StatusPill --> CloudSync
        AddModal --> CloudSync
        EditModal --> CloudSync
        DeleteModal --> CloudSync
    end

    subgraph Stage3["3. Compliance, Auditing & Export"]
        TableGrid --> AuditActions{"Compliance Action"}

        AuditActions -->|Formal Custody Sheet| PrintDialog["Print Physical Inventory Sheet (3-Signatures Block)"]
        AuditActions -->|Multi-Sheet Workbook| ExcelEngine["Generate Styled Multi-Sheet Excel Workbook (.xlsx)"]
        AuditActions -->|Schema Control| SchemaModal["Admin Dynamic Column Customization"]
    end

    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef amber fill:#fffbeb,stroke:#b45309,stroke-width:1.5px,color:#78350f;
    classDef emerald fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px,color:#14532d;

    class Steppers,KPICards amber;
    class CloudSync emerald;
```

</details>

---

## 4. Institutional Role & Permission Matrix (Shared Passkey Architecture)

> **Security Governance**: Admin and Staff share the same institutional passkey to unlock the system. Role assignment dictates execution permissions between daily custody audits and center-wide administrative controls.

![Institutional Role & Permission Matrix](./flowcharts/04-roles-permission-matrix.png)

> **Export**: [Download / View PNG (04-roles-permission-matrix.png)](./flowcharts/04-roles-permission-matrix.png) • **Print Layout**: Fits Short Bond Paper (8.5" × 11")

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart TD
    subgraph PasskeyGovernance["Shared Institutional Security"]
        SharedKey["Shared Institutional Passkey (KM100-2026 / 2025)"]
        SharedKey --> RoleAdmin["Property Custodian (Admin)"]
        SharedKey --> RoleStaff["Training Instructor (Staff)"]
    end

    subgraph Tier1["1. Daily Stock & Custody Controls (Shared: Admin & Staff)"]
        P1["Inline Stock Audits (+ / - Steppers)"]
        P2["Condition Tagging (Working, Fair, Needs Repair)"]
        P3["Physical Custody Sheet Printing (3-Signature Block)"]
        P4["Export Multi-Sheet Formatted Excel (.xlsx)"]
        P5["Enroll & Edit Equipment Specifications"]
    end

    subgraph Tier2["2. Center-Wide Administrative Authority (Admin Exclusive)"]
        P6["Decommission & Permanent Item Deletion"]
        P7["Facility Room Creation, Rename & Deletion"]
        P8["Custom Schema & Dynamic Column Configuration"]
        P9["Institutional Passkey & Profile Governance"]
    end

    RoleStaff --> Tier1
    RoleAdmin --> Tier1
    RoleAdmin --> Tier2

    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef admin fill:#fffbeb,stroke:#b45309,stroke-width:2px,color:#78350f;
    classDef staff fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#14532d;

    class RoleAdmin admin;
    class RoleStaff staff;
```

</details>
