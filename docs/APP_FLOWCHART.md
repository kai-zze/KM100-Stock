# KM100 Inventory Management System: Architecture & Workflow Diagrams (Light Mode)

This document provides light-mode architectural blueprints, role-based access control, and operational lifecycles for the **KM100 Skills and Training Center, Inc.** Property Custody & Inventory Management System. All diagrams are rendered as high-resolution PNG images with an **opaque pure white background** in [`docs/flowcharts/`](./flowcharts/).

---

## 0. Master System Flowchart (End-to-End Operational Overview)

![Master System Flowchart](./flowcharts/00-master-system-flowchart.png)

> **Export**: [Download / View PNG (00-master-system-flowchart.png)](./flowcharts/00-master-system-flowchart.png)

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart TD
    %% Section 1: Authentication & Authorization
    subgraph AuthLayer["1. Authentication & Role Authorization"]
        StartApp(["User Launches App"]) --> Splash["3D Logo Splash & Cache Pre-load"]
        Splash --> AuthState{"Active Session?"}
        AuthState -->|No| LoginModal["Sign In / Registration View"]
        LoginModal --> PasskeyCheck{"Institutional Passkey Validation"}
        PasskeyCheck -->|Admin Passkey: KM100-ADMIN-2026 / 2025| CustodianRole["Role: Property Custodian (Full Control)"]
        PasskeyCheck -->|Staff Passkey: KM100-STAFF-2026 / 2025| InstructorRole["Role: Training Instructor (Audits & Stock)"]
        PasskeyCheck -->|Invalid| RejectAuth["Access Denied Banner"]
        RejectAuth --> LoginModal
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

> **Export**: [Download / View PNG (01-architecture-data-flow.png)](./flowcharts/01-architecture-data-flow.png)

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

## 2. Authentication & First-Time Onboarding Flow

![Authentication & First-Time Onboarding Flow](./flowcharts/02-authentication-onboarding-flow.png)

> **Export**: [Download / View PNG (02-authentication-onboarding-flow.png)](./flowcharts/02-authentication-onboarding-flow.png)

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart TD
    Start(["User Opens Application"]) --> Splash["Splash Screen Assembly & Boot"]
    Splash --> CheckSession{"Existing Valid Session?"}

    CheckSession -->|Yes| MainApp["Enter Main Inventory Application"]
    CheckSession -->|No| LoginScreen["Display Login Screen"]

    LoginScreen --> ModeChoice{"User Action"}

    %% Sign In Branch
    ModeChoice -->|Sign In| EnterCreds["Enter Email & Password"]
    EnterCreds --> VerifyAuth{"Verify Credentials"}
    VerifyAuth -->|Invalid| LoginError["Show Error Banner"]
    LoginError --> LoginScreen
    VerifyAuth -->|Valid| SetSession["Set Active User Session"]
    SetSession --> MainApp

    %% Sign Up Branch
    ModeChoice -->|Register| EnterReg["Enter Name, Email, Password, Role & Passkey"]
    EnterReg --> CheckRole{"Selected Role"}

    CheckRole -->|Administrator| CheckAdminPasskey{"Valid Custodian Passkey? (KM100-ADMIN-2026 / 2025)"}
    CheckRole -->|Instructor| CheckStaffPasskey{"Valid Staff Passkey? (KM100-STAFF-2026 / 2025)"}

    CheckAdminPasskey -->|No| PasskeyError["Show Invalid Passkey Error"]
    CheckStaffPasskey -->|No| PasskeyError
    PasskeyError --> EnterReg

    CheckAdminPasskey -->|Yes| CreateCloudAccount["Register in Supabase & Local Cache"]
    CheckStaffPasskey -->|Yes| CreateCloudAccount

    CreateCloudAccount --> SetNewUserFlag["Flag Session: First-Time User"]
    SetNewUserFlag --> MainApp

    %% Onboarding Check
    MainApp --> CheckNewUser{"Is Newly Registered User?"}
    CheckNewUser -->|Yes| OnboardingTour["Launch 8-Step Interactive System Tour"]
    CheckNewUser -->|No| NormalDashboard["Display Master Facilities Dashboard"]

    OnboardingTour --> CompleteTour["User Completes or Skips Tour"]
    CompleteTour --> SaveTourDone["Save Tour Completed Flag in Storage"]
    SaveTourDone --> NormalDashboard

    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef amber fill:#fffbeb,stroke:#b45309,stroke-width:1.5px,color:#78350f;
    classDef rose fill:#fff1f2,stroke:#e11d48,stroke-width:1.5px,color:#9f1239;
    classDef emerald fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px,color:#14532d;

    class OnboardingTour,CheckAdminPasskey,CheckStaffPasskey amber;
    class PasskeyError,LoginError rose;
    class CreateCloudAccount,MainApp emerald;
