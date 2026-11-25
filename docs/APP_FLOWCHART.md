# KM100 Inventory Management System: Architecture & Workflow Diagrams (Landscape Bond Paper)

This document provides light-mode architectural blueprints, role-based access control, and operational lifecycles for the **KM100 Skills and Training Center, Inc.** Property Custody & Inventory Management System.

All diagrams are arranged in a horizontal Left-to-Right (`flowchart LR`) layout specifically proportioned to fit **Landscape Short Bond Paper (Letter: 11" × 8.5")**, rendered as high-resolution PNG images with an **opaque solid pure white background** in [`docs/flowcharts/`](./flowcharts/).

> 🖨️ **Print-Ready Landscape Bond Paper Document**: Open [`docs/KM100_Inventory_Flowcharts_Bondpaper.html`](./KM100_Inventory_Flowcharts_Bondpaper.html) in your browser to print all 5 flowcharts on landscape bond paper or save as a landscape multi-page PDF.

---

## 0. Master System Flowchart (End-to-End Operational Lifecycle)

![Master System Flowchart](./flowcharts/00-master-system-flowchart.png)

> **Export**: [Download / View PNG (00-master-system-flowchart.png)](./flowcharts/00-master-system-flowchart.png) • **Print Layout**: Landscape Bond Paper (11" × 8.5")

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart LR
    subgraph S1["1. Shared Passkey Auth"]
        direction TB
        StartApp([User Launches App]) --> Splash["3D Logo Splash"]
        Splash --> AuthState{"Active Session?"}
        AuthState -->|No| LoginModal["Login / Registration"]
        LoginModal --> PasskeyCheck{"Shared Passkey Valid?"}
        PasskeyCheck -->|Invalid| RejectAuth["Access Denied"]
        RejectAuth --> LoginModal
        PasskeyCheck -->|Valid| RoleChoice{"Select Role"}
        RoleChoice -->|Custodian| CustodianRole["Property Custodian"]
        RoleChoice -->|Instructor| InstructorRole["Training Instructor"]
    end

    subgraph S2["2. Client Engine"]
        direction TB
        CustodianRole --> BootSession["Init Session"]
        InstructorRole --> BootSession
        AuthState -->|Yes| BootSession
        BootSession --> LocalStore["Local Cache (0ms)"]
        LocalStore --> ReactiveState["React Hooks State"]
        ReactiveState --> UIRender["High-Density UI"]
    end

    subgraph S3["3. Facilities & Inventory Ops"]
        direction TB
        UIRender --> FacilityNav["Facility Navigation"]
        FacilityNav --> KPIMetrics["Live KPI Telemetry"]
        KPIMetrics --> SearchFilter["Live Search & Filters"]
        SearchFilter --> TableGrid["Equipment Table Grid"]
        TableGrid --> DirectOps{"Direct Controls"}
        DirectOps -->|Steppers| StepperAdjust["Inline + / - Stock"]
        DirectOps -->|Badges| StatusUpdate["Condition Tagging"]
        DirectOps -->|Enroll| EnrollModal["Add Equipment"]
        DirectOps -->|Delete| DeleteModal["Delete Item (Admin)"]
    end

    subgraph S4["4. Cloud Infrastructure"]
        direction TB
        StepperAdjust --> CloudSync["Supabase PostgreSQL"]
        StatusUpdate --> CloudSync
        EnrollModal --> CloudSync
        DeleteModal --> CloudSync
        CloudSync -->|Realtime CDC| RealtimeSync["WebSocket Push Under 200ms"]
        RealtimeSync --> ReactiveState
        GHA["GitHub Actions Cron"] -->|3-Day Ping| CloudSync
    end

    subgraph S5["5. Governance & Export"]
        direction TB
        TableGrid --> ExportReport{"Document Generation"}
        ExportReport -->|Print Sheet| PrintSheet["Custody Sheet (3 Signatures)"]
        ExportReport -->|Spreadsheet| ExcelExport["Multi-Sheet Excel (.xlsx)"]
        ExportReport -->|Schema| SchemaConfig["Column Customizer (Admin)"]
        ExportReport -->|Security| PasskeyMgmt["Passkey Governance"]
    end

    S1 --> S2 --> S3
    S3 --> S4
    S3 --> S5

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

