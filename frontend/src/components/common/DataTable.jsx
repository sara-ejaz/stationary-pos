import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Input } from './Input';

export function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  filters,
  actions,
  itemsPerPage = 8,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search query or filters.',
  onRowClick
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  // Filtered data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();

    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = item[k];
          return val != null && String(val).toLowerCase().includes(q);
        });
      }
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

  const handleSort = (key) => {
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/60">
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
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="text-xs uppercase bg-slate-100/80 text-slate-700 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3.5 font-semibold ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer hover:text-slate-900 select-none' : ''
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
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={item.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors hover:bg-teal-50/40 ${
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
                    <div className="p-3 rounded-full bg-slate-100 text-slate-400">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{emptyTitle}</p>
                    <p className="text-xs text-slate-500 max-w-sm">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedData.length > 0 && (
        <div className="px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/60">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(sortedData.length, (currentPage - 1) * itemsPerPage + 1)}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(sortedData.length, currentPage * itemsPerPage)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{sortedData.length}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-[#007f87]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default DataTable;
