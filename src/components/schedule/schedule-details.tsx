
'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { OperationSchedule } from '@/lib/types';
import { Separator } from '../ui/separator';

type ScheduleDetailsProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  surgery: OperationSchedule;
};

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-base font-semibold">{value || 'N/A'}</p>
  </div>
);


export function ScheduleDetails({ isOpen, setIsOpen, surgery }: ScheduleDetailsProps) {
  if (!surgery) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Operation Details</SheetTitle>
          <SheetDescription>
            Detailed view of the scheduled operation.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
            <div className='space-y-2'>
                <h3 className="text-lg font-semibold">{surgery.procedure}</h3>
                 <div className="flex items-center gap-2">
                    <Badge variant={surgery.status === 'completed' ? 'secondary' : surgery.status === 'cancelled' ? 'destructive' : 'default'}>
                        {surgery.status}
                    </Badge>
                     <span className="text-sm text-muted-foreground">{surgery.date} from {surgery.start_time} to {surgery.end_time}</span>
                </div>
            </div>
          
            <Separator />

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <DetailItem label="Patient" value={surgery.patientName} />
            <DetailItem label="Doctor" value={surgery.doctorName} />
            <DetailItem label="Operating Room" value={`OT-${surgery.ot_id}`} />
            <DetailItem label="Anesthesiologist" value={surgery.anesthesiologist} />
            <DetailItem label="Anesthesia Type" value={surgery.anesthesia_type} />
            <DetailItem label="Assistant Surgeon" value={surgery.assistant_surgeon} />
          </div>

            <Separator />
          
            <div className='space-y-4'>
                <DetailItem label="Nurses" value={surgery.nurses?.join(', ')} />
                <DetailItem label="Instruments" value={surgery.instruments?.join(', ')} />
                <DetailItem label="Drugs / Materials" value={surgery.drugs_used?.join(', ')} />
                <DetailItem label="Doctor's Remarks" value={<p className='italic text-sm font-normal'>"{surgery.remarks}"</p>} />
                <DetailItem label="Report URL" value={surgery.report_url ? <a href={surgery.report_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Report</a> : 'N/A'} />
            </div>
            
        </div>
      </SheetContent>
    </Sheet>
  );
}
