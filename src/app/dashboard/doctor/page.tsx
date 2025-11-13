
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { OperationSchedule, Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, Bell, Check, Clock, ListTodo, User } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useMemo } from 'react';

/**
 * Renders the main dashboard for the 'doctor' role.
 * 
 * This page serves as the landing spot for doctors, providing a quick summary of their day
 * and actionable insights. It includes:
 * - Summary cards for "Next Operation", "Pending Tasks", "Total Patients", and "Alerts".
 * - A detailed schedule for the current day.
 * 
 * Data is fetched from multiple Firestore collections ('operation_schedules', 'patients')
 * and processed on the client to provide relevant, user-specific information.
 */

// Helper to determine the visual style of a status badge.
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

export default function DoctorDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // This query fetches all surgeries assigned to the currently logged-in doctor.
  const surgeriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'operation_schedules'), where('doctor_id', '==', user.uid));
  }, [firestore, user]);

  // These hooks subscribe to the 'operation_schedules' and 'patients' collections in real-time.
  // We need both to display patient names alongside surgery details.
  const { data: surgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesQuery);
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const { data: patients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);
  
  // A map is created to efficiently look up patient names by their ID.
  // This avoids repeatedly searching the patients array.
  const patientMap = useMemo(() => {
    if (!patients) return new Map();
    return new Map(patients.map(p => [p.id, p.name]));
  }, [patients]);
  
  // Filter and sort today's surgeries for display.
  const todaySurgeries = surgeries?.filter(s => isToday(new Date(s.date))).sort((a, b) => a.start_time.localeCompare(b.start_time));
  
  // Logic to find the very next scheduled operation for the "Next Operation" card.
  const nextOperation = todaySurgeries?.find(s => {
      const now = new Date();
      // We parse the time string to create a proper Date object for comparison.
      const [hour, minute] = s.start_time.split(':');
      const startTime = new Date(new Date(s.date).setHours(parseInt(hour), parseInt(minute)));
      return startTime > now && s.status === 'scheduled';
  });

  // This counts past surgeries that are not yet marked as 'completed' or 'cancelled'.
  // This serves as a simple "to-do" list for doctors to add post-op remarks.
  const pendingTasks = surgeries?.filter(s => s.status !== 'completed' && s.status !== 'cancelled' && new Date(s.date) < new Date()).length || 0;
  
  // This correctly calculates the number of unique patients assigned to this doctor.
  // Using a Set ensures we don't double-count patients with multiple surgeries.
  const assignedPatientCount = useMemo(() => {
    if (!surgeries) return 0;
    const patientIds = new Set(surgeries.map(s => s.patient_id));
    return patientIds.size;
  }, [surgeries]);


  const isLoading = isLoadingSurgeries || isLoadingPatients;

  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/operations">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Operation</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <p>Loading...</p> : nextOperation ? (
                <div>
                  <p className="text-lg font-bold">{nextOperation.procedure}</p>
                  <p className="text-xs text-muted-foreground">
                    {patientMap.get(nextOperation.patient_id)} at {nextOperation.start_time}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming operations today.</p>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/operations">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks}</div>
              <p className="text-xs text-muted-foreground">Surgeries needing remarks</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/my-patients">
         <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{assignedPatientCount}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>
        </Link>
        <Link href="/dashboard/my-messages">
         <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Note: Alert functionality is not yet implemented. This is a placeholder. */}
            <div className="text-2xl font-bold">0</div>
             <p className="text-xs text-muted-foreground">No new alerts</p>
          </CardContent>
        </Card>
        </Link>
      </div>

      {/* Today's Schedule Section */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>All your operations for {format(new Date(), 'MMMM d, yyyy')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading your operations...</p>
          ) : todaySurgeries && todaySurgeries.length > 0 ? (
            todaySurgeries.map((surgery) => (
              <div key={surgery.id} className="p-4 rounded-lg border bg-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{surgery.procedure}</p>
                    <p className="text-sm text-muted-foreground">Patient: {patientMap.get(surgery.patient_id)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{surgery.start_time} - {surgery.end_time}</span>
                    </div>
                    {/* Note: OT room number also needs to be fetched from the 'ot_rooms' collection. */}
                    <div className="font-medium">OT-{surgery.ot_id}</div>
                    <Badge variant={getStatusBadgeVariant(surgery.status)}>{surgery.status}</Badge>
                    <Link href="/dashboard/operations">
                        <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">You have no operations scheduled for today.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
