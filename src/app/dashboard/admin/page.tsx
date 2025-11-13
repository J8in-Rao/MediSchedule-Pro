'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Activity, CheckCircle, Clock, Users } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

import type { OperationSchedule } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

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
  const firestore = useFirestore();

  // This query fetches surgeries from Firestore that match the selected date.
  // It's memoized with useMemoFirebase to prevent unnecessary re-fetches on re-renders,
  // which is critical for performance and cost management with Firestore.
  const surgeriesQuery = useMemoFirebase(() => {
    if (!date) return null;
    const dateString = format(date, 'yyyy-MM-dd');
    // The query filters the 'operation_schedules' collection where the 'date' field equals our formatted date string.
    return query(collection(firestore, 'operation_schedules'), where('date', '==', dateString));
  }, [firestore, date]);

  // The useCollection hook subscribes to the query in real-time.
  const { data: selectedDateSurgeries, isLoading } = useCollection<OperationSchedule>(surgeriesQuery);

  // We calculate the statistics based on the fetched surgery data.
  // This is derived from the state, so it will automatically update when the data changes.
  const stats = {
    total: selectedDateSurgeries?.length || 0,
    completed: selectedDateSurgeries?.filter((s) => s.status === 'completed').length || 0,
    inProgress: selectedDateSurgeries?.filter((s) => s.status !== 'completed' && s.status !== 'cancelled' && s.status !== 'scheduled').length || 0,
    scheduled: selectedDateSurgeries?.filter((s) => s.status === 'scheduled').length || 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="lg:col-span-5 grid auto-rows-max items-start gap-4">
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
            ) : selectedDateSurgeries && selectedDateSurgeries.length > 0 ? (
              selectedDateSurgeries.map((surgery) => (
                <div key={surgery.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-lg">{surgery.procedure}</p>
                      <p className="text-sm text-muted-foreground">Patient: {surgery.patientName || surgery.patient_id}</p>
                      <p className="text-sm text-muted-foreground">Doctor: {surgery.doctorName || surgery.doctor_id}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4"/>
                            <span>{surgery.start_time} - {surgery.end_time}</span>
                        </div>
                         {/* Note: OT room number also needs to be fetched from a separate collection. */}
                        <div className="font-medium">OT-{surgery.ot_id}</div>
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
      <div className="lg:col-span-2 space-y-4">
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
  );
}
