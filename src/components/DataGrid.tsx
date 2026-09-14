import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit2,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ColumnDef, SheetDefinition } from '../types';

interface DataGridProps {
  sheetDef: SheetDefinition;
  data: any[];
  onUpdateRow: (rowId: string, updatedFields: Record<string, any>) => void;
  onAddRow: (newRow: Record<string, any>) => void;
  onDeleteRow: (rowId: string) => void;
  onExportSheet: () => void;
}

export const DataGrid: React.FC<DataGridProps> = ({
  sheetDef,
  data,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  onExportSheet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [subsystemFilter, setSubsystemFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState<Record<string, any>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRowState, setNewRowState] = useState<Record<string, any>>({});

  // Detect station and subsystem column keys
  const stationColKey = useMemo(() => {
    return sheetDef.columns.find((c) =>
      ['STATION NAME', 'Station Name', 'Location Name', 'Station/Location'].includes(c.label)
    )?.key;
  }, [sheetDef]);

  const subsystemColKey = useMemo(() => {
    return sheetDef.columns.find((c) =>
      ['TEL Sub-Systems', 'System', 'system code', 'System Code', 'Systems'].includes(c.label)
    )?.key;
  }, [sheetDef]);

  const statusColKey = useMemo(() => {
    return sheetDef.columns.find((c) =>
      ['Status with Systra', 'Systra Status', 'Status', 'Document status'].includes(c.label)
    )?.key;
  }, [sheetDef]);

  // Unique options for filters
  const stationOptions = useMemo(() => {
    if (!stationColKey) return [];
    const set = new Set<string>();
    data.forEach((r) => {
      if (r[stationColKey]) set.add(String(r[stationColKey]));
    });
    return Array.from(set).sort();
  }, [data, stationColKey]);

  const subsystemOptions = useMemo(() => {
    if (!subsystemColKey) return [];
    const set = new Set<string>();
    data.forEach((r) => {
      if (r[subsystemColKey]) set.add(String(r[subsystemColKey]));
    });
    return Array.from(set).sort();
  }, [data, subsystemColKey]);

  const statusOptions = useMemo(() => {
    if (!statusColKey) return [];
    const set = new Set<string>();
    data.forEach((r) => {
      if (r[statusColKey]) set.add(String(r[statusColKey]));
    });
    return Array.from(set).sort();
  }, [data, statusColKey]);

  // Filtered rows
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Station filter
      if (stationFilter !== 'ALL' && stationColKey && String(row[stationColKey]) !== stationFilter) {
        return false;
      }
      // Subsystem filter
      if (
        subsystemFilter !== 'ALL' &&
        subsystemColKey &&
        String(row[subsystemColKey]) !== subsystemFilter
      ) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && statusColKey && String(row[statusColKey]) !== statusFilter) {
        return false;
      }
      // Text search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return sheetDef.columns.some((col) => {
          const val = row[col.key];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
        });
      }
      return true;
    });
  }, [data, stationFilter, subsystemFilter, statusFilter, searchQuery, stationColKey, subsystemColKey, statusColKey, sheetDef]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Start row edit
  const handleStartEdit = (row: any) => {
    setEditingRowId(row.id);
    setEditFormState({ ...row });
  };

  // Save row edit
  const handleSaveEdit = (rowId: string) => {
    onUpdateRow(rowId, editFormState);
    setEditingRowId(null);
  };

  // Status Badge Formatter
  const renderStatusCell = (value: string) => {
    if (!value) return <span className="text-slate-400">-</span>;
    const str = String(value).toLowerCase();

    if (
      str.includes('approved') ||
      str.includes('closed') ||
      str.includes('code 2')
    ) {
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
          {value}
        </span>
      );
    }
    if (
      str.includes('review') ||
      str.includes('released to systra') ||
      str.includes('smo') ||
      str.includes('cjv')
    ) {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
          {value}
        </span>
      );
    }
    if (str.includes('rejected') || str.includes('code 3')) {
      return (
        <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
          {value}
        </span>
      );
    }
    if (str.includes('update') || str.includes('comments')) {
      return (
        <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200">
          {value}
        </span>
      );
    }
    if (str.includes('not submitted') || str.includes('on hold') || str.includes('did not')) {
      return (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
          {value}
        </span>
      );
    }

    return <span className="text-xs text-slate-700 font-medium">{value}</span>;
  };

  return (
    <div className="space-y-4" id={`datagrid-${sheetDef.id}`}>
      {/* Action and Filter Bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{sheetDef.name}</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {filteredData.length} records {filteredData.length !== data.length && `(filtered from ${data.length})`}
              </span>
            </div>
            <p className="text-xs text-slate-500">{sheetDef.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setNewRowState({});
                setIsAddModalOpen(true);
              }}
              id="btn-add-row"
              className="flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-sky-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Entry</span>
            </button>

            <button
              onClick={onExportSheet}
              id="btn-export-single-sheet"
              className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export Sheet (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4 pt-3 border-t border-slate-100">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search document no, title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Station Filter */}
          {stationOptions.length > 0 && (
            <select
              value={stationFilter}
              onChange={(e) => {
                setStationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Stations / Locations ({stationOptions.length})</option>
              {stationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {/* Subsystem Filter */}
          {subsystemOptions.length > 0 && (
            <select
              value={subsystemFilter}
              onChange={(e) => {
                setSubsystemFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Systems / Codes ({subsystemOptions.length})</option>
              {subsystemOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          {statusOptions.length > 0 && (
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Statuses ({statusOptions.length})</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full border-collapse text-left text-xs" id={`table-${sheetDef.id}`}>
            <thead className="sticky top-0 z-10 bg-slate-800 text-white shadow-xs">
              <tr className="border-b border-slate-700">
                <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-300 w-12 text-center">
                  #
                </th>
                {sheetDef.columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-200 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-300 text-center w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={sheetDef.columns.length + 2}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No matching records found for the active filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const isEditing = editingRowId === row.id;
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <tr
                      key={row.id || idx}
                      className={`group transition hover:bg-sky-50/40 ${
                        idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                      }`}
                    >
                      <td className="px-3 py-2 text-center text-[11px] font-mono text-slate-600 border-r border-slate-100">
                        {rowNumber}
                      </td>

                      {sheetDef.columns.map((col) => {
                        const cellVal = isEditing
                          ? editFormState[col.key] ?? ''
                          : row[col.key] ?? '';

                        // Special column styling
                        const isStatusCol = col.label.toLowerCase().includes('status');
                        const isDocNoCol = col.label.includes('No.') || col.label.includes('Doc');

                        return (
                          <td
                            key={col.key}
                            className={`px-3 py-2 text-xs border-r border-slate-100 ${
                              isDocNoCol ? 'font-mono text-[11px] font-medium text-slate-800' : 'text-slate-700'
                            }`}
                          >
                            {isEditing ? (
                              col.options ? (
                                <select
                                  value={editFormState[col.key] ?? ''}
                                  onChange={(e) =>
                                    setEditFormState({
                                      ...editFormState,
                                      [col.key]: e.target.value,
                                    })
                                  }
                                  className="w-full rounded border border-sky-400 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-hidden"
                                >
                                  {col.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={editFormState[col.key] ?? ''}
                                  onChange={(e) =>
                                    setEditFormState({
                                      ...editFormState,
                                      [col.key]: e.target.value,
                                    })
                                  }
                                  className="w-full rounded border border-sky-400 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-hidden"
                                />
                              )
                            ) : isStatusCol ? (
                              renderStatusCell(cellVal)
                            ) : (
                              <span>{cellVal || '-'}</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Actions */}
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSaveEdit(row.id)}
                              className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRowId(null)}
                              className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => handleStartEdit(row)}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-sky-600"
                              title="Edit Row"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteRow(row.id)}
                              className="rounded p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              title="Delete Row"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing{' '}
              <strong className="text-slate-900">
                {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900">
                {Math.min(currentPage * pageSize, filteredData.length)}
              </strong>{' '}
              of <strong className="text-slate-900">{filteredData.length}</strong> rows
            </span>

            <div className="flex items-center gap-1.5 ml-2">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-800"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-xs font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Row Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add New Record to {sheetDef.name}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3 pr-2">
              {sheetDef.columns.map((col) => (
                <div key={col.key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {col.label}
                  </label>
                  {col.options ? (
                    <select
                      value={newRowState[col.key] || ''}
                      onChange={(e) =>
                        setNewRowState({ ...newRowState, [col.key]: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-hidden"
                    >
                      <option value="">-- Select {col.label} --</option>
                      {col.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Enter ${col.label}...`}
                      value={newRowState[col.key] || ''}
                      onChange={(e) =>
                        setNewRowState({ ...newRowState, [col.key]: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-hidden"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onAddRow(newRowState);
                  setIsAddModalOpen(false);
                }}
                className="rounded-md bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-500"
              >
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
