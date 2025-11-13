'use client';
import { PageHeader } from '@/components/shared/page-header';
import { ScheduleTable } from '@/components/schedule/schedule-table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { OperationSchedule, Doctor, Patient, OperatingRoom, SurgeryRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ScheduleForm } from '@/components/schedule/schedule-form';
import { ScheduleDetails } from '@/components/schedule/schedule-details';

export default function SchedulePage() {
  const firestore = useFirestore();
  const surgeriesCollection = useMemoFirebase(() => collection(firestore, 'operation_schedules'), [firestore]);
  const doctorsCollection = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const otsCollection = useMemoFirebase(() => collection(firestore, 'ot_rooms'), [firestore]);
  const requestsCollection = useMemoFirebase(() => collection(firestore, 'surgery_requests'), [firestore]);

  
  const { data: surgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesCollection);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsCollection);
  const { data: patients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);
  const { data: operatingRooms, isLoading: isLoadingOts } = useCollection<OperatingRoom>(otsCollection);
  const { data: requests, isLoading: isLoadingRequests } = useCollection<SurgeryRequest>(requestsCollection);


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<OperationSchedule | null>(null);

  const isLoading = isLoadingSurgeries || isLoadingDoctors || isLoadingPatients || isLoadingOts || isLoadingRequests;
  
  const requestsMap = useMemo(() => {
    if (!requests) return new Map();
    // Assuming a surgery ID might be the same as a request ID if linked.
    // A better approach would be to store requestId on the surgery.
    // For now, let's find a request that matches patient and doctor. This is fragile.
    // A better link is needed. Let's assume request ID is stored on surgery.
    // The current data model does not link them, so we will pass all requests.
    return new Map(requests.map(r => [r.id, r]));
  }, [requests]);


  const handleViewDetails = (surgery: OperationSchedule) => {
    setSelectedSurgery(surgery);
    setIsDetailsOpen(true);
  };
  
  const handleEdit = (surgery: OperationSchedule) => {
    setSelectedSurgery(surgery);
    setIsDetailsOpen(false); // Close details sheet
    setIsFormOpen(true); // Open form dialog
  };

  const handleAddNew = () => {
    setSelectedSurgery(null); // Ensure no surgery is selected for editing
    setIsFormOpen(true);
  }

  // Find the original request if the surgery was scheduled from one.
  // This is a simplified lookup. A direct `requestId` on the surgery would be better.
  const getRequestForSurgery = (surgery: OperationSchedule | null): SurgeryRequest | undefined => {
    if (!surgery || !requests) return undefined;
    // This logic is fragile. It tries to find a request that has been marked 'Scheduled'
    // for the same patient and doctor around the same time.
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
      <PageHeader
        title="OT Schedule Management"
        description="View, create, and manage all operating theater schedules."
      >
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Schedule Operation
        </Button>
      </PageHeader>
      {isLoading ? (
        <p>Loading schedule...</p>
      ) : (
        <>
          <ScheduleTable 
            data={surgeries || []} 
            doctors={doctors || []} 
            patients={patients || []} 
            operatingRooms={operatingRooms || []}
            onViewDetails={handleViewDetails}
          />
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
      )}
    </>
  );
}
