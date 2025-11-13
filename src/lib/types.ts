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
  case_description: string;
  contact: string;
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
  receiver_id?: string;
  text: string;
  timestamp: { seconds: number; nanoseconds: number } | Date;
  read: boolean;
  type: 'system' | 'manual';
  // Client-side additions
  userName?: string;
  userEmail?: string;
  status?: 'New' | 'Read' | 'Resolved';
  message?: string;
};
