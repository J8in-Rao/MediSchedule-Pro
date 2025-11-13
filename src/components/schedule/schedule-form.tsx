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
import { Doctor, Patient, OperationSchedule, OperatingRoom } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  procedure: z.string().min(1, "Procedure is required"),
  patient_id: z.string().min(1, "Patient is required"),
  doctor_id: z.string().min(1, "Doctor is required"),
  date: z.date({ required_error: "A date is required." }),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  ot_id: z.string().min(1, "Room is required"),
  anesthesia_type: z.string().min(1, "Anesthesia type is required"),
  anesthesiologist: z.string().min(1, "Anesthesiologist name is required"),
  assistant_surgeon: z.string().optional(),
  nurses: z.string().optional(),
  remarks: z.string().optional(),
  report_url: z.string().url().optional().or(z.literal('')),
  drugs_used: z.string().optional(),
  instruments: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]),
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
  const { user } = useUser();
  
  const otCollection = useMemoFirebase(() => collection(firestore, 'ot_rooms'), [firestore]);
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
      patient_id: "",
      doctor_id: "",
      date: new Date(),
      start_time: "",
      end_time: "",
      ot_id: "",
      anesthesia_type: "",
      anesthesiologist: "",
      assistant_surgeon: "",
      nurses: "",
      remarks: "",
      report_url: "",
      drugs_used: "",
      instruments: "",
      status: 'scheduled',
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
        return;
    }

    const surgeryData = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
      nurses: values.nurses?.split(',').map(n => n.trim()).filter(n => n),
      drugs_used: values.drugs_used?.split(',').map(d => d.trim()).filter(d => d),
      instruments: values.instruments?.split(',').map(i => i.trim()).filter(i => i),
    };

    if (surgery) {
      const surgeryRef = doc(firestore, "operation_schedules", surgery.id);
      setDocumentNonBlocking(surgeryRef, { ...surgeryData, updated_at: serverTimestamp() }, { merge: true });
    } else {
      addDocumentNonBlocking(collection(firestore, 'operation_schedules'), {
        ...surgeryData,
        created_by: user.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
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
      <DialogContent className="sm:max-w-2xl grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{surgery ? "Edit Operation" : "Schedule New Operation"}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <Form {...form}>
            <form id="schedule-form" className="space-y-4 px-6">
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
                  name="doctor_id"
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
                    name="start_time"
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
                    name="end_time"
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
                  name="ot_id"
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
                          {operatingRooms?.filter(ot => ot.status === 'available').map(ot => (
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
                    name="anesthesia_type"
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
                    name="anesthesiologist"
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Set status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assistant_surgeon"
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
            </form>
          </Form>
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" form="schedule-form" onClick={form.handleSubmit(onSubmit)}>Save Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
