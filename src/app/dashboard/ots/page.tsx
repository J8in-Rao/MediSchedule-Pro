'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
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
import { MoreHorizontal } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { OperatingRoom } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
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


const otFormSchema = z.object({
  room_number: z.string().min(1, "Room number is required"),
  capacity: z.coerce.number().optional(),
  status: z.enum(['available', 'in-use']),
  equipment: z.string().optional(),
});

function OTForm({ isOpen, setIsOpen, ot }: { isOpen: boolean, setIsOpen: (open: boolean) => void, ot?: OperatingRoom }) {
  const firestore = useFirestore();
  const form = useForm<z.infer<typeof otFormSchema>>({
    resolver: zodResolver(otFormSchema),
    defaultValues: { room_number: '', capacity: 1, status: 'available', equipment: '' }
  });

  useEffect(() => {
    if (ot) {
      form.reset({
        ...ot,
        equipment: ot.equipment?.join(', ') || '',
      });
    } else {
      form.reset({
        room_number: '',
        capacity: 1,
        status: 'available',
        equipment: '',
      });
    }
  }, [ot, form, isOpen]);
  
  function onSubmit(values: z.infer<typeof otFormSchema>) {
    const data = {
      ...values,
      equipment: values.equipment?.split(',').map(e => e.trim()).filter(e => e) || [],
      created_at: serverTimestamp(),
    };

    if (ot) {
      setDocumentNonBlocking(doc(firestore, 'ot_rooms', ot.id), data, { merge: true });
      toast({ title: 'Operating Room Updated' });
    } else {
      addDocumentNonBlocking(collection(firestore, 'ot_rooms'), data);
      toast({ title: 'Operating Room Added' });
    }
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{ot ? 'Edit' : 'Add'} Operating Room</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <Form {...form}>
            <form id="ot-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6">
              <FormField
                control={form.control}
                name="room_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment (comma-separated)</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" form="ot-form" onClick={form.handleSubmit(onSubmit)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function OTsPage() {
  const firestore = useFirestore();
  const otsCollection = useMemoFirebase(() => collection(firestore, 'ot_rooms'), [firestore]);
  const { data: ots, isLoading } = useCollection<OperatingRoom>(otsCollection);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOt, setSelectedOt] = useState<OperatingRoom | undefined>(undefined);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [otToDelete, setOtToDelete] = useState<OperatingRoom | null>(null);
  
  const handleAdd = () => {
    setSelectedOt(undefined);
    setIsFormOpen(true);
  }

  const handleEdit = (ot: OperatingRoom) => {
    setSelectedOt(ot);
    setIsFormOpen(true);
  }

  const handleDeleteClick = (ot: OperatingRoom) => {
    setOtToDelete(ot);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (otToDelete) {
      deleteDocumentNonBlocking(doc(firestore, 'ot_rooms', otToDelete.id));
      toast({
        title: 'OT Deleted',
        description: `Operating room ${otToDelete.room_number} has been deleted.`,
      });
      setIsAlertOpen(false);
      setOtToDelete(null);
    }
  };


  return (
    <>
      <PageHeader
        title="OT Management"
        description="Add, edit, and manage operating theater details."
      >
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add OT
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Operating Theaters</CardTitle>
          <CardDescription>A list of all OTs in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>}
              {!isLoading && ots?.map(ot => (
                <TableRow key={ot.id}>
                  <TableCell className="font-medium">{ot.room_number}</TableCell>
                  <TableCell>{ot.capacity || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={ot.status === 'available' ? 'secondary' : 'default'}>
                      {ot.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(ot)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(ot)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {!isLoading && ots?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No operating rooms found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <OTForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} ot={selectedOt} />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the operating room
              and could affect scheduled surgeries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOtToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
