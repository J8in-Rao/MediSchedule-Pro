"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doctor, Patient, Surgery } from "@/lib/types";
import { useState } from "react";
import { ScheduleForm } from "./schedule-form";

type GetColumnsProps = {
  doctors: Doctor[];
  patients: Patient[];
}

const getStatusBadgeVariant = (status: Surgery['status']) => {
  switch (status) {
    case 'Completed': return 'secondary';
    case 'In Progress': return 'default';
    case 'Cancelled': return 'destructive';
    case 'Scheduled':
    default: return 'outline';
  }
}

export const getColumns = ({ doctors, patients }: GetColumnsProps): ColumnDef<Surgery>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "procedure",
    header: "Procedure",
  },
  {
    accessorKey: "patientName",
    header: "Patient",
  },
  {
    accessorKey: "doctorName",
    header: "Doctor",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.getValue("date")), 'PPP'),
  },
  {
    accessorKey: "startTime",
    header: "Time",
    cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`,
  },
  {
    accessorKey: "room",
    header: "Room",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Surgery['status'];
      return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const surgery = row.original;
      const [isFormOpen, setIsFormOpen] = useState(false);

      return (
        <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(surgery.id)}
            >
              Copy Surgery ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsFormOpen(true)}>Edit Surgery</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete Surgery</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ScheduleForm 
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            doctors={doctors}
            patients={patients}
            surgery={surgery}
          />
        </>
      );
    },
  },
];
