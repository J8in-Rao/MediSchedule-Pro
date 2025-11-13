'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import OtUtilizationChart from '@/components/reports/ot-utilization-chart';
import SurgeriesByTypeChart from '@/components/reports/surgeries-by-type-chart';
import SurgeriesPerDoctorChart from '@/components/reports/surgeries-per-doctor-chart';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { OperationSchedule, Doctor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsPage() {
  const firestore = useFirestore();

  // Fetching data for the reports. It's important that these collection paths match our Firestore database structure.
  // BUG FIX: Changed 'operations' to 'operation_schedules' to match the actual collection name in Firestore.
  const surgeriesCollection = useMemoFirebase(() => collection(firestore, 'operation_schedules'), [firestore]);
  const { data: surgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesCollection);

  const doctorsCollection = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsCollection);

  const isLoading = isLoadingSurgeries || isLoadingDoctors;

  return (
    <>
      <PageHeader
        title="Reporting & Analytics"
        description="Analyze OT activity, resource utilization, and efficiency with real-time data."
      />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>OT Utilization</CardTitle>
            <CardDescription>Number of surgeries performed in each operating theater.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* The loading state is handled here to show a skeleton UI, improving user experience. */}
            {isLoading ? <Skeleton className="h-[350px] w-full" /> : <OtUtilizationChart surgeries={surgeries || []} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Surgeries by Type</CardTitle>
            <CardDescription>Distribution of surgeries across different medical specializations.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-[350px] w-full" /> : <SurgeriesByTypeChart surgeries={surgeries || []} doctors={doctors || []} />}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Surgeries per Doctor</CardTitle>
            <CardDescription>Total number of surgeries assigned to each doctor.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h--[350px] w-full" /> : <SurgeriesPerDoctorChart surgeries={surgeries || []} />}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
