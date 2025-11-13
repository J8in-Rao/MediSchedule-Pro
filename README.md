# MediSchedule Pro

This is a Next.js application, "MediSchedule Pro," built with Firebase Studio. It's an advanced operating theater (OT) scheduling and management application designed for modern healthcare facilities.

## Features

*   **Firebase Integration**: Utilizes Firebase Authentication for secure user sign-in and Firestore for a real-time database.
*   **Role-Based Access Control**: Separate dashboards and navigation for "Admin" and "Doctor" roles, ensuring users only see relevant information.
    *   **Admin Dashboard**: A comprehensive view for managing schedules, patients, and doctors, with reporting and analytics.
    *   **Doctor Dashboard**: A simplified view for doctors to see their schedule, manage surgery requests, and communicate.
*   **Real-time Schedule Management**: Create, edit, and view surgery schedules in real-time.
*   **Modern Tech Stack**: Built with the Next.js App Router, React, TypeScript, ShadCN UI components, and Tailwind CSS for a responsive and modern user interface.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

You can start by creating a new account on the signup page. Choose either the "Admin" or "Doctor" role to see the corresponding dashboard experience.
