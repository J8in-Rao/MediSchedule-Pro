# Test Cases for Operation Scheduler Application

This document outlines key test cases for the main features of the application to ensure functionality, security, and usability.

## 1. Authentication

| Test Case ID | Feature         | Description                                                                 | Expected Result                                                                    | Status  |
| :----------- | :-------------- | :-------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :------ |
| AUTH-01      | User Login      | A registered user (Admin) attempts to log in with correct credentials.      | Login is successful. User is redirected to the `/dashboard/admin` page.            | `Pass`  |
| AUTH-02      | User Login      | A registered user (Doctor) attempts to log in with correct credentials.     | Login is successful. User is redirected to the `/dashboard/doctor` page.           | `Pass`  |
| AUTH-03      | User Login      | A user attempts to log in with an incorrect password.                       | Login fails. An error toast message is displayed.                                  | `Pass`  |
| AUTH-04      | User Login      | A user attempts to log in with an unregistered email.                       | Login fails. An error toast message is displayed.                                  | `Pass`  |
| AUTH-05      | User Signup     | A new user registers as a "Doctor" with a valid name, email, and password.  | Account is created. User is redirected to the login page.                          | `Pass`  |
| AUTH-06      | Access Control  | An unauthenticated user attempts to access `/dashboard/admin`.              | User is redirected to the login page.                                              | `Pass`  |
| AUTH-07      | Access Control  | A logged-in "Doctor" attempts to access an admin-only page like `/dashboard/staff`. | Access is denied. (Behavior may vary: redirect or shows "Not Found").          | `Pass`  |
| AUTH-08      | Logout          | A logged-in user clicks the "Logout" button.                                | User is logged out and redirected to the login page. A success toast is shown.     | `Pass`  |

## 2. Admin Role Functionality

| Test Case ID | Feature                 | Description                                                                     | Expected Result                                                                    | Status  |
| :----------- | :---------------------- | :------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- | :------ |
| ADMIN-01     | Patient Management      | Admin adds a new patient through the "Add Patient" form with valid data.        | The new patient appears in the patients list. A success toast is shown.            | `Pass`  |
| ADMIN-02     | Patient Management      | Admin edits an existing patient's details.                                      | The patient's information is updated in the list.                                  | `Pass`  |
| ADMIN-03     | Patient Management      | Admin deletes a patient.                                                        | The patient is removed from the list. A confirmation dialog appears before deletion. | `Pass`  |
| ADMIN-04     | Staff Management        | Admin adds a new "Doctor" staff member.                                         | The new doctor appears in the staff list.                                          | `Pass`  |
| ADMIN-05     | Schedule Management     | Admin creates a new surgery schedule from the "Schedule Operation" button.      | The new surgery appears in the schedule table and on the main dashboard calendar.  | `Pass`  |
| ADMIN-06     | Schedule Management     | Admin edits an existing surgery to change its status to "Cancelled".            | The surgery's status badge updates to "Cancelled" with a destructive color.        | `Pass`  |
| ADMIN-07     | Request Approval        | Admin views a "Pending" request and clicks "Approve & Schedule".                | The scheduling form opens, pre-filled with the request details.                    | `Pass`  |
| ADMIN-08     | Request Approval        | After scheduling from a request, check the request's status.                    | The original request in the doctor's "My Requests" view should now show "Scheduled". | `Pass`  |
| ADMIN-09     | Reporting & Analytics   | Admin selects a new date range on the Reports page.                             | All charts on the page update to reflect the data within the selected date range.    | `Pass`  |

## 3. Doctor (User) Role Functionality

| Test Case ID | Feature             | Description                                                                          | Expected Result                                                                    | Status  |
| :----------- | :------------------ | :----------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :------ |
| DOCTOR-01    | View Schedule       | Doctor logs in and views their dashboard.                                            | The "Today's Schedule" card correctly shows only the operations assigned to them.  | `Pass`  |
| DOCTOR-02    | Submit Request      | Doctor fills out and submits a new surgery request form.                             | A success toast is shown. The new request appears in their "My Requests" list.     | `Pass`  |
| DOCTOR-03    | Add Remarks         | Doctor navigates to a past operation and clicks "Add Remarks".                       | A dialog opens. After adding remarks and saving, the surgery status becomes "Completed". | `Pass`  |
| DOCTOR-04    | View Patient Info   | Doctor navigates to "My Patients" and clicks on a patient.                           | A details sheet opens showing the correct patient's demographic information.       | `Pass`  |
| DOCTOR-05    | Profile Update      | Doctor goes to "Settings" and updates their availability and phone number.           | The changes are saved. Upon re-opening the page, the new information is present.   | `Pass`  |
| DOCTOR-06    | Messaging           | Doctor sends a message to the Admin via the "My Messages" page.                      | The message appears in the chat window. The Admin can see the message on their end. | `Pass`  |
