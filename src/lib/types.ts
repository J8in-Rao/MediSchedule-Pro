export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'doctor';
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
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  case_description: string;
  admitted_on: string; // ISO string
  avatarUrl: string;
};

export type OperationSchedule = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  otId: string;
  date: string; // ISO string
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  procedure: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'In Progress';
  anesthesiaType: string;
  anesthesiologistName: string;
  assistantSurgeon?: string;
  nurses?: string[];
  remarks?: string;
  report_url?: string;
  drugs_used?: string[];
  instruments?: string[];
};

export type OperatingRoom = {
  id: string;
  room_number: string;
  capacity?: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
}

export type Resource = {
  id: string;
  name: string;
  type: 'Drug' | 'Instrument' | 'Material';
  quantity: number;
  in_use: boolean;
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

// This type seems to be a duplicate or old version.
// Keeping OperationSchedule as the primary type for surgeries.
export type Surgery = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string; // ISO string
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  procedure: string;
  room: string; // This corresponds to otId in OperationSchedule
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'In Progress';
  equipment?: string[];
};

export type SupportMessage = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: { seconds: number; nanoseconds: number } | Date;
  status: 'New' | 'Read' | 'Resolved';
};
