'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Activity, CheckCircle, Clock, Users } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

import type { OperationSchedule } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

function getStatusBadgeVariant(status: OperationSchedule['status']) {
  switch (status) {
    case 'Completed':
      return 'secondary';
    case 'In Progress':
      return 'default';
    case 'Cancelled':
      return 'destructive';
    case 'Scheduled':
    default:
      return 'outline';
  }
}

export default function AdminDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const firestore = useFirestore();

  const surgeriesQuery = useMemoFirebase(() => {
    if (!date) return null;
    const dateString = format(date, 'yyyy-MM-dd');
    return query(collection(firestore, 'operations'), where('date', '==', dateString));
  }, [firestore, date]);

  const { data: selectedDateSurgeries, isLoading } = useCollection<OperationSchedule>(surgeriesQuery);

  const stats = {
    total: selectedDateSurgeries?.length || 0,
    completed: selectedDateSurgeries?.filter((s) => s.status === 'Completed').length || 0,
    inProgress: selectedDateSurgeries?.filter((s) => s.status === 'In Progress').length || 0,
    scheduled: selectedDateSurgeries?.filter((s) => s.status === 'Scheduled').length || 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="lg:col-span-5 grid auto-rows-max items-start gap-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Surgeries</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled}</div>
            </CardContent>
          </Card>
        </div>

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
                      <p className="text-sm text-muted-foreground">Patient: {surgery.patientName}</p>
                      <p className="text-sm text-muted-foreground">Doctor: {surgery.doctorName}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4"/>
                            <span>{surgery.startTime} - {surgery.endTime}</span>
                        </div>
                        <div className="font-medium">OT-{surgery.otId}</div>
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

    