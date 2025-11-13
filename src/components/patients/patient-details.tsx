'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '../ui/separator';
import { Patient } from '@/lib/types';
import { format } from 'date-fns';

type PatientDetailsProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  patient: Patient | null;
};

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <div className="text-base font-semibold">{value || 'N/A'}</div>
  </div>
);


export function PatientDetails({ isOpen, setIsOpen, patient }: PatientDetailsProps) {
  if (!patient) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Patient Details</SheetTitle>
          <SheetDescription>
            Demographic and contact information for the patient.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
            <div className='space-y-2'>
                <h3 className="text-lg font-semibold">{patient.name}</h3>
                 <span className="text-sm text-muted-foreground">Patient ID: ...{patient.id.slice(-6)}</span>
            </div>
          
            <Separator />

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <DetailItem label="Age" value={patient.age} />
            <DetailItem label="Gender" value={patient.gender} />
            <DetailItem label="Contact" value={patient.contact} />
            <DetailItem label="Admitted On" value={format(new Date(patient.admitted_on), 'PPP')} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
