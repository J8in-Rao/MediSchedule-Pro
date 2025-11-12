"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { doc, collection } from 'firebase/firestore';

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
import { Doctor, Patient, OperationSchedule, OperatingRoom } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  procedure: z.string().min(1, "Procedure is required"),
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().regex(/^([01]\\d|2[0-3]):([0-5]\\d)$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\\d|2[0-3]):([0-5]\\d)$/, "Invalid time format (HH:MM)"),
  otId: z.string().min(1, "Room is required"),
  anesthesiaType: z.string().min(1, "Anesthesia type is required"),
  anesthesiologistName: z.string().min(1, "Anesthesiologist name is required"),
  assistantSurgeon: z.string().optional(),
  nurses: z.string().optional(),
  remarks: z.string().optional(),
  report_url: z.string().url().optional().or(z.literal('')),
  drugs_used: z.string().optional(),
  instruments: z.string().optional(),
});

type ScheduleFormProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  doctors: Doctor[];
  patients: Patient[];
  surgery?: OperationSchedule;
};

export function ScheduleForm({ isOpen, setIsOpen, doctors, patients, surgery }: ScheduleFormProps) {
  const firestore = useFirestore();
  
  const otCollection = useMemoFirebase(() => collection(firestore, 'operating_rooms'), [firestore]);
  const { data: operatingRooms } = useCollection<OperatingRoom>(otCollection);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: surgery ? {
      ...surgery,
      date: new Date(surgery.date),
      nurses: surgery.nurses?.join(', '),
      drugs_used: surgery.drugs_used?.join(', '),
      instruments: surgery.instruments?.join(', '),
    } : {
      procedure: "",
      patientId: "",
      doctorId: "",
      date: new Date(),
      startTime: "",
      endTime: "",
      otId: "",
      anesthesiaType: "",
      anesthesiologistName: "",
      assistantSurgeon: "",
      nurses: "",
      remarks: "",
      report_url: "",
      drugs_used: "",
      instruments: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    const doctor = doctors.find(d => d.id === values.doctorId);
    const patient = patients.find(p => p.id === values.patientId);

    if (!doctor || !patient) {
      toast({ variant: "destructive", title: "Error", description: "Selected doctor or patient not found." });
      return;
    }

    const surgeryData = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
      doctorName: doctor.name,
      patientName: patient.name,
      status: surgery?.status || 'Scheduled',
      nurses: values.nurses?.split(',').map(n => n.trim()).filter(n => n),
      drugs_used: values.drugs_used?.split(',').map(d => d.trim()).filter(d => d),
      instruments: values.instruments?.split(',').map(i => i.trim()).filter(i => i),
    };

    if (surgery) {
      const surgeryRef = doc(firestore, "operations", surgery.id);
      setDocumentNonBlocking(surgeryRef, surgeryData, { merge: true });
    } else {
      addDocumentNonBlocking(collection(firestore, 'operations'), surgeryData);
    }
    
    toast({
      title: surgery ? "Operation Updated" : "Operation Scheduled",
      description: `The operation "${values.procedure}" has been successfully saved.`,
    });
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{surgery ? "Edit Operation" : "Schedule New Operation"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="procedure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procedure</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Appendectomy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientId"
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
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name} ({d.specialization})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
                control={form.control}
                name="otId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating Room</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {operatingRooms?.map(ot => (
                           <SelectItem key={ot.id} value={ot.id}>{ot.room_number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="anesthesiaType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anesthesia Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., General" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="anesthesiologistName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anesthesiologist</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="assistantSurgeon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assistant Surgeon</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Alex Ray (Optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nurses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nurses</FormLabel>
                    <FormControl>
                      <Input placeholder="Nurse 1, Nurse 2, ... (comma-separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor's Remarks</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Post-surgery comments..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instruments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruments Required</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List required instruments (comma-separated)..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="drugs_used"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drugs / Materials</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List required drugs and materials (comma-separated)..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="report_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/report.pdf (Optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <DialogFooter className="sticky bottom-0 bg-background pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save Schedule</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    