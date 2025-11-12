'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
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
import { collection } from 'firebase/firestore';
import type { Patient } from '@/lib/types';
import { format } from 'date-fns';

export default function PatientsPage() {
  const firestore = useFirestore();
  const patientsCollection = useMemoFirebase(() => collection(firestore, 'patients'), [firestore]);
  const { data: patients, isLoading } = useCollection<Patient>(patientsCollection);

  return (
    <>
      <PageHeader
        title="Patient Management"
        description="Manage patient records, including case details and admission dates."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Patient
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Patients List</CardTitle>
          <CardDescription>A list of all patients in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="hidden md:table-cell">
                  Case
                </TableHead>
                 <TableHead className="hidden md:table-cell">
                  Admitted On
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>}
              {!isLoading && patients?.map(patient => (
                <TableRow key={patient.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Patient avatar"
                      className="aspect-square rounded-full object-cover"
                      height="64"
                      src={patient.avatarUrl}
                      width="64"
                      data-ai-hint="person portrait"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate">
                    {patient.case_description}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(patient.admitted_on), 'PPP')}
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
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
    </>
  );
}

    