> **Export**: [Download / View PNG (01-architecture-data-flow.png)](./flowcharts/01-architecture-data-flow.png) • **Print Layout**: Landscape Bond Paper (11" × 8.5")

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart LR
    subgraph Client["Client Application (React + Vite)"]
        direction TB
        UI["Web and Mobile UI (Tailwind CSS)"]
        LocalCache["Local-First Cache (localStorage)"]
        State["Application State (React Hooks)"]

        UI -->|Instant Paint 0ms| LocalCache
        LocalCache -->|Initial State| State
        State -->|Display| UI
    end

    subgraph Supabase["Supabase Cloud Backend"]
        direction TB
        AuthService["Supabase Auth (auth.users)"]
        PostgresDB[("PostgreSQL Database")]
        RealtimeEngine["Realtime CDC Engine (WebSockets)"]

        AuthService -->|Auto-Profile Trigger| PostgresDB
        PostgresDB -->|CDC Streams| RealtimeEngine
    end

    subgraph Automation["Automated Services"]
        direction TB
        GHA["GitHub Actions Cron (Every 3 Days)"]
        GHA -->|REST Keepalive Ping| PostgresDB
    end

    State -->|Async Reconcile and Writes| PostgresDB
    RealtimeEngine -->|Push Changes Under 200ms| State

    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef highlight fill:#fffbeb,stroke:#b45309,stroke-width:2px,color:#78350f;
    class UI,LocalCache,State,AuthService,PostgresDB,RealtimeEngine,GHA default;
```

</details>

---

## 2. Authentication & First-Time Onboarding Flow (Shared Passkey)

> **Access Governance**: Property Custodians (Admin) and Training Instructors (Staff) share the same institutional security passkey. The user selects their organizational role during registration.

![Authentication & First-Time Onboarding Flow](./flowcharts/02-authentication-onboarding-flow.png)

> **Export**: [Download / View PNG (02-authentication-onboarding-flow.png)](./flowcharts/02-authentication-onboarding-flow.png) • **Print Layout**: Landscape Bond Paper (11" × 8.5")

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart LR
    subgraph Step1["1. Application Entry"]
        direction TB
        Start([User Opens App]) --> Splash["3D Logo Splash"]
        Splash --> CheckSession{"Existing Session?"}
    end

    subgraph Step2["2. Authentication Choice"]
        direction TB
        CheckSession -->|No| LoginScreen["Authentication Screen"]
        LoginScreen --> ModeChoice{"User Action"}
        ModeChoice -->|Sign In| EnterCreds["Enter Email and Password"]
        EnterCreds --> VerifyAuth{"Verify Credentials"}
        VerifyAuth -->|Invalid| LoginError["Show Error Banner"]
        LoginError --> LoginScreen
        ModeChoice -->|Register| EnterReg["Enter Info and Shared Passkey"]
        EnterReg --> CheckPasskey{"Valid Shared Passkey?"}
        PasskeyError["Show Passkey Error"]
        CheckPasskey -->|Invalid| PasskeyError
        PasskeyError --> EnterReg
    end

    subgraph Step3["3. Role & Account Creation"]
        direction TB
        CheckPasskey -->|Valid| SelectRole{"Select Role"}
        SelectRole -->|Custodian| CreateAdmin["Create Admin Account"]
        SelectRole -->|Instructor| CreateStaff["Create Staff Account"]
        VerifyAuth -->|Valid| SetSession["Set Active Session"]
    end

    subgraph Step4["4. Onboarding & Facilities"]
        direction TB
        CreateAdmin --> OnboardingTour["8-Step Interactive Tour"]
        CreateStaff --> OnboardingTour
        OnboardingTour --> CompleteTour["Complete or Skip Tour"]
        CompleteTour --> SaveTourDone["Save Tour Flag"]
        SaveTourDone --> NormalDashboard["Master Facilities Dashboard"]
        CheckSession -->|Yes| NormalDashboard
        SetSession --> NormalDashboard
    end

    Step1 --> Step2 --> Step3 --> Step4

    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef amber fill:#fffbeb,stroke:#b45309,stroke-width:1.5px,color:#78350f;
    classDef rose fill:#fff1f2,stroke:#e11d48,stroke-width:1.5px,color:#9f1239;
    classDef emerald fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px,color:#14532d;

    class OnboardingTour,CheckPasskey amber;
    class PasskeyError,LoginError rose;
    class CreateAdmin,CreateStaff,NormalDashboard emerald;
```

