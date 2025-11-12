'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Surgery } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

function getStatusBadgeVariant(status: Surgery['status']) {
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

export default function PatientDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const surgeriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'surgeries'), where('patientId', '==', user.uid));
  }, [firestore, user]);

  const { data: surgeries, isLoading } = useCollection<Surgery>(surgeriesQuery);

  const upcomingSurgeries = surgeries?.filter(s => new Date(s.date) >= new Date() && s.status === 'Scheduled');
  const pastSurgeries = surgeries?.filter(s => new Date(s.date) < new Date() || s.status !== 'Scheduled');

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading your appointments...</p>
          ) : upcomingSurgeries && upcomingSurgeries.length > 0 ? (
            upcomingSurgeries.map((surgery) => (
              <div key={surgery.id} className="p-4 rounded-lg border bg-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{surgery.procedure}</p>
                    <p className="text-sm text-muted-foreground">with {surgery.doctorName}</p>
                     <p className="text-sm font-semibold">{format(new Date(surgery.date), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4"/>
                          <span>{surgery.startTime} - {surgery.endTime}</span>
                      </div>
                      <div className="font-medium">{surgery.room}</div>
                      <Badge variant={getStatusBadgeVariant(surgery.status)}>{surgery.status}</Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">You have no upcoming appointments.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>My Past Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading past appointments...</p>
          ) : pastSurgeries && pastSurgeries.length > 0 ? (
            pastSurgeries.map((surgery) => (
              <div key={surgery.id} className="p-4 rounded-lg border bg-card opacity-70">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{surgery.procedure}</p>
                    <p className="text-sm text-muted-foreground">with {surgery.doctorName}</p>
                     <p className="text-sm">{format(new Date(surgery.date), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="font-medium">{surgery.room}</div>
                      <Badge variant={getStatusBadgeVariant(surgery.status)}>{surgery.status}</Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">You have no past appointments.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
