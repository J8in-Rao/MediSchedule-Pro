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
import type { Patient, OperationSchedule, SurgeryRequest } from '@/lib/types';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function MyPatientsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // 1. Get all operations for the current doctor
  const surgeriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'operation_schedules'), where('doctor_id', '==', user.uid));
  }, [firestore, user]);
  const { data: surgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesQuery);

  // 2. Get all surgery requests for the current doctor
  const requestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'surgery_requests'), where('requesting_doctor_id', '==', user.uid));
  }, [firestore, user]);
  const { data: requests, isLoading: isLoadingRequests } = useCollection<SurgeryRequest>(requestsQuery);

  // 3. Get all patients
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const { data: allPatients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);

  // 4. Combine patient lists and separate them into current and past
  const { currentPatients, pastPatients } = useMemo(() => {
    if (!surgeries || !allPatients || !requests) return { currentPatients: [], pastPatients: [] };

    const allAssociatedPatientIds = new Set<string>();
    surgeries.forEach(s => allAssociatedPatientIds.add(s.patient_id));
    requests.forEach(r => allAssociatedPatientIds.add(r.patient_id));

    const upcomingOrPendingPatientIds = new Set<string>();
    // Patients with upcoming scheduled operations
    surgeries.forEach(s => {
      const isUpcoming = new Date(s.date) >= new Date() && s.status === 'scheduled';
      if (isUpcoming) {
        upcomingOrPendingPatientIds.add(s.patient_id);
      }
    });
    // Patients with pending or approved (but not yet scheduled) requests
    requests.forEach(r => {
        if (r.status === 'Pending' || r.status === 'Approved') {
            upcomingOrPendingPatientIds.add(r.patient_id);
        }
    });

    const current = allPatients.filter(p => upcomingOrPendingPatientIds.has(p.id));
    // Past patients are those associated with the doctor but not in the upcoming/pending list
    const past = allPatients.filter(p => allAssociatedPatientIds.has(p.id) && !upcomingOrPendingPatientIds.has(p.id));

    return { currentPatients: current, pastPatients: past };
  }, [surgeries, requests, allPatients]);

  const isLoading = isLoadingSurgeries || isLoadingPatients || isLoadingRequests;

  const handlePatientClick = (patient: Patient) => {
    // Placeholder for future patient detail view implementation
    toast({
        title: "Patient Details",
        description: `Showing details for ${patient.name}. (Full page coming soon!)`
    });
  }

  const renderPatientTable = (patients: Patient[], title: string, description: string) => (
     <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Admitted On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading patients...</TableCell></TableRow>}
              {!isLoading && patients.map(patient => (
                <TableRow key={patient.id} onClick={() => handlePatientClick(patient)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>{format(new Date(patient.admitted_on), 'PPP')}</TableCell>
                </TableRow>
              ))}
              {!isLoading && patients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No patients found in this category.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Patients"
        description="A list of all patients assigned to you for operations."
      />
      {renderPatientTable(currentPatients, "Current Patients", "Patients with upcoming operations or pending requests.")}
      {renderPatientTable(pastPatients, "Past Patients", "Patients you have previously operated on.")}
    </div>
  );
}
