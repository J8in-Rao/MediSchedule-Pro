"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { doc } from 'firebase/firestore';

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
import { Doctor, Patient, Surgery } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection } from "firebase/firestore";

const formSchema = z.object({
  procedure: z.string().min(1, "Procedure is required"),
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().regex(/^([01]\\d|2[0-3]):([0-5]\\d)$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\\d|2[0-3]):([0-5]\\d)$/, "Invalid time format (HH:MM)"),
  room: z.string().min(1, "Room is required"),
});

type ScheduleFormProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  doctors: Doctor[];
  patients: Patient[];
  surgery?: Surgery;
};

export function ScheduleForm({ isOpen, setIsOpen, doctors, patients, surgery }: ScheduleFormProps) {
  const firestore = useFirestore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: surgery ? {
      ...surgery,
      date: new Date(surgery.date),
    } : {
      procedure: "",
      patientId: "",
      doctorId: "",
      date: new Date(),
      startTime: "",
      endTime: "",
      room: "",
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
    };

    if (surgery) {
      const surgeryRef = doc(firestore, "surgeries", surgery.id);
      setDocumentNonBlocking(surgeryRef, surgeryData, { merge: true });
    } else {
      addDocumentNonBlocking(collection(firestore, 'surgeries'), surgeryData);
    }
    
    toast({
      title: surgery ? "Surgery Updated" : "Surgery Scheduled",
      description: `The surgery "${values.procedure}" has been successfully saved.`,
    });
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{surgery ? "Edit Surgery" : "Schedule New Surgery"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                name="room"
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
                        <SelectItem value="OT 1">OT 1</SelectItem>
                        <SelectItem value="OT 2">OT 2</SelectItem>
                        <SelectItem value="OT 3">OT 3</SelectItem>
                        <SelectItem value="OT 4">OT 4</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save Schedule</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
