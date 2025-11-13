"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { doc, collection, serverTimestamp } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Patient, SurgeryRequest } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import { useRouter } from "next/navigation";


const formSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  procedure_name: z.string().min(1, "Procedure name is required"),
  diagnosis: z.string().min(1, "Diagnosis/reason is required"),
  preferred_date: z.date({ required_error: "A preferred date is required." }),
  expected_duration: z.string().min(1, "Expected duration is required"),
  anesthesia_type: z.string().min(1, "Anesthesia type is required"),
  priority: z.enum(["Routine", "Semi-urgent", "Urgent", "Emergency"]),
  assistant_surgeon: z.string().optional(),
  anesthesiologist: z.string().optional(),
  nurses_needed: z.string().optional(),
  required_instruments: z.string().optional(),
  required_drugs: z.string().optional(),
  uploads_url: z.string().url().optional().or(z.literal('')),
  additional_notes: z.string().optional(),
});


type RequestFormProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  request?: SurgeryRequest;
};

export function RequestForm({ isOpen, setIsOpen, request }: RequestFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const { data: patients } = useCollection<Patient>(patientsCollection);

  const isModal = !!request; // If a request is passed, it's in a modal. Otherwise it's on a page.

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: request ? {
      ...request,
      preferred_date: new Date(request.preferred_date),
    } : {
      patient_id: "",
      procedure_name: "",
      diagnosis: "",
      preferred_date: new Date(),
      expected_duration: "",
      anesthesia_type: "",
      priority: 'Routine',
      assistant_surgeon: "",
      anesthesiologist: "",
      nurses_needed: "",
      required_instruments: "",
      required_drugs: "",
      uploads_url: "",
      additional_notes: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
        return;
    }

    const requestData = {
      ...values,
      preferred_date: format(values.preferred_date, "yyyy-MM-dd"),
    };

    if (request) {
      const requestRef = doc(firestore, "surgery_requests", request.id);
      setDocumentNonBlocking(requestRef, { ...requestData, updated_at: serverTimestamp() }, { merge: true });
       toast({ title: "Request Updated", description: "Your surgery request has been updated." });

    } else {
      addDocumentNonBlocking(collection(firestore, 'surgery_requests'), {
        ...requestData,
        requesting_doctor_id: user.uid,
        status: 'Pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      toast({ title: "Request Submitted", description: "Your request has been sent for approval." });
    }
    
    if (isModal) {
      setIsOpen(false);
    }
    form.reset();
    router.push('/dashboard/my-requests');
  }

  const formContent = (
     <Form {...form}>
        <form id="request-form" className="space-y-6">
            <FormField
            control={form.control}
            name="patient_id"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Patient</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {patients?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} (ID: ...{p.id.slice(-4)})</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="procedure_name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Procedure Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Arthroscopy" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Routine">Routine</SelectItem>
                            <SelectItem value="Semi-urgent">Semi-urgent</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}/>
            </div>

            <FormField control={form.control} name="diagnosis" render={({ field }) => (
                <FormItem>
                    <FormLabel>Reason / Diagnosis</FormLabel>
                    <FormControl><Textarea placeholder="Reason for the surgery" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="preferred_date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Preferred Date</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="expected_duration" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Expected Duration</FormLabel>
                        <FormControl><Input placeholder="e.g., 2 hours" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            
            <FormField control={form.control} name="anesthesia_type" render={({ field }) => (
                <FormItem>
                    <FormLabel>Anesthesia Type</FormLabel>
                    <FormControl><Input placeholder="e.g., General, Local" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="assistant_surgeon" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Assistant Surgeon (optional)</FormLabel>
                        <FormControl><Input placeholder="Dr. Assistant" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="anesthesiologist" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Anesthesiologist (optional)</FormLabel>
                        <FormControl><Input placeholder="Dr. Anesthesiologist" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
             </div>
             
             <FormField control={form.control} name="nurses_needed" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nurses Needed (optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., 2" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
             <FormField control={form.control} name="required_instruments" render={({ field }) => (
                <FormItem>
                    <FormLabel>Required Instruments (optional)</FormLabel>
                    <FormControl><Textarea placeholder="List required instruments..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
             <FormField control={form.control} name="required_drugs" render={({ field }) => (
                <FormItem>
                    <FormLabel>Required Drugs/Materials (optional)</FormLabel>
                    <FormControl><Textarea placeholder="List required drugs and materials..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="uploads_url" render={({ field }) => (
                <FormItem>
                    <FormLabel>Uploads URL (optional)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/report.pdf" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="additional_notes" render={({ field }) => (
                <FormItem>
                    <FormLabel>Additional Notes (optional)</FormLabel>
                    <FormControl><Textarea placeholder="Any other relevant information..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            
        </form>
    </Form>
  );

  if (isModal) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
                <DialogHeader className="p-6 pb-0">
                <DialogTitle>{request ? "Edit Surgery Request" : "Request New Surgery"}</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto px-6">{formContent}</div>
                <DialogFooter className="p-6 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" form="request-form" onClick={form.handleSubmit(onSubmit)}>
                        {request ? "Save Changes" : "Submit Request"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
  }

  // Render as a card on a page
  return (
    <Card>
        <CardContent className="p-6">
            {formContent}
             <div className="flex justify-end gap-2 pt-6">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" form="request-form" onClick={form.handleSubmit(onSubmit)}>
                    Submit Request
                </Button>
            </div>
        </CardContent>
    </Card>
  )
}
