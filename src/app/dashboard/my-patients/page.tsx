'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Patient, OperationSchedule } from '@/lib/types';
import { useMemo } from 'react';
import { format } from 'date-fns';

export default function MyPatientsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // 1. Get all operations for the current doctor
  const surgeriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'operation_schedules'), where('doctor_id', '==', user.uid));
  }, [firestore, user]);
  const { data: surgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesQuery);

  // 2. Extract unique patient IDs from those operations
  const patientIds = useMemo(() => {
    if (!surgeries) return [];
    const ids = new Set(surgeries.map(s => s.patient_id));
    return Array.from(ids);
  }, [surgeries]);
  
  // 3. Get all patients
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const { data: allPatients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);

  // 4. Filter all patients to get only the ones assigned to the doctor
  const assignedPatients = useMemo(() => {
    if (!allPatients || patientIds.length === 0) return [];
    return allPatients.filter(p => patientIds.includes(p.id));
  }, [allPatients, patientIds]);

  const isLoading = isLoadingSurgeries || isLoadingPatients;

  return (
    <>
      <PageHeader
        title="My Patients"
        description="A list of all patients assigned to you for operations."
      />
      <Card>
        <CardHeader>
          <CardTitle>Assigned Patients List</CardTitle>
          <CardDescription>Patients you are scheduled to operate on.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Case Description</TableHead>
                <TableHead>Admitted On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6} className="text-center">Loading patients...</TableCell></TableRow>}
              {!isLoading && assignedPatients.map(patient => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell className="max-w-xs truncate">{patient.case_description}</TableCell>
                  <TableCell>{format(new Date(patient.admitted_on), 'PPP')}</TableCell>
                </TableRow>
              ))}
              {!isLoading && assignedPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No patients are currently assigned to you for any operation.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
