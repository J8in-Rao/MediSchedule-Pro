export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'doctor' | 'patient';
};

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  availability: string[]; // e.g., ["Monday", "Wednesday"]
  avatarUrl: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  preOpInfo: string;
  postOpInfo: string;
  avatarUrl: string;
};

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
  room: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'In Progress';
  equipment: string[];
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
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
  status: 'New' | 'Read' | 'Resolved';
}
