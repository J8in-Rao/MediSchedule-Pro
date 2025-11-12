'use client';
import { PageHeader } from '@/components/shared/page-header';
import { ScheduleTable } from '@/components/schedule/schedule-table';
import RealTimeAdjustment from '@/components/schedule/real-time-adjustment';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { OperationSchedule, Doctor, Patient } from '@/lib/types';

export default function SchedulePage() {
  const firestore = useFirestore();
  const surgeriesCollection = useMemoFirebase(() => collection(firestore, 'operations'), [firestore]);
  const doctorsCollection = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  
  const { data: surgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesCollection);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsCollection);
  const { data: patients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);

  const isLoading = isLoadingSurgeries || isLoadingDoctors || isLoadingPatients;

  return (
    <>
      <PageHeader
        title="OT Schedule Management"
        description="View, create, and manage all operating theater schedules."
      >
        <RealTimeAdjustment />
      </PageHeader>
      {isLoading ? (
        <p>Loading schedule...</p>
      ) : (
        <ScheduleTable data={surgeries || []} doctors={doctors || []} patients={patients || []} />
      )}
    </>
  );
}

    