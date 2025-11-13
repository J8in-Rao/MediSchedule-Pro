'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { OperationSchedule, Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { useState, useMemo } from 'react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';

function getStatusBadgeVariant(status: OperationSchedule['status']) {
  switch (status) {
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'scheduled':
    default:
      return 'default';
  }
}

function RemarksDialog({ surgery, patientName }: { surgery: OperationSchedule; patientName: string; }) {
  const [remarks, setRemarks] = useState(surgery.remarks || '');
  const [isOpen, setIsOpen] = useState(false);
  const firestore = useFirestore();

  const handleSave = () => {
    if (!surgery.id) return;
    const surgeryRef = doc(firestore, 'operation_schedules', surgery.id);
    updateDocumentNonBlocking(surgeryRef, { remarks: remarks, status: 'completed' });
    toast({
      title: "Remarks Saved",
      description: "The surgery has been marked as completed.",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Add Remarks</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Post-Surgery Remarks</DialogTitle>
          <DialogDescription>
            Add your notes for the surgery: {surgery.procedure} on {patientName}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea 
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter post-operative notes here..."
            rows={6}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save and Mark as Completed</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default function DoctorOperationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const surgeriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'operation_schedules'), where('doctor_id', '==', user.uid));
  }, [firestore, user]);

  const { data: surgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesQuery);

  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const { data: patients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);
  
  const patientMap = useMemo(() => {
    if (!patients) return new Map();
    return new Map(patients.map(p => [p.id, p.name]));
  }, [patients]);

  const upcomingSurgeries = surgeries?.filter(s => new Date(s.date) >= new Date() && s.status === 'scheduled');
  const pastSurgeries = surgeries?.filter(s => new Date(s.date) < new Date() || s.status !== 'scheduled');
  const isLoading = isLoadingSurgeries || isLoadingPatients;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My Upcoming Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading your operations...</p>
          ) : upcomingSurgeries && upcomingSurgeries.length > 0 ? (
            upcomingSurgeries.map((surgery) => (
              <div key={surgery.id} className="p-4 rounded-lg border bg-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{surgery.procedure}</p>
                    <p className="text-sm text-muted-foreground">Patient: {patientMap.get(surgery.patient_id)}</p>
                    <p className="text-sm font-semibold">{format(new Date(surgery.date), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{surgery.start_time} - {surgery.end_time}</span>
                    </div>
                    <div className="font-medium">OT-{surgery.ot_id}</div>
                    <Badge variant={getStatusBadgeVariant(surgery.status)}>{surgery.status}</Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">You have no upcoming operations.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>My Past Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading past operations...</p>
          ) : pastSurgeries && pastSurgeries.length > 0 ? (
            pastSurgeries.map((surgery) => (
              <div key={surgery.id} className="p-4 rounded-lg border bg-card opacity-70">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{surgery.procedure}</p>
                    <p className="text-sm text-muted-foreground">Patient: {patientMap.get(surgery.patient_id)}</p>
                    <p className="text-sm">{format(new Date(surgery.date), 'MMMM d, yyyy')}</p>
                    {surgery.remarks && <p className="text-xs italic text-muted-foreground pt-2">Your Remarks: "{surgery.remarks}"</p>}
                  </div>
                   <div className="flex flex-col items-end gap-2">
                     <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="font-medium">OT-{surgery.ot_id}</div>
                        <Badge variant={getStatusBadgeVariant(surgery.status)}>{surgery.status}</Badge>
                    </div>
                    {surgery.status !== 'completed' && <RemarksDialog surgery={surgery} patientName={patientMap.get(surgery.patient_id) || 'Unknown'} />}
                   </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">You have no past operations.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
