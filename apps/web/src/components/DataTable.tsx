import type { ReactNode } from 'react'
import { Table, Td, Th } from '@/components/ui/table'

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty?: ReactNode
}

export function DataTable<T>({ columns, rows, rowKey, empty = 'Nothing here yet.' }: DataTableProps<T>) {
  return (
    <Table>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <Th key={i} className={c.className}>
              {c.header}
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <Td colSpan={columns.length} className="py-8 text-center text-muted-foreground">
              {empty}
            </Td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c, i) => (
                <Td key={i} className={c.className}>
                  {c.cell(row)}
                </Td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </Table>
  )
}
