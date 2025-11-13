'use client';
import { PageHeader } from '@/components/shared/page-header';
import { ScheduleTable } from '@/components/schedule/schedule-table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { OperationSchedule, Doctor, Patient, OperatingRoom } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { ScheduleForm } from '@/components/schedule/schedule-form';

export default function SchedulePage() {
  const firestore = useFirestore();
  const surgeriesCollection = useMemoFirebase(() => collection(firestore, 'operation_schedules'), [firestore]);
  const doctorsCollection = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const otsCollection = useMemoFirebase(() => collection(firestore, 'ot_rooms'), [firestore]);
  
  const { data: surgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesCollection);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsCollection);
  const { data: patients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);
  const { data: operatingRooms, isLoading: isLoadingOts } = useCollection<OperatingRoom>(otsCollection);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const isLoading = isLoadingSurgeries || isLoadingDoctors || isLoadingPatients || isLoadingOts;

  return (
    <>
      <PageHeader
        title="OT Schedule Management"
        description="View, create, and manage all operating theater schedules."
      >
        <Button onClick={() => setIsFormOpen(true)}>
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
            onAdd={() => setIsFormOpen(true)}
          />
          <ScheduleForm
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            doctors={doctors || []}
            patients={patients || []}
          />
        </>
      )}
    </>
  );
}
