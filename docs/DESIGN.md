# Solution Design & System Architecture Document

This document outlines the Low-Level Design (LLD) and System Architecture for the **Operation Scheduler For Hospital Management** application.

## 1. System Architecture

The application is designed as a modern, full-stack web application leveraging the **Next.js framework** on the frontend and **Firebase** as the backend-as-a-service (BaaS).

### Architectural Diagram (Conceptual)

```
[ User (Browser) ]
       |
       | HTTPS (React/Next.js)
       v
[ Next.js Frontend on Firebase App Hosting ]
       |
       | Firebase SDK (Secure API Calls)
       v
+-----------------------+      +--------------------------+
| Firebase              |      | Firebase                 |
| Authentication        |----->| Firestore Security Rules |
| (Handles Login/Roles) |      | (Enforces Access)        |
+-----------------------+      +--------------------------+
                                       |
                                       |
                                       v
                             +---------------------+
                             | Firestore Database  |
                             | (Collections: users,|
                             |  doctors, schedules)|
                             +---------------------+
```

- **Client-Side**: The UI is built with **React** and **TypeScript**, running in the user's browser. Next.js App Router is used for server-side rendering (for fast initial loads) and client-side navigation.
- **Backend Services**: Firebase provides all backend functionality.
  - **Firebase Authentication**: Securely manages user identities, passwords, and sessions.
  - **Firestore**: A NoSQL, document-based database stores all application data. Real-time listeners are used extensively to ensure the UI is always synchronized with the database state.
  - **Firebase Security Rules**: These rules are the "server-side" logic that protects the data. They define who can read, write, update, or delete specific documents, ensuring, for example, that a doctor can only view their own patient data, while an admin can manage all records.
- **Hosting**: The entire application is deployed on **Firebase App Hosting**, a serverless platform that provides global CDN, automatic scaling, and seamless integration with the Firebase backend.

---

## 2. Low-Level Design (LLD)

### 2.1 Data Models (Firestore Collections)

The database schema is defined in `docs/backend.json` and enforced by Firebase Security Rules.

- `/users/{userId}`: Stores basic user information, including `email` and `role` (`admin` or `doctor`). This document is critical for access control.
- `/doctors/{doctorId}`: Stores detailed professional profiles for users with the 'doctor' role, including `specialization`, `availability`, and `phone`. The ID matches the `userId`.
- `/patients/{patientId}`: Stores all patient demographic information.
- `/operation_schedules/{operationId}`: The core collection for all scheduled surgeries. It links patients, doctors, and OTs, and contains all details like `date`, `procedure`, `status`, etc.
- `/surgery_requests/{requestId}`: Stores requests submitted by doctors before they are approved and converted into a schedule.
- `/ot_rooms/{otId}`: Manages the list of available Operating Theaters.
- `/resources/{resourceId}`: Manages medical resources like drugs and instruments.
- `/messages/{messageId}`: Stores communication between users (e.g., doctor-to-admin).
- `/logs/{logId}`: A collection for audit trails, storing records of important actions performed by users.

### 2.2 Frontend Component Structure

The UI is built with a modular, component-based architecture located in `src/components/`.

- **`layout/`**: Contains the main application shell, including the `Header` and `SidebarNav`. It handles the primary navigation structure.
- **`auth/`**: Includes the `LoginForm` and `SignupForm` used on the public-facing pages.
- **`dashboard/`**: Contains pages and components specific to the logged-in experience (e.g., `AdminDashboardPage`, `DoctorDashboardPage`).
- **Feature-Specific Components**:
  - `schedule/`: Components for managing schedules (`ScheduleTable`, `ScheduleForm`, `ScheduleDetails`).
  - `patients/`: Components for managing patients (`PatientForm`, `PatientDetails`).
  - `staff/`: Components for managing staff (`StaffForm`).
  - `reports/`: Components for displaying analytics charts (`OtUtilizationChart`, etc.).
- **`ui/`**: Contains the base UI elements from **ShadCN UI** (e.g., `Button`, `Card`, `Input`), providing a consistent design system.
- **`shared/`**: Contains components used across multiple pages, like `PageHeader`.

### 2.3 Key Workflows & Logic

- **Authentication Flow**:
  1. A user signs up or logs in via the UI.
  2. `firebase/auth` handles the request.
  3. On success, `onAuthStateChanged` listener in `FirebaseProvider` updates the user state globally.
  4. A redirect page (`/dashboard`) reads the user's role from their `/users/{userId}` document and sends them to the correct dashboard (`/dashboard/admin` or `/dashboard/doctor`).
- **Data Fetching**:
  1. UI components use custom hooks like `useCollection` and `useDoc` (`src/firebase/firestore/`).
  2. These hooks establish real-time `onSnapshot` listeners to the relevant Firestore collection.
  3. When data changes in Firestore, the hook's state updates, causing the component to re-render with fresh data automatically. This makes the application highly reactive.
- **Data Mutation (CUD)**:
  1. User fills out a form (e.g., `ScheduleForm`).
  2. On submit, a "non-blocking" update function (e.g., `addDocumentNonBlocking`) is called.
  3. This function immediately sends the write request to Firestore and returns, allowing the UI to remain responsive. It does not wait for the database write to complete.
  4. The corresponding `logAction` function is called to record the activity.
