"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useFirestore } from "@/firebase";
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { StaffMember } from "@/app/dashboard/staff/page";

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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import React from "react";
import { Switch } from "../ui/switch";

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Base schema for all fields
const baseFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").optional(),
  role: z.enum(["doctor", "admin"], { required_error: "You need to select a role."}),
  specialization: z.string().optional(),
  phone: z.string().optional(),
  shift_hours: z.string().optional(),
  availability: z.array(z.string()).optional(),
  verified: z.boolean().default(false).optional(),
  isActive: z.boolean().default(true).optional(),
});

// Refinement for doctor-specific fields
const doctorRefinement = (schema: z.ZodObject<any, any, any>) => schema.refine(data => {
    if (data.role === 'doctor' && !data.specialization) return false;
    return true;
}, {
    message: 'Specialization is required for doctors.',
    path: ['specialization'],
}).refine(data => {
    if (data.role === 'doctor' && (!data.shift_hours || data.shift_hours.length === 0)) return false;
    return true;
}, {
    message: 'Shift hours are required for doctors.',
    path: ['shift_hours'],
}).refine(data => {
    if (data.role === 'doctor' && (!data.availability || data.availability.length === 0)) return false;
    return true;
}, {
    message: 'You have to select at least one day.',
    path: ['availability'],
});

// Schema for adding a new staff member (password is required)
const addStaffSchema = doctorRefinement(baseFormSchema).refine(data => data.password && data.password.length > 0, {
    message: "Password is required for new staff members.",
    path: ["password"],
});

// Schema for editing an existing staff member (password is not included)
const editStaffSchema = doctorRefinement(baseFormSchema.omit({ password: true }));


type StaffFormProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  staff?: StaffMember;
};

export function StaffForm({ isOpen, setIsOpen, staff }: StaffFormProps) {
    const firestore = useFirestore();
    
    const finalSchema = staff ? editStaffSchema : addStaffSchema;

    const form = useForm<z.infer<typeof finalSchema>>({
        resolver: zodResolver(finalSchema),
        defaultValues: staff ? {
          name: `${staff.firstName} ${staff.lastName}`,
          email: staff.email,
          role: staff.role,
          isActive: staff.isActive,
          specialization: staff.specialization || '',
          phone: staff.phone || '',
          shift_hours: staff.shift_hours || '9AM-5PM',
          availability: staff.availability || [],
          verified: staff.verified || false,
        } : {
            name: "",
            email: "",
            password: "",
            role: "doctor",
            specialization: "",
            phone: "",
            shift_hours: "9AM-5PM",
            availability: [],
            verified: false,
            isActive: true,
        },
    });

    const role = form.watch('role');

    React.useEffect(() => {
        if (staff) {
            form.reset({
                name: `${staff.firstName} ${staff.lastName}`,
                email: staff.email,
                role: staff.role,
                isActive: staff.isActive,
                specialization: staff.specialization || '',
                phone: staff.phone || '',
                shift_hours: staff.shift_hours || '9AM-5PM',
                availability: staff.availability || [],
                verified: staff.verified || false,
            });
        } else {
            form.reset({
                name: "",
                email: "",
                password: "",
                role: "doctor",
                specialization: "",
                phone: "",
                shift_hours: "9AM-5PM",
                availability: [],
                verified: false,
                isActive: true,
            });
        }
    }, [staff, form]);

  async function onSubmit(values: z.infer<typeof finalSchema>) {
    try {
        const [firstName, ...lastName] = values.name.split(' ');
        
        if (staff) { // Editing existing staff
            const userRef = doc(firestore, "users", staff.id);
            setDocumentNonBlocking(userRef, {
                email: values.email,
                firstName,
                lastName: lastName.join(' '),
                role: values.role,
                isActive: values.isActive,
            }, { merge: true });

            if (values.role === 'doctor') {
                const doctorRef = doc(firestore, "doctors", staff.id);
                setDocumentNonBlocking(doctorRef, {
                    name: values.name,
                    email: values.email,
                    specialization: values.specialization,
                    phone: values.phone,
                    shift_hours: values.shift_hours,
                    availability: values.availability,
                    verified: values.verified,
                }, { merge: true });
            }

            toast({ title: "Staff Updated", description: `${values.name}'s profile has been updated.` });

        } else { // Creating new user (Doctor or Admin)
            const newValues = values as z.infer<typeof addStaffSchema>;
            
            const serializableUserCredential = await createAuthUser(newValues.email, newValues.password!);
            const user = serializableUserCredential.user;

            const userRef = doc(firestore, "users", user.uid);
            setDocumentNonBlocking(userRef, {
                id: user.uid,
                email: newValues.email,
                firstName: firstName,
                lastName: lastName.join(' '),
                role: newValues.role,
                isActive: newValues.isActive,
                created_at: serverTimestamp(),
            }, { merge: true });

            if (newValues.role === 'doctor') {
                const doctorRef = doc(firestore, "doctors", user.uid);
                setDocumentNonBlocking(doctorRef, {
                    id: user.uid,
                    name: newValues.name,
                    email: newValues.email,
                    specialization: newValues.specialization,
                    phone: newValues.phone,
                    shift_hours: newValues.shift_hours,
                    availability: newValues.availability,
                    avatarUrl: PlaceHolderImages.find(p => p.imageHint.includes('doctor'))?.imageUrl || '',
                    verified: newValues.verified,
                    created_at: serverTimestamp(),
                }, { merge: true });
            }

            toast({ title: "User Added", description: `${newValues.name} (${newValues.role}) has been added.` });
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
      <DialogContent className="sm:max-w-xl grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{staff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <Form {...form}>
            <form id="staff-form" className="space-y-4 px-6">
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
              {!staff && (
                  <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
              )}
               <FormField
               control={form.control}
               name="role"
               render={({ field }) => (
                   <FormItem className="space-y-3">
                   <FormLabel>Select Role</FormLabel>
                   <FormControl>
                       <RadioGroup
                       onValueChange={field.onChange}
                       defaultValue={field.value}
                       className="flex space-x-4"
                       >
                       <FormItem className="flex items-center space-x-2 space-y-0">
                           <FormControl>
                           <RadioGroupItem value="doctor" />
                           </FormControl>
                           <FormLabel className="font-normal">Doctor</FormLabel>
                       </FormItem>
                       <FormItem className="flex items-center space-x-2 space-y-0">
                           <FormControl>
                           <RadioGroupItem value="admin" />
                           </FormControl>
                           <FormLabel className="font-normal">Admin</FormLabel>
                       </FormItem>
                       </RadioGroup>
                   </FormControl>
                   <FormMessage />
                   </FormItem>
               )}
               />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel>Active</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {role === 'doctor' && (
                  <FormField
                    control={form.control}
                    name="verified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Verified</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {role === 'doctor' && (
                <>
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
                </>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" form="staff-form" onClick={form.handleSubmit(onSubmit)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
