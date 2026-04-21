import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { Volunteer } from '@/types'
import { ArrowUpDown } from 'lucide-react'
import SkillBadge from './SkillBadge'
import StatusBadge from './StatusBadge'
import ReliabilityScore from './ReliabilityScore'
import { Skeleton } from './Skeleton'

interface VolunteerTableProps {
  data: Volunteer[]
  isLoading: boolean
  onViewProfile: (volunteer: Volunteer) => void
}

export default function VolunteerTable({
  data,
  isLoading,
  onViewProfile,
}: VolunteerTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo(
    () => [
      {
        id: 'name',
        header: ({ column }: any) => (
          <button
            className="flex items-center gap-2 hover:text-action transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-action rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {row.original.avatarInitials}
            </div>
            <span className="font-medium text-text-primary">{row.original.name}</span>
          </div>
        ),
        accessorKey: 'name',
        enableSorting: true,
      },
      {
        id: 'skills',
        header: 'Skills',
        cell: ({ row }: any) => (
          <div className="flex flex-wrap gap-1">
            {row.original.skills.slice(0, 2).map((skill: string) => (
              <SkillBadge key={skill} skill={skill} />
            ))}
            {row.original.skills.length > 2 && (
              <span className="text-xs text-text-muted">
                +{row.original.skills.length - 2}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'distance',
        header: ({ column }: any) => (
          <button
            className="flex items-center gap-2 hover:text-action transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Distance
            <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row }: any) => (
          <span className="text-text-primary">{row.original.distance} km</span>
        ),
        accessorKey: 'distance',
        enableSorting: true,
      },
      {
        id: 'reliability',
        header: 'Reliability',
        cell: ({ row }: any) => (
          <ReliabilityScore score={row.original.reliabilityScore} />
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => (
          <button
            onClick={() => onViewProfile(row.original)}
            className="text-action hover:text-blue-400 font-medium text-sm transition-colors"
          >
            View Profile
          </button>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: isLoading ? Array(5).fill(null) : data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left px-6 py-3 text-sm font-semibold text-text-muted"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border hover:bg-hover transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 text-sm">
                  {isLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
