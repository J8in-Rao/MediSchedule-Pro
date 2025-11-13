'use client';

import { useState, useMemo } from 'react';
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import OtUtilizationChart from '@/components/reports/ot-utilization-chart';
import SurgeriesByTypeChart from '@/components/reports/surgeries-by-type-chart';
import SurgeriesPerDoctorChart from '@/components/reports/surgeries-per-doctor-chart';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { OperationSchedule, Doctor, OperatingRoom } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const firestore = useFirestore();
  
  const [startDate, setStartDate] = useState<Date | undefined>(addDays(new Date(), -29));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date && endDate && date > endDate) {
      setEndDate(date); // Clamp end date
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date && startDate && date < startDate) {
      setStartDate(date); // Clamp start date
    }
  };

  const surgeriesCollection = useMemoFirebase(() => collection(firestore, 'operation_schedules'), [firestore]);
  const { data: allSurgeries, isLoading: isLoadingSurgeries } = useCollection<OperationSchedule>(surgeriesCollection);

  const doctorsCollection = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsCollection);

  const otsCollection = useMemoFirebase(() => collection(firestore, 'ot_rooms'), [firestore]);
  const { data: operatingRooms, isLoading: isLoadingOts } = useCollection<OperatingRoom>(otsCollection);

  const isLoading = isLoadingSurgeries || isLoadingDoctors || isLoadingOts;
  
  const filteredSurgeries = useMemo(() => {
    if (!allSurgeries || !startDate) return [];
    
    // Set time to the very start of the from date and very end of the to date
    const fromDate = new Date(startDate.setHours(0, 0, 0, 0));
    const toDate = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : fromDate;

    return allSurgeries.filter(surgery => {
      const surgeryDate = new Date(surgery.date);
      return surgeryDate >= fromDate && surgeryDate <= toDate;
    });
  }, [allSurgeries, startDate, endDate]);

  return (
    <>
      <PageHeader
        title="Reporting & Analytics"
        description="Analyze OT activity, resource utilization, and efficiency with real-time data."
      >
        <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  endDate ? (
                    <>
                      {format(startDate, "LLL dd, y")} -{" "}
                      {format(endDate, "LLL dd, y")}
                    </>
                  ) : (
                    format(startDate, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm font-medium mb-2 text-center">Start Date</p>
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={handleStartDateSelect}
                            initialFocus
                        />
                    </div>
                     <div>
                        <p className="text-sm font-medium mb-2 text-center">End Date</p>
                        <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={handleEndDateSelect}
                            initialFocus
                        />
                    </div>
                </div>
            </PopoverContent>
          </Popover>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>OT Utilization</CardTitle>
            <CardDescription>Number of surgeries performed in each operating theater.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[350px] w-full" /> : <OtUtilizationChart surgeries={filteredSurgeries} operatingRooms={operatingRooms || []} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Surgeries by Type</CardTitle>
            <CardDescription>Distribution of surgeries across different medical specializations.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-[350px] w-full" /> : <SurgeriesByTypeChart surgeries={filteredSurgeries} doctors={doctors || []} />}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Surgeries per Doctor</CardTitle>
            <CardDescription>Total number of surgeries assigned to each doctor.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[350px] w-full" /> : <SurgeriesPerDoctorChart surgeries={filteredSurgeries} doctors={doctors || []} />}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
