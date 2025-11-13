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
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { SurgeryRequest, Patient } from '@/lib/types';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';
import { RequestForm } from '@/components/requests/request-form';
import { RequestDetails } from '@/components/requests/request-details';

export default function MyRequestsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SurgeryRequest | undefined>(undefined);


  const requestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'surgery_requests'), where('requesting_doctor_id', '==', user.uid));
  }, [firestore, user]);

  const { data: requests, isLoading: isLoadingRequests } = useCollection<SurgeryRequest>(requestsQuery);
  
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const { data: patients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);

  const patientMap = useMemo(() => new Map(patients?.map(p => [p.id, p.name])), [patients]);

  const processedRequests = useMemo(() => {
    return requests?.map(req => ({
      ...req,
      patientName: patientMap.get(req.patient_id) || 'Unknown Patient'
    })) || [];
  }, [requests, patientMap]);
  
  const isLoading = isLoadingRequests || isLoadingPatients;

  const handleEdit = (request: SurgeryRequest) => {
    setSelectedRequest(request);
    setIsFormOpen(true);
  };
  
  const handleCancel = (request: SurgeryRequest) => {
    const requestRef = doc(firestore, 'surgery_requests', request.id);
    setDocumentNonBlocking(requestRef, { status: 'Cancelled' }, { merge: true });
    toast({ title: 'Request Cancelled', description: 'The surgery request has been cancelled.' });
  };
  
  const handleViewDetails = (request: SurgeryRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
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
        title="My Requests"
        description="Track the status of your submitted surgery requests."
      />
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>A list of all surgery requests you have submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedure</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Preferred Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading requests...</TableCell></TableRow>}
              {!isLoading && processedRequests.map(req => (
                <TableRow key={req.id} onClick={() => handleViewDetails(req)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{req.procedure_name}</TableCell>
                  <TableCell>{req.patientName}</TableCell>
                  <TableCell>{format(new Date(req.preferred_date), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                     {req.status === 'Pending' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(req)}>Edit Request</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(req)}>Cancel Request</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && processedRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    You have not submitted any surgery requests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <RequestForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        request={selectedRequest}
      />
       {selectedRequest && (
        <RequestDetails
          isOpen={isDetailsOpen}
          setIsOpen={setIsDetailsOpen}
          request={selectedRequest}
        />
       )}
    </>
  );
}
