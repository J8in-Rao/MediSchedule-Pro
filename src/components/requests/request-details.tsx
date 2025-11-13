'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { SurgeryRequest } from '@/lib/types';
import { Separator } from '../ui/separator';
import { format } from 'date-fns';

type RequestDetailsProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  request: SurgeryRequest;
};

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <div className="text-base font-semibold">{value || 'N/A'}</div>
  </div>
);

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


export function RequestDetails({ isOpen, setIsOpen, request }: RequestDetailsProps) {
  if (!request) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Surgery Request Details</SheetTitle>
          <SheetDescription>
            Detailed view of the surgery request.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
            <div className='space-y-2'>
                <h3 className="text-lg font-semibold">{request.procedure_name}</h3>
                 <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status}
                    </Badge>
                     <span className="text-sm text-muted-foreground">Requested on {format(new Date(request.created_at as Date), 'PPP')}</span>
                </div>
            </div>
          
            <Separator />

          <h4 className="text-md font-semibold">Surgery Details</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <DetailItem label="Patient" value={request.patientName} />
            <DetailItem label="Priority" value={request.priority} />
            <DetailItem label="Preferred Date" value={format(new Date(request.preferred_date), 'PPP')} />
            <DetailItem label="Expected Duration" value={request.expected_duration} />
            <DetailItem label="Anesthesia Type" value={request.anesthesia_type} />
            <div className="col-span-2">
                <DetailItem label="Reason / Diagnosis" value={request.diagnosis} />
            </div>
          </div>

            <Separator />
          
            <h4 className="text-md font-semibold">Staffing & Resources</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <DetailItem label="Assistant Surgeon" value={request.assistant_surgeon} />
                <DetailItem label="Anesthesiologist" value={request.anesthesiologist} />
                <DetailItem label="Nurses Needed" value={request.nurses_needed} />
                <DetailItem label="Required Instruments" value={request.required_instruments} />
                <DetailItem label="Required Drugs/Materials" value={request.required_drugs} />
            </div>

            <Separator />

             <h4 className="text-md font-semibold">Additional Information</h4>
             <div className="grid grid-cols-1 gap-4">
                <DetailItem label="Additional Notes" value={<span className='italic text-sm font-normal'>"{request.additional_notes}"</span>} />
                <DetailItem label="Uploads" value={request.uploads_url ? <a href={request.uploads_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Uploads</a> : 'N/A'} />
            </div>
            
        </div>
      </SheetContent>
    </Sheet>
  );
}
