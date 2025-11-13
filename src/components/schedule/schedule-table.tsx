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
import { PlusCircle, ChevronDown } from "lucide-react";
import { getColumns } from "./schedule-columns";
import { Doctor, Patient, OperationSchedule, OperatingRoom } from "@/lib/types";
import { ScheduleForm } from "./schedule-form";
import { ScheduleDetails } from "./schedule-details";
import { useToast } from "@/hooks/use-toast";

interface ScheduleTableProps {
  data: OperationSchedule[];
  doctors: Doctor[];
  patients: Patient[];
  operatingRooms: OperatingRoom[];
}

const MAX_VISIBLE_COLUMNS = 7;

type ProcessedSurgery = OperationSchedule & { patientName: string; doctorName: string; time: string; room: string; };

export function ScheduleTable({ data, doctors, patients, operatingRooms }: ScheduleTableProps) {
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    // Hide these by default
    anesthesiologist: false,
    anesthesia_type: false,
    assistant_surgeon: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedSurgery, setSelectedSurgery] = React.useState<ProcessedSurgery | null>(null);

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

  const handleViewDetails = (surgery: OperationSchedule) => {
    // Find the fully processed surgery object to pass to the details view
    const fullSurgeryDetails = processedData.find(p => p.id === surgery.id);
    setSelectedSurgery(fullSurgeryDetails || null);
    setIsDetailsOpen(true);
  };
  
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
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ''}
          onChange={(event) =>
            setGlobalFilter(event.target.value)
          }
          className="max-w-sm"
        />
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
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Schedule Operation
        </Button>
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
       <ScheduleForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        doctors={doctors}
        patients={patients}
      />
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
