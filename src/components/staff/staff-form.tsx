"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useFirestore } from "@/firebase";
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Doctor } from "@/lib/types";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { createAuthUser } from "@/firebase/auth/create-user";

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").optional(),
  specialization: z.string().min(1, "Specialization is required."),
  phone: z.string().optional(),
  shift_hours: z.string().min(1, "Shift hours are required."),
  availability: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one day.',
  }),
});


type StaffFormProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  doctor?: Doctor;
};

export function StaffForm({ isOpen, setIsOpen, doctor }: StaffFormProps) {
    const firestore = useFirestore();
    
    // Adjust schema based on whether we are editing or creating
    const finalSchema = doctor ? formSchema.omit({ password: true }) : formSchema.refine(data => data.password, {
        message: "Password is required for new staff members.",
        path: ["password"],
    });

    const form = useForm<z.infer<typeof finalSchema>>({
        resolver: zodResolver(finalSchema),
        defaultValues: doctor ? {
          ...doctor,
          phone: doctor.phone || '',
        } : {
            name: "",
            email: "",
            password: "",
            specialization: "",
            phone: "",
            shift_hours: "9AM-5PM",
            availability: [],
        },
    });

  async function onSubmit(values: z.infer<typeof finalSchema>) {
    try {
        if (doctor) {
            // Editing existing doctor
            const doctorRef = doc(firestore, "doctors", doctor.id);
            setDocumentNonBlocking(doctorRef, {
                name: values.name,
                email: values.email,
                specialization: values.specialization,
                phone: values.phone,
                shift_hours: values.shift_hours,
                availability: values.availability,
            }, { merge: true });

            const userRef = doc(firestore, "users", doctor.id);
            const [firstName, ...lastName] = values.name.split(' ');
            setDocumentNonBlocking(userRef, {
                email: values.email,
                firstName,
                lastName: lastName.join(' '),
            }, { merge: true });


            toast({ title: "Staff Updated", description: `${values.name}'s profile has been updated.` });

        } else {
            // Creating new doctor
            // This requires values to have a password, ensured by the schema refinement.
            const newDoctorValues = values as z.infer<typeof formSchema>;
            
            const userCredential = await createAuthUser(newDoctorValues.email, newDoctorValues.password!);
            const user = userCredential.user;

            const [firstName, ...lastName] = newDoctorValues.name.split(' ');

            // Create user profile doc
            const userRef = doc(firestore, "users", user.uid);
            setDocumentNonBlocking(userRef, {
                id: user.uid,
                email: newDoctorValues.email,
                firstName: firstName,
                lastName: lastName.join(' '),
                role: 'doctor'
            }, { merge: true });

            // Create doctor profile doc
            const doctorRef = doc(firestore, "doctors", user.uid);
            setDocumentNonBlocking(doctorRef, {
                id: user.uid,
                name: newDoctorValues.name,
                email: newDoctorValues.email,
                specialization: newDoctorValues.specialization,
                phone: newDoctorValues.phone,
                shift_hours: newDoctorValues.shift_hours,
                availability: newDoctorValues.availability,
                avatarUrl: PlaceHolderImages.find(p => p.imageHint.includes('doctor'))?.imageUrl || '',
            }, { merge: true });

            toast({ title: "Staff Added", description: `${newDoctorValues.name} has been added to the staff.` });
        }
        setIsOpen(false);
        form.reset();
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "An Error Occurred",
            description: error.message,
        });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{doctor ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Dr. John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="name@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            {!doctor && (
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
            )}
             <FormField control={form.control} name="specialization" render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl><Input placeholder="e.g., Cardiology" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="shift_hours" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Shift Hours</FormLabel>
                    <FormControl><Input placeholder="e.g., 9AM-5PM" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
            </div>
             <FormField
              control={form.control}
              name="availability"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Availability</FormLabel>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
                  {weekDays.map((day) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name="availability"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={day}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), day])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== day
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {day}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sticky bottom-0 bg-background pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
