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

  const surgeriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'operation_schedules'), where('doctor_id', '==', user.uid));
  }, [firestore, user]);

  const { data: surgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesQuery);
  
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const { data: patients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);
  
  const patientMap = useMemoFirebase(() => {
    if (!patients) return new Map();
    return new Map(patients.map(p => [p.id, p.name]));
  }, [patients]);
  
  const todaySurgeries = surgeries?.filter(s => isToday(new Date(s.date))).sort((a, b) => a.start_time.localeCompare(b.start_time));
  
  const nextOperation = todaySurgeries?.find(s => {
      const now = new Date();
      const [hour, minute] = s.start_time.split(':');
      const startTime = new Date(new Date(s.date).setHours(parseInt(hour), parseInt(minute)));
      return startTime > now && s.status === 'scheduled';
  });

  const pendingTasks = surgeries?.filter(s => s.status !== 'completed' && s.status !== 'cancelled' && new Date(s.date) < new Date()).length || 0;

  const isLoading = isLoadingSurgeries || isLoadingPatients;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Surgeries needing remarks</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{patientMap.size}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
             <p className="text-xs text-muted-foreground">No new alerts</p>
          </CardContent>
        </Card>
      </div>

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
