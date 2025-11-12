import type { Doctor, Patient, Surgery, OtUtilization, SurgeryByType } from './types';

export const doctors: Doctor[] = [
  { id: 'doc1', name: 'Dr. John Smith', specialization: 'Cardiology', availability: ['Mon', 'Wed', 'Fri'], avatarUrl: 'https://picsum.photos/seed/doc1/100/100' },
  { id: 'doc2', name: 'Dr. Emily White', specialization: 'Neurology', availability: ['Tue', 'Thu'], avatarUrl: 'https://picsum.photos/seed/doc2/100/100' },
  { id: 'doc3', name: 'Dr. Michael Brown', specialization: 'Orthopedics', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], avatarUrl: 'https://picsum.photos/seed/doc3/100/100' },
  { id: 'doc4', name: 'Dr. Sarah Jones', specialization: 'General Surgery', availability: ['Mon', 'Wed', 'Fri'], avatarUrl: 'https://picsum.photos/seed/doc4/100/100' },
];

export const patients: Patient[] = [
  { id: 'pat1', name: 'Alice Johnson', age: 45, gender: 'Female', preOpInfo: 'Hypertension, stable.', postOpInfo: 'Post-op recovery smooth.', avatarUrl: 'https://picsum.photos/seed/pat1/100/100' },
  { id: 'pat2', name: 'Bob Williams', age: 62, gender: 'Male', preOpInfo: 'Diabetes, controlled.', postOpInfo: 'Awaiting discharge.', avatarUrl: 'https://picsum.photos/seed/pat2/100/100' },
  { id: 'pat3', name: 'Charlie Davis', age: 33, gender: 'Male', preOpInfo: 'No major comorbidities.', postOpInfo: 'Monitoring vitals.', avatarUrl: 'https://picsum.photos/seed/pat3/100/100' },
  { id: 'pat4', name: 'Diana Miller', age: 58, gender: 'Female', preOpInfo: 'Allergic to penicillin.', postOpInfo: 'Pain managed effectively.', avatarUrl: 'https://picsum.photos/seed/pat4/100/100' },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

export const surgeries: Surgery[] = [
  { 
    id: 'sur1', 
    patientId: 'pat1',
    patientName: 'Alice Johnson',
    doctorId: 'doc1', 
    doctorName: 'Dr. John Smith',
    date: today.toISOString().split('T')[0], 
    startTime: '09:00', 
    endTime: '11:00', 
    procedure: 'Coronary Artery Bypass',
    room: 'OT 1',
    status: 'In Progress',
    equipment: ['Heart-lung machine', 'Electrocautery']
  },
  { 
    id: 'sur2', 
    patientId: 'pat2',
    patientName: 'Bob Williams',
    doctorId: 'doc2', 
    doctorName: 'Dr. Emily White',
    date: today.toISOString().split('T')[0], 
    startTime: '11:30', 
    endTime: '13:00', 
    procedure: 'Craniotomy',
    room: 'OT 2',
    status: 'Scheduled',
    equipment: ['Surgical drill', 'Microscope']
  },
  { 
    id: 'sur3', 
    patientId: 'pat3',
    patientName: 'Charlie Davis',
    doctorId: 'doc3', 
    doctorName: 'Dr. Michael Brown',
    date: today.toISOString().split('T')[0], 
    startTime: '14:00', 
    endTime: '16:30', 
    procedure: 'Knee Replacement',
    room: 'OT 3',
    status: 'Scheduled',
    equipment: ['Orthopedic implants', 'Bone cement']
  },
  { 
    id: 'sur4', 
    patientId: 'pat4',
    patientName: 'Diana Miller',
    doctorId: 'doc4', 
    doctorName: 'Dr. Sarah Jones',
    date: tomorrow.toISOString().split('T')[0], 
    startTime: '10:00', 
    endTime: '12:00', 
    procedure: 'Appendectomy',
    room: 'OT 1',
    status: 'Scheduled',
    equipment: ['Laparoscopic tower']
  },
    { 
    id: 'sur5', 
    patientId: 'pat1',
    patientName: 'Alice Johnson',
    doctorId: 'doc3', 
    doctorName: 'Dr. Michael Brown',
    date: yesterday.toISOString().split('T')[0], 
    startTime: '09:00', 
    endTime: '11:00', 
    procedure: 'Hip Arthroscopy',
    room: 'OT 2',
    status: 'Completed',
    equipment: ['Arthroscope']
  },
];

export const otUtilizationData: OtUtilization[] = [
  { month: 'Jan', 'OT 1': 80, 'OT 2': 75, 'OT 3': 60 },
  { month: 'Feb', 'OT 1': 85, 'OT 2': 80, 'OT 3': 70 },
  { month: 'Mar', 'OT 1': 90, 'OT 2': 85, 'OT 3': 75 },
  { month: 'Apr', 'OT 1': 88, 'OT 2': 82, 'OT 3': 68 },
  { month: 'May', 'OT 1': 92, 'OT 2': 88, 'OT 3': 80 },
  { month: 'Jun', 'OT 1': 95, 'OT 2': 90, 'OT 3': 85 },
];

export const surgeryByTpeData: SurgeryByType[] = [
  { type: 'Cardiology', count: 45, fill: 'var(--color-chart-1)' },
  { type: 'Neurology', count: 30, fill: 'var(--color-chart-2)' },
  { type: 'Orthopedics', count: 60, fill: 'var(--color-chart-3)' },
  { type: 'General', count: 55, fill: 'var(--color-chart-4)' },
  { type: 'Other', count: 25, fill: 'var(--color-chart-5)' },
];
