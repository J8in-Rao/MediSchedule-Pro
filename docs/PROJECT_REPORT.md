# Project Report: Operation Scheduler For Hospital Management

---

## 1. Introduction & Abstract

In modern healthcare facilities, the efficient scheduling of operating theaters (OTs) is a complex logistical challenge. Manual and static scheduling methods often lead to resource conflicts, underutilization of expensive facilities, and administrative overhead. This project, **"Operation Scheduler For Hospital Management"**, addresses these challenges by providing a dynamic, real-time, and role-based web application for managing surgical schedules.

The system provides separate, secure interfaces for two key roles: **Administrators** and **Doctors**. Administrators gain powerful tools to manage staff, patients, resources, and the master OT schedule, along with analytics to monitor operational efficiency. Doctors are empowered to request surgeries, view their personal schedules, and manage post-operative reporting.

By transforming the static scheduling process into a dynamic and data-driven model, this application aims to improve OT utilization, reduce scheduling conflicts, and enhance communication between medical staff, ultimately contributing to better patient care.

---

## 2. Problem Statement

Surgical scheduling in hospitals presents significant logistical hurdles, especially when assigning doctors to specific operating rooms. The process is complicated by numerous factors, including:

-   **Room Availability**: Ensuring an OT is free and prepared for a specific procedure.
-   **Staff Schedules**: Coordinating with the availability and working hours of surgeons, anesthesiologists, and nurses.
-   **Doctor Preferences**: Accommodating the specific needs or preferences of medical staff where possible.
-   **Operating Room Capabilities**: Matching the required medical equipment and facilities of a procedure to the correct OT.

Traditionally, hospital administrators rely on static schedules and perform manual adjustments to handle changes, which is inefficient and prone to error. This project focuses on converting this rigid system into a flexible, dynamic model. This model is designed to integrate multiple hospital scenarios, using real-time data to automate and streamline the scheduling process. Through the system's booking mechanism, a surgical room is assigned, and the operation time is confirmed, creating a single source of truth for all OT activities.

---

## 3. System Architecture

The application is architected as a modern, full-stack web application utilizing the **Next.js framework** and **Firebase** for backend services. This architecture is designed for scalability, real-time functionality, and a seamless user experience.

-   **Client-Side (Frontend)**:
    -   Built with **React** and **TypeScript**, ensuring a type-safe, component-based, and maintainable user interface.
    -   The **Next.js App Router** is used for optimized performance, leveraging Server-Side Rendering (SSR) for fast initial page loads and client-side navigation for a smooth user experience.
    -   Styling is handled by **Tailwind CSS** with a consistent design system provided by **ShadCN UI** components.

-   **Backend Services (Firebase)**:
    -   **Firebase Authentication**: Securely manages user identities, providing email/password login and enabling role-based access control.
    -   **Firebase Firestore**: A NoSQL, real-time database serves as the central data store for all application data, including users, doctors, patients, schedules, and logs. Real-time listeners ensure the UI is always synchronized with the latest data.
    -   **Firebase Security Rules**: These rules act as the server-side logic, defining granular access permissions to protect data. They ensure that users can only access and modify data according to their assigned role (e.g., a doctor can only manage their own profile, while an admin can manage all records).

-   **Hosting & Deployment**:
    -   The application is configured for deployment on **Firebase App Hosting**, a serverless platform that provides a global CDN, automatic scaling, and seamless integration with the Firebase backend.

For a more detailed breakdown, please refer to the `docs/DESIGN.md` document.

---

## 4. System Modules & Features

The application is divided into two primary modules based on user roles:

### 4.1 Admin Module

-   **Secure Login**: A dedicated, secure login portal for administrators.
-   **Comprehensive Dashboard**: An overview of the day's surgical activities, including total surgeries, and a real-time calendar view of scheduled operations.
-   **Schedule Management**: An interface to create, view, edit, and cancel surgery schedules. This includes assigning doctors, patients, OTs, and specifying procedure details.
-   **Staff Management**: Full CRUD (Create, Read, Update, Delete) functionality for managing doctor and admin accounts.
-   **Patient Management**: Full CRUD functionality for patient demographic records.
-   **OT & Resource Management**: Interfaces to manage Operating Theaters and medical resources (drugs, instruments).
-   **Request Approval**: A queue to review, approve, and schedule surgery requests submitted by doctors.
-   **Reporting & Analytics**: A dedicated page to visualize OT utilization, surgeries per doctor, and distribution of surgery types over custom date ranges.
-   **Messaging**: A centralized inbox to review and respond to messages from doctors.

### 4.2 User (Doctor) Module

-   **Secure Registration & Login**: Doctors can register for an account and log in securely.
-   **Personalized Dashboard**: A dashboard showing a doctor's personal schedule, next operation, and key alerts.
-   **Surgery Requests**: A form to submit detailed requests for new surgeries, which are then sent to administrators for approval.
-   **View Schedules**: Doctors can view their own upcoming and past operations, add post-operative remarks, and see patient details.
-   **Profile Management**: A settings page for doctors to manage their professional information, including availability and contact details.
-   **Communication**: A dedicated page for sending and receiving messages directly with the administrative team.

---

## 5. Technology Stack

-   **Framework**: Next.js (v15+)
-   **Language**: TypeScript
-   **Database**: Firebase Firestore
-   **Authentication**: Firebase Authentication
-   **Styling**: Tailwind CSS
-   **UI Components**: ShadCN UI
-   **Deployment**: Firebase App Hosting

---

## 6. Code & Quality Strategy

The project adheres to modern software development principles to ensure a high-quality, robust application.

-   **Modular**: The codebase is organized by feature and role within the Next.js App Router. Reusable components, hooks, and services are used throughout to promote code reuse and separation of concerns.
-   **Safe**: TypeScript is used for static type-checking, reducing runtime errors. Firebase Security Rules provide server-side enforcement of data access policies, preventing unauthorized data manipulation.
-   **Testable**: The modular structure allows for individual components and hooks to be tested in isolation. A formal test case document (`docs/TEST_CASES.md`) has been created to guide quality assurance.
-   **Maintainable**: Following Next.js best practices and using a consistent coding style makes the codebase easy to understand and extend. The `README.md` and `DESIGN.md` documents provide comprehensive guidance for future developers.
-   **Portable**: As a web application built with standard technologies, it runs consistently across all modern web browsers and operating systems.

---

## 7. Logging and Auditing

A dedicated logging system has been implemented as required. Every critical action performed by a user is recorded in a `logs` collection in Firestore. This creates an immutable audit trail for security and monitoring purposes.

-   **Logged Actions Include**: User Login (Success/Failure), Patient Management (Create/Update), Staff Management (Create/Update), Schedule Management (Create/Update), and Surgery Request actions.
-   **Log Details**: Each log entry includes the action performed, the user who performed it (ID and email), a timestamp, and contextual details of the event.

---

## 8. Conclusion

The **"Operation Scheduler For Hospital Management"** project successfully meets all core requirements. It provides a complete, secure, and user-friendly platform for managing the complexities of surgical scheduling. The technical architecture is modern and scalable, and the feature set directly addresses the pain points outlined in the problem statement. With comprehensive documentation and a robust implementation, the project is ready for deployment and final evaluation.