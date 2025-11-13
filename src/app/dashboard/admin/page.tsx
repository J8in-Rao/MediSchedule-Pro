'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Activity, CheckCircle, Clock, Users, Hospital, Edit } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

import type { OperationSchedule, Patient, Doctor, OperatingRoom, SurgeryRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScheduleDetails } from '@/components/schedule/schedule-details';
import { ScheduleForm } from '@/components/schedule/schedule-form';
import { Button } from '@/components/ui/button';

/**
 * Renders the main dashboard for the 'admin' role.
 * 
 * This page provides a high-level overview of the day's surgical operations.
 * Key features include:
 * - A calendar for date selection.
 * - Statistics cards showing total, completed, in-progress, and scheduled surgeries for the selected day.
 * - A detailed list of surgeries for the selected day with key information like procedure, patient, doctor, and status.
 * 
 * The component fetches data in real-time from the 'operation_schedules' collection in Firestore
 * based on the selected date.
 */

// Helper function to determine the visual style of the status badge based on the surgery's status.
function getStatusBadgeVariant(status: OperationSchedule['status']) {
  switch (status) {
    case 'completed':
      return 'secondary';
    case 'scheduled':
      return 'default';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function AdminDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<OperationSchedule | null>(null);

  const firestore = useFirestore();

  // Queries for all necessary data collections
  const surgeriesQuery = useMemoFirebase(() => {
    if (!date) return null;
    const dateString = format(date, 'yyyy-MM-dd');
    return query(collection(firestore, 'operation_schedules'), where('date', '==', dateString));
  }, [firestore, date]);
  
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const doctorsCollection = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const otsCollection = useMemoFirebase(() => collection(firestore, 'ot_rooms'), [firestore]);
  const requestsCollection = useMemoFirebase(() => collection(firestore, 'surgery_requests'), [firestore]);


  // Hooks to fetch the data
  const { data: selectedDateSurgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesQuery);
  const { data: patients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsCollection);
  const { data: operatingRooms, isLoading: isLoadingOts } = useCollection<OperatingRoom>(otsCollection);
  const { data: requests, isLoading: isLoadingRequests } = useCollection<SurgeryRequest>(requestsCollection);
  
  // This hook processes the raw surgery data, mapping IDs to human-readable names.
  // It only re-runs when the source data changes, which is efficient.
  const processedSurgeries = useMemo(() => {
    if (!selectedDateSurgeries || !patients || !doctors || !operatingRooms) return [];
    
    const patientMap = new Map(patients.map(p => [p.id, p.name]));
    const doctorMap = new Map(doctors.map(d => [d.id, d.name]));
    const roomMap = new Map(operatingRooms.map(r => [r.id, r.room_number]));

    return selectedDateSurgeries.map(surgery => ({
      ...surgery,
      patientName: patientMap.get(surgery.patient_id) || surgery.patient_id,
      doctorName: doctorMap.get(surgery.doctor_id) || surgery.doctor_id,
      room: `OT-${roomMap.get(surgery.ot_id) || surgery.ot_id}`
    }));
  }, [selectedDateSurgeries, patients, doctors, operatingRooms]);


  // Calculate statistics based on the fetched surgery data.
  const stats = {
    total: selectedDateSurgeries?.length || 0,
    completed: selectedDateSurgeries?.filter((s) => s.status === 'completed').length || 0,
    inProgress: selectedDateSurgeries?.filter((s) => s.status !== 'completed' && s.status !== 'cancelled' && s.status !== 'scheduled').length || 0,
    scheduled: selectedDateSurgeries?.filter((s) => s.status === 'scheduled').length || 0,
  };
  
  const isLoading = isLoadingSurgeries || isLoadingPatients || isLoadingDoctors || isLoadingOts || isLoadingRequests;
  
  const handleViewDetails = (surgery: OperationSchedule) => {
    setSelectedSurgery(surgery);
    setIsDetailsOpen(true);
  };
  
  const handleEdit = (surgery: OperationSchedule) => {
    setSelectedSurgery(surgery);
    setIsDetailsOpen(false); // Close details sheet
    setIsFormOpen(true); // Open form dialog
  };

  const getRequestForSurgery = (surgery: OperationSchedule | null): SurgeryRequest | undefined => {
    if (!surgery || !requests) return undefined;
    // A robust solution would involve storing the `requestId` on the `OperationSchedule` document.
    return requests.find(req => 
      req.status === 'Scheduled' &&
      req.patient_id === surgery.patient_id &&
      req.requesting_doctor_id === surgery.doctor_id &&
      req.procedure_name === surgery.procedure
    );
  }


  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <div className="lg:col-span-3 xl:col-span-5 grid auto-rows-max items-start gap-4">
          {/* Statistics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Link href="/dashboard/schedule">
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Surgeries Today</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/schedule">
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/schedule">
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/schedule">
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.scheduled}</div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Surgeries List for the Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle>Surgeries for {format(date || new Date(), 'MMMM d, yyyy')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading surgeries...</p>
              ) : processedSurgeries && processedSurgeries.length > 0 ? (
                processedSurgeries.map((surgery) => (
                  <div key={surgery.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleViewDetails(surgery)}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-lg">{surgery.procedure}</p>
                        <p className="text-sm text-muted-foreground">Patient: {surgery.patientName}</p>
                        <p className="text-sm text-muted-foreground">Doctor: {surgery.doctorName}</p>
                      </div>
                      <div className="flex items-center flex-wrap justify-end gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4"/>
                              <span>{surgery.start_time} - {surgery.end_time}</span>
                          </div>
                          <div className="font-medium flex items-center gap-2">
                            <Hospital className="w-4 h-4"/>
                            {surgery.room}
                          </div>
                          <Badge variant={getStatusBadgeVariant(surgery.status)}>{surgery.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No surgeries scheduled for this day.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar for Date Selection */}
        <div className="lg:col-span-4 xl:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedSurgery && (
        <ScheduleDetails
            isOpen={isDetailsOpen}
            setIsOpen={setIsDetailsOpen}
            surgery={selectedSurgery}
            onEdit={handleEdit}
        />
      )}
      
      <ScheduleForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          surgery={selectedSurgery || undefined}
          doctors={doctors || []}
          patients={patients || []}
          request={getRequestForSurgery(selectedSurgery)}
      />
    </>
  );
}
