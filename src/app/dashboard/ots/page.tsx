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
import { collection, doc } from 'firebase/firestore';
import type { OperatingRoom } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';

const otFormSchema = z.object({
  room_number: z.string().min(1, "Room number is required"),
  capacity: z.coerce.number().optional(),
  status: z.enum(['Available', 'Occupied', 'Maintenance']),
});

function OTForm({ isOpen, setIsOpen, ot }: { isOpen: boolean, setIsOpen: (open: boolean) => void, ot?: OperatingRoom }) {
  const firestore = useFirestore();
  const form = useForm<z.infer<typeof otFormSchema>>({
    resolver: zodResolver(otFormSchema),
    defaultValues: ot || { room_number: '', capacity: 0, status: 'Available' },
  });
  
  function onSubmit(values: z.infer<typeof otFormSchema>) {
    if (ot) {
      setDocumentNonBlocking(doc(firestore, 'operating_rooms', ot.id), values, { merge: true });
      toast({ title: 'Operating Room Updated' });
    } else {
      addDocumentNonBlocking(collection(firestore, 'operating_rooms'), values);
      toast({ title: 'Operating Room Added' });
    }
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ot ? 'Edit' : 'Add'} Operating Room</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


export default function OTsPage() {
  const firestore = useFirestore();
  const otsCollection = useMemoFirebase(() => collection(firestore, 'operating_rooms'), [firestore]);
  const { data: ots, isLoading } = useCollection<OperatingRoom>(otsCollection);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOt, setSelectedOt] = useState<OperatingRoom | undefined>(undefined);
  
  const handleAdd = () => {
    setSelectedOt(undefined);
    setIsFormOpen(true);
  }

  const handleEdit = (ot: OperatingRoom) => {
    setSelectedOt(ot);
    setIsFormOpen(true);
  }

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
                    <Badge variant={ot.status === 'Available' ? 'secondary' : ot.status === 'Occupied' ? 'default' : 'destructive'}>
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
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <OTForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} ot={selectedOt} />
    </>
  );
}

    