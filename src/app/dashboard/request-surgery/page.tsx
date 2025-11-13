'use client';
import { PageHeader } from '@/components/shared/page-header';
import { RequestForm } from '@/components/requests/request-form';

export default function RequestSurgeryPage() {

  return (
    <>
      <PageHeader
        title="Request a New Surgery"
        description="Fill out the form below to submit a new surgery request for administrative review and scheduling."
      />
      <div className="w-full">
         <RequestForm isOpen={true} setIsOpen={() => {}} />
      </div>
    </>
  );
}
