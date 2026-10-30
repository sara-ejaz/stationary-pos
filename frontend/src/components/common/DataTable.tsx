import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Input } from './Input';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  itemsPerPage?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  filters,
  actions,
  itemsPerPage = 8,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search query or filters.',
  onRowClick
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();

    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = item[k as string];
          return val != null && String(val).toLowerCase().includes(q);
        });
      }
      // If no keys specified, search all primitive fields
      return Object.values(item).some((val) =>
        val != null && String(val).toLowerCase().includes(q)
      );
    });
  }, [data, searchQuery, searchKeys]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-[#0a2224] border border-[#143d41] rounded-xl overflow-hidden shadow-lg shadow-black/30">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#143d41] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#081b1d]">
        <div className="flex flex-1 items-center gap-3">
          <div className="w-full max-w-xs">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          {filters}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#8da5a7]">
          <thead className="text-xs uppercase bg-[#00272b] text-[#d4f1f4] border-b border-[#143d41]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3.5 font-semibold ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer hover:text-white select-none' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-[#007f87] text-xs">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#143d41]/60">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={item.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors hover:bg-[#0e2f33] ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 py-3.5 ${col.className || ''}`}>
                      {col.render ? col.render(item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 rounded-full bg-[#143d41]/40 text-[#59787a]">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-[#f2fbfa]">{emptyTitle}</p>
                    <p className="text-xs text-[#59787a] max-w-sm">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedData.length > 0 && (
        <div className="px-5 py-3.5 border-t border-[#143d41] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8da5a7] bg-[#081b1d]">
          <div>
            Showing{' '}
            <span className="font-semibold text-[#f2fbfa]">
              {Math.min(sortedData.length, (currentPage - 1) * itemsPerPage + 1)}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-[#f2fbfa]">
              {Math.min(sortedData.length, currentPage * itemsPerPage)}
            </span>{' '}
            of <span className="font-semibold text-[#f2fbfa]">{sortedData.length}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-[#143d41] hover:bg-[#003d40] text-[#8da5a7] hover:text-[#f2fbfa] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-[#d4f1f4]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-[#143d41] hover:bg-[#003d40] text-[#8da5a7] hover:text-[#f2fbfa] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
