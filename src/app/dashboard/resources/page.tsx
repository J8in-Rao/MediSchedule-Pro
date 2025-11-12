
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
import type { Resource } from '@/lib/types';
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
import { Switch } from '@/components/ui/switch';

const resourceFormSchema = z.object({
  name: z.string().min(1, "Resource name is required"),
  type: z.enum(['Drug', 'Instrument', 'Material']),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
  in_use: z.boolean(),
});

function ResourceForm({ isOpen, setIsOpen, resource }: { isOpen: boolean, setIsOpen: (open: boolean) => void, resource?: Resource }) {
  const firestore = useFirestore();
  const form = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: resource || { name: '', type: 'Instrument', quantity: 1, in_use: false },
  });
  
  function onSubmit(values: z.infer<typeof resourceFormSchema>) {
    if (resource) {
      setDocumentNonBlocking(doc(firestore, 'resources', resource.id), values, { merge: true });
      toast({ title: 'Resource Updated' });
    } else {
      addDocumentNonBlocking(collection(firestore, 'resources'), values);
      toast({ title: 'Resource Added' });
    }
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{resource ? 'Edit' : 'Add'} Resource</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Scalpel" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Drug">Drug</SelectItem>
                      <SelectItem value="Instrument">Instrument</SelectItem>
                      <SelectItem value="Material">Material</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="in_use"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>In Use</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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


export default function ResourcesPage() {
  const firestore = useFirestore();
  const resourcesCollection = useMemoFirebase(() => collection(firestore, 'resources'), [firestore]);
  const { data: resources, isLoading } = useCollection<Resource>(resourcesCollection);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>(undefined);
  
  const handleAdd = () => {
    setSelectedResource(undefined);
    setIsFormOpen(true);
  }

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setIsFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Resource Management"
        description="Add, edit, and manage medical resources like drugs and instruments."
      >
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>A list of all medical resources in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>In Use</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>}
              {!isLoading && resources?.map(resource => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell>{resource.type}</TableCell>
                  <TableCell>{resource.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={resource.in_use ? 'destructive' : 'secondary'}>
                      {resource.in_use ? 'Yes' : 'No'}
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
                        <DropdownMenuItem onClick={() => handleEdit(resource)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {!isLoading && resources?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No resources found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ResourceForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} resource={selectedResource} />
    </>
  );
}
