'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Doctor, UserProfile } from '@/lib/types';
import { useState, useMemo } from 'react';
import { StaffForm } from '@/components/staff/staff-form';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';

// Combined type for the staff list
export type StaffMember = UserProfile & Partial<Doctor>;


export default function StaffPage() {
  const firestore = useFirestore();
  
  const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersCollection);
  
  const doctorsCollection = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsCollection);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | undefined>(undefined);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);


  const staffMembers = useMemo(() => {
    if (!users || !doctors) return [];
    
    const doctorsMap = new Map(doctors.map(d => [d.id, d]));

    return users.map(user => {
      if (user.role === 'doctor' && doctorsMap.has(user.id)) {
        return { ...user, ...doctorsMap.get(user.id) };
      }
      return user;
    });
  }, [users, doctors]);

  const isLoading = isLoadingUsers || isLoadingDoctors;

  const handleAdd = () => {
    setSelectedStaff(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (staff: StaffMember) => {
    setStaffToDelete(staff);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      // Note: This only deletes the 'users' document.
      // A robust solution would use a Firebase Function to delete the auth user and doctor doc.
      deleteDocumentNonBlocking(doc(firestore, 'users', staffToDelete.id));
      if (staffToDelete.role === 'doctor') {
        deleteDocumentNonBlocking(doc(firestore, 'doctors', staffToDelete.id));
      }
      toast({
        title: 'Staff Deleted',
        description: `${staffToDelete.firstName} ${staffToDelete.lastName} has been removed. Auth user may need manual deletion.`,
      });
      setIsAlertOpen(false);
      setStaffToDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Staff Management"
        description="Add, edit, and manage staff details and availability."
      >
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Staff Member
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
          <CardDescription>A list of all admins and doctors in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead className="hidden md:table-cell">
                  Availability
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>}
              {!isLoading && staffMembers?.map(staff => (
                <TableRow key={staff.id}>
                  <TableCell className="hidden sm:table-cell">
                     {staff.role === 'doctor' && staff.avatarUrl && (
                       <Image
                        alt="Staff avatar"
                        className="aspect-square rounded-full object-cover"
                        height="64"
                        src={staff.avatarUrl}
                        width="64"
                        data-ai-hint="doctor portrait"
                      />
                     )}
                  </TableCell>
                  <TableCell className="font-medium">{staff.firstName} {staff.lastName}</TableCell>
                  <TableCell className="capitalize">{staff.role}</TableCell>
                  <TableCell>{staff.specialization || 'N/A'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {staff.availability && staff.availability.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {staff.availability.map(day => (
                          <Badge key={day} variant="secondary">{day}</Badge>
                        ))}
                      </div>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(staff)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(staff)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && staffMembers?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No staff members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <StaffForm 
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        staff={selectedStaff}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member's
              user record and profile. The associated Firebase Auth user will need to be deleted manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStaffToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
