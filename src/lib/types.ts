import { type FirebaseApp } from 'firebase/app';
import { type Auth as FirebaseAuth, type User as FirebaseUser } from 'firebase/auth';
import { type Firestore as FirebaseFirestore } from 'firebase/firestore';

export type App = FirebaseApp;
export type Auth = FirebaseAuth;
export type User = FirebaseUser;
export type Firestore = FirebaseFirestore;


export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'doctor';
  created_at: { seconds: number; nanoseconds: number } | Date;
  isActive: boolean;
};

export type Doctor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  shift_hours: string;
  availability: string[];
  avatarUrl: string;
  verified: boolean;
  created_at: { seconds: number; nanoseconds: number } | Date;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact?: string;
  admitted_on: string; // ISO string
  created_by: string; // Admin UID
  created_at: { seconds: number; nanoseconds: number } | Date;
};

export type OperationSchedule = {
  id: string;
  patient_id: string;
  doctor_id: string;
  ot_id: string;
  date: string; // ISO string
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  procedure: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  anesthesia_type: string;
  anesthesiologist: string;
  assistant_surgeon?: string;
  nurses?: string[];
  remarks?: string;
  report_url?: string;
  drugs_used?: string[];
  instruments?: string[];
  created_by: string; // Admin UID
  created_at: { seconds: number; nanoseconds: number } | Date;
  updated_at: { seconds: number; nanoseconds: number } | Date;

  // These are added on the client-side for display
  patientName?: string;
  doctorName?: string;
};

export type SurgeryRequest = {
  id: string;
  requesting_doctor_id: string;
  patient_id: string;
  procedure_name: string;
  diagnosis: string;
  preferred_date: string; // ISO string
  expected_duration: string;
  anesthesia_type: string;
  priority: 'Routine' | 'Semi-urgent' | 'Urgent' | 'Emergency';
  assistant_surgeon?: string;
  anesthesiologist?: string;
  nurses_needed?: string;
  required_instruments?: string;
  required_drugs?: string;
  uploads_url?: string;
  additional_notes?: string;
  status: 'Pending' | 'Approved' | 'Scheduled' | 'Rejected' | 'Cancelled';
  created_at: { seconds: number; nanoseconds: number } | Date;
  updated_at: { seconds: number; nanoseconds: number } | Date;

  // Client-side additions
  patientName?: string;
  doctorName?: string;
};


export type OperatingRoom = {
  id: string;
  room_number: string;
  capacity?: number;
  status: 'available' | 'in-use';
  equipment?: string[];
  created_at: { seconds: number; nanoseconds: number } | Date;
}

export type Resource = {
  id: string;
  name: string;
  type: 'drug' | 'instrument' | 'material';
  quantity: number;
  unit?: string;
  in_use: boolean;
  last_used: { seconds: number; nanoseconds: number } | Date;
  created_at: { seconds: number; nanoseconds: number } | Date;
};


export type OtUtilization = {
  month: string;
  'OT 1': number;
  'OT 2': number;
  'OT 3': number;
};

export type SurgeryByType = {
  type: string;
  count: number;
  fill: string;
};

export type SupportMessage = {
    id: string;
    sender_id: string;
    receiver_id: string;
    text: string;
    timestamp: { seconds: number, nanoseconds: number } | Date;
    read: boolean;
    type: 'system' | 'manual';
};

// This type was for the support contact form, keeping it separate
export type ContactMessage = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: { seconds: number, nanoseconds: number } | Date;
  status: 'New' | 'Read' | 'Resolved';
}
