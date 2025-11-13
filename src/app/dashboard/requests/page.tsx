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
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { SurgeryRequest, Patient, Doctor } from '@/lib/types';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';
import { ScheduleForm } from '@/components/schedule/schedule-form';

export default function RequestsPage() {
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SurgeryRequest | undefined>(undefined);

  const requestsQuery = useMemoFirebase(() => query(collection(firestore, 'surgery_requests'), where('status', '==', 'Pending')), [firestore]);
  const { data: requests, isLoading: isLoadingRequests } = useCollection<SurgeryRequest>(requestsQuery);

  const doctorsCollection = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsCollection);

  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const { data: patients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);

  const doctorMap = useMemo(() => new Map(doctors?.map(d => [d.id, d.name])), [doctors]);
  const patientMap = useMemo(() => new Map(patients?.map(p => [p.id, p.name])), [patients]);

  const processedRequests = useMemo(() => {
    return requests?.map(req => ({
      ...req,
      doctorName: doctorMap.get(req.requesting_doctor_id) || 'Unknown Doctor',
      patientName: patientMap.get(req.patient_id) || 'Unknown Patient'
    })) || [];
  }, [requests, doctorMap, patientMap]);
  
  const isLoading = isLoadingRequests || isLoadingPatients || isLoadingDoctors;

  const handleApprove = (request: SurgeryRequest) => {
    setSelectedRequest(request);
    setIsFormOpen(true);
  };
  
  const handleReject = (request: SurgeryRequest) => {
    const requestRef = doc(firestore, 'surgery_requests', request.id);
    setDocumentNonBlocking(requestRef, { status: 'Rejected' }, { merge: true });
    toast({ variant: 'destructive', title: 'Request Rejected', description: 'The surgery request has been rejected.' });
  };
  
  const getStatusBadgeVariant = (status: SurgeryRequest['status']) => {
    switch (status) {
      case 'Scheduled':
      case 'Approved':
        return 'secondary';
      case 'Rejected':
      case 'Cancelled':
        return 'destructive';
      case 'Pending':
      default:
        return 'default';
    }
  };

  return (
    <>
      <PageHeader
        title="Surgery Requests"
        description="Review and approve incoming surgery requests from doctors."
      />
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>A list of all surgery requests awaiting approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Preferred Date</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={7} className="text-center">Loading requests...</TableCell></TableRow>}
              {!isLoading && processedRequests.map(req => (
                <TableRow key={req.id}>
                  <TableCell>{req.doctorName}</TableCell>
                  <TableCell>{req.patientName}</TableCell>
                  <TableCell className="font-medium">{req.procedure_name}</TableCell>
                  <TableCell>{format(new Date(req.preferred_date), 'PPP')}</TableCell>
                  <TableCell>{req.priority}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleApprove(req)}>Approve & Schedule</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleReject(req)}>Reject Request</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && processedRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No pending surgery requests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedRequest && (
        <ScheduleForm
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            request={selectedRequest}
            doctors={doctors || []}
            patients={patients || []}
        />
      )}
    </>
  );
}