</details>

---

## 3. Core Operational Inventory Lifecycle

![Core Operational Inventory Lifecycle](./flowcharts/03-inventory-lifecycle-flow.png)

> **Export**: [Download / View PNG (03-inventory-lifecycle-flow.png)](./flowcharts/03-inventory-lifecycle-flow.png) • **Print Layout**: Landscape Bond Paper (11" × 8.5")

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart LR
    subgraph Stage1["1. Facility Scope & Telemetry"]
        direction TB
        Scope{"Select Scope"}
        Scope -->|All Facilities| MasterOverview["Overview Dashboard"]
        Scope -->|Specific Room| RoomView["Room Inventory View"]

        MasterOverview --> KPICards["Live KPI Telemetry Cards"]
        RoomView --> KPICards
        KPICards --> SearchFilterBar["Live Search & Attribute Filters"]
    end

    subgraph Stage2["2. Equipment Direct Manipulation"]
        direction TB
        SearchFilterBar --> TableGrid["Equipment Table Grid"]
        TableGrid --> ActionChoice{"Perform Operation"}

        ActionChoice -->|Stock Adjust| Steppers["Inline + / - Steppers"]
        ActionChoice -->|Condition| StatusPill["Condition Badges"]
        ActionChoice -->|Enroll| AddModal["Add Item Modal"]
        ActionChoice -->|Modify| EditModal["Edit Item Modal"]
        ActionChoice -->|Decommission| DeleteModal["Delete Dialog (Admin)"]

        Steppers --> CloudSync["Supabase Cloud Sync"]
        StatusPill --> CloudSync
        AddModal --> CloudSync
        EditModal --> CloudSync
        DeleteModal --> CloudSync
    end

    subgraph Stage3["3. Institutional Auditing & Export"]
        direction TB
        TableGrid --> AuditActions{"Compliance Action"}

        AuditActions -->|Formal Print| PrintDialog["Print Custody Sheet (3 Signatures)"]
        AuditActions -->|Multi-Sheet| ExcelEngine["Generate Styled Excel (.xlsx)"]
        AuditActions -->|Custom Fields| SchemaModal["Admin Dynamic Column Schema"]
    end

    Stage1 --> Stage2 --> Stage3

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

> **Export**: [Download / View PNG (04-roles-permission-matrix.png)](./flowcharts/04-roles-permission-matrix.png) • **Print Layout**: Landscape Bond Paper (11" × 8.5")

<details>
<summary>View Mermaid Source Definition</summary>

```mermaid
flowchart LR
    subgraph PasskeyGovernance["Shared Institutional Security"]
        direction TB
        SharedKey["Shared Institutional Passkey (KM100-2026 / 2025)"]
        SharedKey --> RoleAdmin["Property Custodian (Admin)"]
        SharedKey --> RoleStaff["Training Instructor (Staff)"]
    end

    subgraph Tier1["1. Daily Custody Controls (Shared: Admin & Staff)"]
        direction TB
        P1["Inline Stock Audits (+ / - Steppers)"]
        P2["Condition Tagging (Working, Fair, Needs Repair)"]
        P3["Physical Custody Sheet Printing (3-Signature Block)"]
        P4["Export Multi-Sheet Formatted Excel (.xlsx)"]
        P5["Enroll & Edit Equipment Specifications"]
    end

    subgraph Tier2["2. Center Administrative Authority (Admin Exclusive)"]
        direction TB
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