```

</details>

---

## 3. Core Operational Inventory Lifecycle

![Core Operational Inventory Lifecycle](./flowcharts/03-inventory-lifecycle-flow.png)

> **Export**: [Download / View PNG (03-inventory-lifecycle-flow.png)](./flowcharts/03-inventory-lifecycle-flow.png)

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart TD
    subgraph FacilityNav["1. Facility Navigation"]
        Scope{"Select Scope"}
        Scope -->|All Facilities| MasterOverview["Overview Dashboard (Room Cards Grid)"]
        Scope -->|Specific Room| RoomView["Room Inventory View"]
    end

    subgraph MetricsAndFilters["2. Metrics & Discovery"]
        KPICards["Live KPI Counters (Items, Units, Need Attention, Out of Stock)"]
        SearchFilterBar["Live Search & Attribute Filters (Category, Condition)"]

        MasterOverview --> KPICards
        RoomView --> KPICards
        KPICards -->|1-Click Filter| FilteredGrid["Filtered Equipment View"]
        SearchFilterBar -->|Dynamic Query| FilteredGrid
    end

    subgraph ItemOperations["3. Equipment Direct Manipulation"]
        FilteredGrid --> ActionChoice{"Perform Action"}

        ActionChoice -->|Quantity Adjust| Steppers["Inline + / − Steppers or Direct Numeric Input"]
        Steppers -->|Immediate Write| CloudSync["Instant Cloud Sync (Supabase + localStorage)"]

        ActionChoice -->|Add Item| AddModal["Equipment Enrollment Modal"]
        AddModal -->|Save| CloudSync

        ActionChoice -->|Edit Item| EditModal["Specification & Room Assignment Modal"]
        EditModal -->|Save| CloudSync

        ActionChoice -->|Delete Item| ConfirmDelete{"Confirmation Dialog"}
        ConfirmDelete -->|Confirm| CloudSync
        ConfirmDelete -->|Cancel| FilteredGrid
    end

    subgraph Reporting["4. Audit & Institutional Reporting"]
        AuditActions{"Audit Action"}

        AuditActions -->|Print Physical Sheet| PrintDialog["Print-Formatted Custody Sheet (3-Signature Blocks)"]
        AuditActions -->|Multi-Sheet Excel| ExcelEngine["Generate Styled Multi-Sheet .xlsx Workbook"]
        AuditActions -->|Customize Schema| SchemaModal["Admin Column Customizer (Add/Reorder Custom Fields)"]
    end

    RoomView --> AuditActions
    MasterOverview --> AuditActions

    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef amber fill:#fffbeb,stroke:#b45309,stroke-width:1.5px,color:#78350f;
    classDef emerald fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px,color:#14532d;

    class Steppers,KPICards amber;
    class CloudSync emerald;
```

</details>

---

## 4. Institutional Role & Permission Matrix

![Institutional Role & Permission Matrix](./flowcharts/04-roles-permission-matrix.png)

> **Export**: [Download / View PNG (04-roles-permission-matrix.png)](./flowcharts/04-roles-permission-matrix.png)

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart LR
    subgraph Roles["System Roles"]
        Admin["Property Custodian (Admin)"]
        Staff["Training Instructor (Staff)"]
    end

    subgraph Capabilities["Permissions & Controls"]
        P1["Physical Stock Audits (+ / − Steppers)"]
        P2["Condition Tagging (Working, Fair, Needs Repair)"]
        P3["Print Official Physical Custody Sheets"]
        P4["Export Multi-Sheet Excel Reports"]
        P5["Enroll & Edit Equipment Records"]
        P6["Decommission / Delete Equipment"]
        P7["Create, Rename & Delete Facility Rooms"]
        P8["Customize Dynamic Database Schema"]
        P9["Manage Institutional Security Passkeys"]
    end

    Staff --> P1
    Staff --> P2
    Staff --> P3
    Staff --> P4
    Staff --> P5

    Admin --> P1
    Admin --> P2
    Admin --> P3
    Admin --> P4
    Admin --> P5
    Admin --> P6
    Admin --> P7
    Admin --> P8
    Admin --> P9

    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef admin fill:#fffbeb,stroke:#b45309,stroke-width:2px,color:#78350f;
    classDef staff fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#14532d;

    class Admin admin;
    class Staff staff;
```

</details>
