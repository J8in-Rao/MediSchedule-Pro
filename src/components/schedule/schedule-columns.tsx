"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OperationSchedule } from "@/lib/types";

type GetColumnsProps = {
  onViewDetails: (surgery: OperationSchedule) => void;
}

const getStatusBadgeVariant = (status: OperationSchedule['status']) => {
  switch (status) {
    case 'completed': return 'secondary';
    case 'cancelled': return 'destructive';
    case 'scheduled':
    default: return 'default';
  }
}

export const getColumns = ({ onViewDetails }: GetColumnsProps): ColumnDef<OperationSchedule>[] => [
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
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "ot_id",
    header: "Room",
    cell: ({ row }) => `OT-${row.original.ot_id}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as OperationSchedule['status'];
      return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const surgery = row.original;

      return (
         <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onViewDetails(surgery)}>
            <span className="sr-only">View Details</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
      );
    },
  },
];
