# Operation Scheduler For Hospital Management

"MediSchedule Pro" is an advanced operating theater (OT) scheduling and management application designed for modern healthcare facilities. It addresses the logistical challenges of surgical scheduling by providing a dynamic, real-time system for administrators and doctors.

This project transforms the static, manual process of scheduling into a workable model that integrates multiple hospital scenarios, such as room availability, doctor schedules, and operating room capabilities.

## Tech Stack

- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI

---

## Features

### Admin Role

- **Secure Login**: Admins have a secure login portal.
- **Dashboard**: A comprehensive overview of the day's surgical activities, including total surgeries, completed, in-progress, and scheduled operations.
- **Schedule Management**: A powerful interface to create, view, edit, and cancel surgery schedules. This includes assigning doctors, patients, and OTs, and specifying times, procedures, and required resources.
- **Staff Management**: Full CRUD (Create, Read, Update, Delete) functionality for managing doctor and admin accounts, including their profiles, specializations, and availability.
- **Patient Management**: Full CRUD functionality for patient demographic records.
- **OT & Resource Management**: Interfaces to manage Operating Theaters and medical resources (drugs, instruments).
- **Reporting & Analytics**: A dedicated analytics page to visualize OT utilization, surgeries per doctor, and distribution of surgery types over custom date ranges.
- **Messaging**: A centralized inbox to review and respond to messages from doctors.

### Doctor (User) Role

- **Secure Registration & Login**: Doctors can register for an account and log in securely.
- **Personalized Dashboard**: A dashboard showing a doctor's personal schedule for the day, their next operation, pending tasks (like adding post-op remarks), and unread alert counts.
- **Surgery Requests**: Doctors can submit detailed requests for new surgeries, which are then sent to administrators for approval and scheduling.
- **View Schedules**: Doctors can view their own upcoming and past operations, add post-operative remarks, and see patient details.
- **Profile Management**: Doctors can manage their own professional information, including availability and contact details, via a settings page.
- **Communication**: A dedicated page for sending and receiving messages directly with the administrative team.

---

## System Architecture

The application follows a modern, server-enhanced web architecture using the Next.js App Router.

- **Frontend**: Built with **React** and **TypeScript**, ensuring a type-safe, component-based, and maintainable user interface. **ShadCN UI** and **Tailwind CSS** are used for a modern, responsive design system.
- **Backend/Database**: **Firebase** serves as the backend-as-a-service (BaaS).
    - **Firebase Firestore**: A NoSQL, real-time database is used to store all application data (users, doctors, patients, schedules, etc.). Real-time listeners ensure the UI is always up-to-date.
    - **Firebase Authentication**: Manages all user authentication, providing secure email/password login and role-based access.
- **Hosting**: The application is configured for deployment on **Firebase App Hosting**, a scalable, serverless platform that integrates seamlessly with the Firebase backend.
- **Modularity**: The code is organized by feature and role, with reusable components, services (e.g., logging), and hooks, making it highly modular and testable.

---

## Getting Started & Workflow

### Prerequisites
- Node.js
- npm / yarn / pnpm

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:9002](http://localhost:9002) in your browser.

### Application Workflow

1.  **Registration**: A new user (typically a Doctor) visits the `/signup` page, fills in their details (name, email, specialization), and creates an account. An Admin can also create new staff accounts from their dashboard.
2.  **Login**: Users log in through the main page. Based on their role ('admin' or 'doctor'), they are redirected to the appropriate dashboard.
3.  **Surgery Request (Doctor)**: A doctor can navigate to "Request Surgery", fill out a detailed form specifying the patient, procedure, priority, etc., and submit it. This request now appears in the Admin's "Requests" queue.
4.  **Scheduling (Admin)**: An admin reviews the pending surgery request. They approve it by clicking "Approve & Schedule," which opens a form pre-filled with the doctor's requested details. The admin assigns an available OT, confirms the time, and saves the schedule. The request is marked as "Scheduled", and the operation appears on all relevant calendars.
5.  **Operation Day (Admin & Doctor)**: Both the admin and the assigned doctor can see the surgery on their dashboards for the current day.
6.  **Post-Operation (Doctor)**: After the surgery, the doctor navigates to their "Past Operations" view and adds post-operative remarks, which automatically marks the surgery as "Completed".
7.  **Analysis (Admin)**: The admin can visit the "Reports" page at any time to analyze data on OT utilization, doctor workload, and more, helping to identify bottlenecks and improve efficiency.
