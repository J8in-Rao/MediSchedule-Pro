"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown } from "lucide-react";
import { getColumns } from "./schedule-columns";
import { Doctor, Patient, OperationSchedule, OperatingRoom } from "@/lib/types";
import { ScheduleDetails } from "./schedule-details";
import { useToast } from "@/hooks/use-toast";

/**
 * A highly configurable data table for displaying and managing operation schedules.
 * 
 * This component is built using TanStack Table and includes features like:
 * - Sorting, filtering, and pagination.
 * - Customizable column visibility.
 * - A global search function.
 * - Row selection.
 * - A slide-out panel for viewing detailed information.
 * 
 * It's designed to be the central point for schedule visualization for admins.
 * It takes raw data from Firestore and processes it into a user-friendly format.
 */

interface ScheduleTableProps {
  data: OperationSchedule[];
  doctors: Doctor[];
  patients: Patient[];
  operatingRooms: OperatingRoom[];
  onAdd: () => void;
}

const MAX_VISIBLE_COLUMNS = 7;

// This defines the shape of the data after we've processed it, adding readable names.
type ProcessedSurgery = OperationSchedule & { patientName: string; doctorName: string; time: string; room: string; };

export function ScheduleTable({ data, doctors, patients, operatingRooms, onAdd }: ScheduleTableProps) {
  const { toast } = useToast();
  // State management for TanStack Table features.
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    // By default, we hide some of the more detailed columns to keep the UI clean.
    anesthesiologist: false,
    anesthesia_type: false,
    assistant_surgeon: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});

  // State for managing the details side panel.
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedSurgery, setSelectedSurgery] = React.useState<ProcessedSurgery | null>(null);

  // This is a critical piece of logic. We process the raw data from Firestore here.
  // It maps IDs (like patient_id, doctor_id) to their corresponding names.
  // useMemo ensures this expensive operation only runs when the source data changes.
  const processedData: ProcessedSurgery[] = React.useMemo(() => {
    const patientMap = new Map(patients.map(p => [p.id, p.name]));
    const doctorMap = new Map(doctors.map(d => [d.id, d.name]));
    const roomMap = new Map(operatingRooms.map(r => [r.id, r.room_number]));

    return data.map(surgery => ({
      ...surgery,
      patientName: patientMap.get(surgery.patient_id) || 'Unknown Patient',
      doctorName: doctorMap.get(surgery.doctor_id) || 'Unknown Doctor',
      time: `${surgery.start_time} - ${surgery.end_time}`,
      room: `OT-${roomMap.get(surgery.ot_id) || surgery.ot_id}`
    }));
  }, [data, patients, doctors, operatingRooms]);

  // This function is passed to the columns definition.
  // It sets the selected surgery and opens the details panel.
  const handleViewDetails = (surgery: OperationSchedule) => {
    const fullSurgeryDetails = processedData.find(p => p.id === surgery.id);
    setSelectedSurgery(fullSurgeryDetails || null);
    setIsDetailsOpen(true);
  };
  
  // Memoizing the columns definition prevents it from being recalculated on every render.
  const columns = React.useMemo(() => getColumns({ onViewDetails: handleViewDetails }), [processedData]);


  const table = useReactTable({
    data: processedData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // This function limits the number of visible columns to avoid UI clutter.
  // It provides user feedback via a toast notification if they exceed the limit.
  const handleColumnVisibilityChange = (columnId: string, isVisible: boolean) => {
    const visibleColumnCount = Object.values(table.getState().columnVisibility).filter(v => v).length;

    if (isVisible && visibleColumnCount >= MAX_VISIBLE_COLUMNS) {
      toast({
        variant: 'destructive',
        title: 'Column Limit Reached',
        description: `You can only show a maximum of ${MAX_VISIBLE_COLUMNS} columns at a time.`,
      });
      return;
    }
    table.getColumn(columnId)?.toggleVisibility(isVisible);
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        {/* The global search input */}
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ''}
          onChange={(event) =>
            setGlobalFilter(event.target.value)
          }
          className="max-w-sm"
        />
        {/* The column visibility dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide() && column.id !== 'actions' && column.id !== 'select')
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      handleColumnVisibilityChange(column.id, !!value)
                    }
                  >
                    {column.id.replace(/_/g, ' ')}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      {/* The Details Panel, which is rendered conditionally */}
       {selectedSurgery && (
        <ScheduleDetails
            isOpen={isDetailsOpen}
            setIsOpen={setIsDetailsOpen}
            surgery={selectedSurgery}
        />
      )}
    </div>
  );
}
