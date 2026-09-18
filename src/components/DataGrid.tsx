import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit2,
  Filter,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ColumnDef, SheetDefinition } from '../types';
import {
  DOC_THROUGH_WF_STATUS,
  STATUS_WITH_HONEYWELL,
  STATUS_WITH_SYSTRA,
} from '../data/constants';

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

  // Edit modal state
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [editFormState, setEditFormState] = useState<Record<string, any>>({});

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRowState, setNewRowState] = useState<Record<string, any>>({});

  // Dynamic custom statuses added by user during the session
  const [customStatuses, setCustomStatuses] = useState<string[]>([]);
  // Tracking which field is in "+ Add New Status" mode (fieldKey: string -> boolean)
  const [newStatusMode, setNewStatusMode] = useState<Record<string, boolean>>({});

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

  // For technical_rooms: automatically forward-fill station name so rows belonging to a station (e.g. New Capital) never show '-'
  const normalizedData = useMemo(() => {
    if (sheetDef.id !== 'technical_rooms' || !stationColKey) return data;
    let lastStation = '';
    return data.map((row) => {
      const s = String(row[stationColKey] ?? '').trim();
      if (s && s !== '-') {
        lastStation = s;
        return row;
      }
      if (lastStation && (!s || s === '-')) {
        return { ...row, [stationColKey]: lastStation };
      }
      return row;
    });
  }, [data, sheetDef.id, stationColKey]);

  // Unique options for filters
  const stationOptions = useMemo(() => {
    if (!stationColKey) return [];
    const set = new Set<string>();
    normalizedData.forEach((r) => {
      const val = r[stationColKey];
      if (val && val !== '-') set.add(String(val));
    });
    return Array.from(set).sort();
  }, [normalizedData, stationColKey]);

  const subsystemOptions = useMemo(() => {
    if (!subsystemColKey) return [];
    const set = new Set<string>();
    normalizedData.forEach((r) => {
      if (r[subsystemColKey]) set.add(String(r[subsystemColKey]));
    });
    return Array.from(set).sort();
  }, [normalizedData, subsystemColKey]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    if (statusColKey) {
      const colDef = sheetDef.columns.find((c) => c.key === statusColKey);
      if (colDef?.options) {
        colDef.options.forEach((opt) => set.add(opt));
      }
    }
    normalizedData.forEach((r) => {
      if (statusColKey && r[statusColKey]) {
        let val = String(r[statusColKey]).trim();
        if (val && val !== '-') {
          if (val.toLowerCase() === 'approved with comments') {
            val = 'Approved with Comments';
          }
          set.add(val);
        }
      }
    });
    // Add all user-created custom statuses
    customStatuses.forEach((s) => {
      if (s && s.trim()) set.add(s.trim());
    });
    return Array.from(set).sort();
  }, [normalizedData, statusColKey, sheetDef.columns, customStatuses]);

  // Filtered rows
  const filteredData = useMemo(() => {
    return normalizedData.filter((row) => {
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
      if (statusFilter !== 'ALL' && statusColKey) {
        let rowStatus = String(row[statusColKey]);
        if (rowStatus.toLowerCase() === 'approved with comments') {
          rowStatus = 'Approved with Comments';
        }
        if (rowStatus !== statusFilter) {
          return false;
        }
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
  }, [normalizedData, stationFilter, subsystemFilter, statusFilter, searchQuery, stationColKey, subsystemColKey, statusColKey, sheetDef]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Compute row spans for the station column ONLY in technical_rooms
  const groupedSpans = useMemo<{ isGroupStart: boolean; rowSpan: number }[]>(() => {
    if (sheetDef.id !== 'technical_rooms' || !stationColKey) {
      return paginatedData.map(() => ({ isGroupStart: true, rowSpan: 1 }));
    }
    const result: { isGroupStart: boolean; rowSpan: number }[] = [];
    let i = 0;
    while (i < paginatedData.length) {
      const stationVal = String(paginatedData[i][stationColKey] ?? '').trim();
      if (!stationVal) {
        result.push({ isGroupStart: true, rowSpan: 1 });
        i++;
        continue;
      }
      let span = 1;
      while (
        i + span < paginatedData.length &&
        String(paginatedData[i + span][stationColKey] ?? '').trim() === stationVal
      ) {
        span++;
      }
      result.push({ isGroupStart: true, rowSpan: span });
      for (let j = 1; j < span; j++) result.push({ isGroupStart: false, rowSpan: 0 });
      i += span;
    }
    return result;
  }, [paginatedData, stationColKey, sheetDef.id]);

  // For technical_rooms, compute spans for statusSystra so consecutive rows with the same status in the same station are merged
  const statusSystraSpans = useMemo<{ isStart: boolean; span: number }[]>(() => {
    if (sheetDef.id !== 'technical_rooms') {
      return paginatedData.map(() => ({ isStart: true, span: 1 }));
    }
    const result: { isStart: boolean; span: number }[] = [];
    let i = 0;
    while (i < paginatedData.length) {
      const statusVal = String(paginatedData[i]['statusSystra'] ?? '').trim();
      const stationVal = String(paginatedData[i]['station'] ?? '').trim();

      if (!statusVal) {
        result.push({ isStart: true, span: 1 });
        i++;
        continue;
      }

      let span = 1;
      while (
        i + span < paginatedData.length &&
        String(paginatedData[i + span]['station'] ?? '').trim() === stationVal &&
        String(paginatedData[i + span]['statusSystra'] ?? '').trim() === statusVal
      ) {
        span++;
      }
      result.push({ isStart: true, span });
      for (let j = 1; j < span; j++) {
        result.push({ isStart: false, span: 0 });
      }
      i += span;
    }
    return result;
  }, [paginatedData, sheetDef.id]);

  // Dynamically computed options for dropdowns in Edit and Add modals
  const getColumnOptions = (col: ColumnDef): string[] => {
    const optionsSet = new Set<string>();
    const isStatusField =
      col.label.toLowerCase().includes('status') ||
      col.key.toLowerCase().includes('status');

    // 1. Column predefined options
    if (col.options) {
      col.options.forEach((opt) => optionsSet.add(opt));
    }

    // 2. Default status options from constants
    if (isStatusField) {
      if (
        col.key === 'statusHoneywell' ||
        col.label.toLowerCase().includes('hnwl') ||
        col.label.toLowerCase().includes('honeywell')
      ) {
        STATUS_WITH_HONEYWELL.forEach((o) => optionsSet.add(o));
      } else if (
        col.key === 'smoStatus' ||
        col.key === 'docWfStatus' ||
        col.label.toLowerCase().includes('smo') ||
        col.label.toLowerCase().includes('wf')
      ) {
        DOC_THROUGH_WF_STATUS.forEach((o) => optionsSet.add(o));
      } else {
        STATUS_WITH_SYSTRA.forEach((o) => optionsSet.add(o));
      }
    }

    // 3. Existing distinct values from normalized data
    normalizedData.forEach((r) => {
      const val = r[col.key];
      if (val && String(val).trim() !== '-' && String(val).trim() !== '') {
        optionsSet.add(String(val).trim());
      }
    });

    // 4. Custom statuses added during the session
    if (isStatusField) {
      customStatuses.forEach((s) => {
        if (s && s.trim()) optionsSet.add(s.trim());
      });
    }

    return Array.from(optionsSet).filter(Boolean).sort();
  };

  // Open edit popup
  const handleStartEdit = (row: any) => {
    setEditingRow(row);
    setEditFormState({ ...row });
    setNewStatusMode({});
  };

  // Save edit popup
  const handleSaveEdit = () => {
    if (!editingRow) return;
    sheetDef.columns.forEach((col) => {
      const isStatusField =
        col.label.toLowerCase().includes('status') ||
        col.key.toLowerCase().includes('status');
      if (isStatusField) {
        const val = String(editFormState[col.key] || '').trim();
        if (val && val !== '-' && val !== '__ADD_NEW__') {
          setCustomStatuses((prev) => Array.from(new Set([...prev, val])));
        }
      }
    });
    onUpdateRow(editingRow.id, editFormState);
    setEditingRow(null);
    setNewStatusMode({});
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
            <thead
              className={`sticky top-0 z-10 shadow-xs ${
                sheetDef.id === 'technical_rooms'
                  ? 'bg-[#8eaadb] text-slate-900 border-b border-[#6c8ebf]'
                  : 'bg-slate-800 text-white'
              }`}
            >
              <tr className={sheetDef.id === 'technical_rooms' ? 'border-b border-[#6c8ebf]' : 'border-b border-slate-700'}>
                <th className={`px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] w-12 text-center ${
                  sheetDef.id === 'technical_rooms' ? 'text-slate-800 border-r border-[#6c8ebf]/40' : 'text-slate-300'
                }`}>
                  #
                </th>
                {sheetDef.columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap ${
                      sheetDef.id === 'technical_rooms'
                        ? 'text-slate-900 border-r border-[#6c8ebf]/40'
                        : 'text-slate-200'
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className={`px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] text-center w-20 ${
                  sheetDef.id === 'technical_rooms' ? 'text-slate-800' : 'text-slate-300'
                }`}>
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
                  const isTechnicalRooms = sheetDef.id === 'technical_rooms';
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                  const { isGroupStart, rowSpan } = isTechnicalRooms
                    ? (groupedSpans[idx] || { isGroupStart: true, rowSpan: 1 })
                    : { isGroupStart: true, rowSpan: 1 };
                  const isGroupBorder = isTechnicalRooms && isGroupStart && idx > 0;

                  return (
                    <tr
                      key={row.id || idx}
                      className={`group transition hover:bg-sky-50/40 ${
                        isTechnicalRooms
                          ? (isGroupStart
                              ? (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')
                              : (groupedSpans.slice(0, idx).filter((g) => g.isGroupStart).length % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'))
                          : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')
                      } ${isGroupBorder ? 'border-t-2 border-t-slate-300' : ''}`}
                    >
                      <td className="px-3 py-2 text-center text-[11px] font-mono text-slate-600 border-r border-slate-100">
                        {rowNumber}
                      </td>

                      {sheetDef.columns.map((col) => {
                        const isStationCol = col.key === stationColKey;

                        // Station column: custom merged cell ONLY for technical_rooms
                        if (isStationCol) {
                          if (isTechnicalRooms) {
                            if (!isGroupStart) return null;
                            const stationVal = String(row[col.key] ?? '');
                            return (
                              <td
                                key={col.key}
                                rowSpan={rowSpan}
                                className="px-4 py-3 text-xs border-r-2 border-slate-300 font-bold text-slate-900 bg-slate-50 align-middle text-center"
                                style={col.width ? { minWidth: col.width } : {}}
                              >
                                <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                                  <span className="font-bold text-slate-900 text-sm tracking-tight">{stationVal || '-'}</span>
                                  {rowSpan > 1 && (
                                    <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800 border border-sky-200">
                                      {rowSpan} rooms
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          }
                          // All other sheets: standard station column cell
                          const stationVal = String(row[col.key] ?? '');
                          return (
                            <td
                              key={col.key}
                              className="px-3 py-2 text-xs border-r border-slate-100 font-medium text-slate-800"
                              style={col.width ? { minWidth: col.width } : {}}
                            >
                              <span>{stationVal || '-'}</span>
                            </td>
                          );
                        }

                        const cellVal = row[col.key] ?? '';
                        const isStatusCol = col.label.toLowerCase().includes('status');
                        const isDocNoCol = col.label.includes('No.') || col.label.includes('Doc');

                        // Custom Excel styling for Technical Rooms
                        if (sheetDef.id === 'technical_rooms') {
                          if (col.key === 'statusSystra') {
                            const { isStart, span } = statusSystraSpans[idx] || { isStart: true, span: 1 };
                            if (!isStart) return null;
                            const isApproved = String(cellVal).toLowerCase().includes('approved');
                            return (
                              <td
                                key={col.key}
                                rowSpan={span}
                                className={`px-3 py-2 text-xs border-r border-slate-200 align-middle text-center ${
                                  isApproved && cellVal
                                    ? 'bg-[#6bb747] text-white font-semibold shadow-2xs'
                                    : cellVal
                                    ? 'bg-amber-50 text-amber-900 font-medium'
                                    : 'text-slate-400'
                                }`}
                                style={col.width ? { minWidth: col.width } : {}}
                              >
                                {cellVal || '-'}
                              </td>
                            );
                          }

                          if (col.key === 'cjvRemarks' && cellVal) {
                            return (
                              <td
                                key={col.key}
                                className="px-3 py-2 text-xs border-r border-slate-200 bg-[#fff59d] text-amber-950 font-medium align-middle"
                                style={col.width ? { minWidth: col.width } : {}}
                              >
                                {cellVal}
                              </td>
                            );
                          }

                          if (col.key === 'statusHoneywell' && cellVal) {
                            return (
                              <td
                                key={col.key}
                                className="px-3 py-2 text-xs border-r border-slate-200 align-middle text-center"
                                style={col.width ? { minWidth: col.width } : {}}
                              >
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  String(cellVal).toLowerCase().includes('not submitted')
                                    ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                    : String(cellVal).toLowerCase().includes('update')
                                    ? 'bg-sky-50 text-sky-800 border border-sky-200 font-semibold'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {cellVal}
                                </span>
                              </td>
                            );
                          }

                          if (col.key === 'wfNo') {
                            return (
                              <td
                                key={col.key}
                                className="px-3 py-2 text-xs font-mono border-r border-slate-200 align-middle text-center text-slate-800 font-medium"
                                style={col.width ? { minWidth: col.width } : {}}
                              >
                                {cellVal || '-'}
                              </td>
                            );
                          }

                          if (col.key === 'plannedSubmissionDate' || col.key === 'officialAconexReview' || col.key === 'officialAconexRelease' || col.key === 'dateSystraResponse') {
                            return (
                              <td
                                key={col.key}
                                className="px-3 py-2 text-xs border-r border-slate-200 align-middle text-center text-slate-800"
                                style={col.width ? { minWidth: col.width } : {}}
                              >
                                {cellVal || '-'}
                              </td>
                            );
                          }
                        }

                        return (
                          <td
                            key={col.key}
                            className={`px-3 py-2 text-xs border-r border-slate-100 ${
                              isDocNoCol ? 'font-mono text-[11px] font-medium text-slate-800' : 'text-slate-700'
                            }`}
                            style={col.width ? { minWidth: col.width } : {}}
                          >
                            {isStatusCol ? (
                              renderStatusCell(cellVal)
                            ) : (
                              <span>{cellVal || '-'}</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Actions */}
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => handleStartEdit(row)}
                            className="rounded p-1 text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                            title="Edit Row"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRow(row.id)}
                            className="rounded p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
                <option value={500}>All</option>
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

      {/* ── Edit Row Modal ── */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Record</h3>
                <p className="text-xs text-slate-500 mt-0.5">{sheetDef.name}</p>
              </div>
              <button
                onClick={() => setEditingRow(null)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sheetDef.columns.map((col) => {
                  const isStatusField =
                    col.label.toLowerCase().includes('status') ||
                    col.key.toLowerCase().includes('status');
                  const hasOptions = !!col.options || isStatusField;
                  const options = hasOptions ? getColumnOptions(col) : [];
                  const fieldKey = `edit_${col.key}`;
                  const isNewMode = !!newStatusMode[fieldKey];

                  return (
                    <div key={col.key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <span>{col.label}</span>
                          {isStatusField && isNewMode && (
                            <span className="text-[10px] rounded bg-sky-100 px-1.5 py-0.5 text-sky-700 font-medium">
                              New Status
                            </span>
                          )}
                        </label>
                        {isStatusField && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewStatusMode((prev) => ({
                                ...prev,
                                [fieldKey]: !prev[fieldKey],
                              }));
                            }}
                            className="text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-0.5"
                          >
                            {isNewMode ? '← Select from list' : '+ Add new'}
                          </button>
                        )}
                      </div>

                      {isStatusField && isNewMode ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder={`Type new ${col.label.toLowerCase()}...`}
                            value={editFormState[col.key] ?? ''}
                            onChange={(e) =>
                              setEditFormState({ ...editFormState, [col.key]: e.target.value })
                            }
                            className="flex-1 rounded-md border border-sky-400 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = String(editFormState[col.key] || '').trim();
                              if (val) {
                                setCustomStatuses((prev) => Array.from(new Set([...prev, val])));
                              }
                              setNewStatusMode((prev) => ({ ...prev, [fieldKey]: false }));
                            }}
                            className="rounded-md bg-sky-600 px-2.5 py-2 text-xs font-semibold text-white hover:bg-sky-500 shadow-2xs transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      ) : hasOptions ? (
                        <select
                          value={editFormState[col.key] ?? ''}
                          onChange={(e) => {
                            if (e.target.value === '__ADD_NEW__') {
                              setNewStatusMode((prev) => ({ ...prev, [fieldKey]: true }));
                              setEditFormState({ ...editFormState, [col.key]: '' });
                            } else {
                              setEditFormState({ ...editFormState, [col.key]: e.target.value });
                            }
                          }}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="">-- Select {col.label} --</option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                          {isStatusField && (
                            <option value="__ADD_NEW__" className="text-sky-600 font-semibold">
                              + Add New Status...
                            </option>
                          )}
                        </select>
                      ) : (
                        <input
                          type={col.type === 'date' ? 'date' : 'text'}
                          value={editFormState[col.key] ?? ''}
                          onChange={(e) =>
                            setEditFormState({ ...editFormState, [col.key]: e.target.value })
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4 bg-slate-50/60 rounded-b-xl">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 rounded-md bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-500 transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add New Row Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add New Record</h3>
                <p className="text-xs text-slate-500 mt-0.5">{sheetDef.name}</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sheetDef.columns.map((col) => {
                  const isStatusField =
                    col.label.toLowerCase().includes('status') ||
                    col.key.toLowerCase().includes('status');
                  const hasOptions = !!col.options || isStatusField;
                  const options = hasOptions ? getColumnOptions(col) : [];
                  const fieldKey = `add_${col.key}`;
                  const isNewMode = !!newStatusMode[fieldKey];

                  return (
                    <div key={col.key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <span>{col.label}</span>
                          {isStatusField && isNewMode && (
                            <span className="text-[10px] rounded bg-sky-100 px-1.5 py-0.5 text-sky-700 font-medium">
                              New Status
                            </span>
                          )}
                        </label>
                        {isStatusField && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewStatusMode((prev) => ({
                                ...prev,
                                [fieldKey]: !prev[fieldKey],
                              }));
                            }}
                            className="text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-0.5"
                          >
                            {isNewMode ? '← Select from list' : '+ Add new'}
                          </button>
                        )}
                      </div>

                      {isStatusField && isNewMode ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder={`Type new ${col.label.toLowerCase()}...`}
                            value={newRowState[col.key] || ''}
                            onChange={(e) =>
                              setNewRowState({ ...newRowState, [col.key]: e.target.value })
                            }
                            className="flex-1 rounded-md border border-sky-400 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = String(newRowState[col.key] || '').trim();
                              if (val) {
                                setCustomStatuses((prev) => Array.from(new Set([...prev, val])));
                              }
                              setNewStatusMode((prev) => ({ ...prev, [fieldKey]: false }));
                            }}
                            className="rounded-md bg-sky-600 px-2.5 py-2 text-xs font-semibold text-white hover:bg-sky-500 shadow-2xs transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      ) : hasOptions ? (
                        <select
                          value={newRowState[col.key] || ''}
                          onChange={(e) => {
                            if (e.target.value === '__ADD_NEW__') {
                              setNewStatusMode((prev) => ({ ...prev, [fieldKey]: true }));
                              setNewRowState({ ...newRowState, [col.key]: '' });
                            } else {
                              setNewRowState({ ...newRowState, [col.key]: e.target.value });
                            }
                          }}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="">-- Select {col.label} --</option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                          {isStatusField && (
                            <option value="__ADD_NEW__" className="text-sky-600 font-semibold">
                              + Add New Status...
                            </option>
                          )}
                        </select>
                      ) : (
                        <input
                          type={col.type === 'date' ? 'date' : 'text'}
                          placeholder={`Enter ${col.label}...`}
                          value={newRowState[col.key] || ''}
                          onChange={(e) =>
                            setNewRowState({ ...newRowState, [col.key]: e.target.value })
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4 bg-slate-50/60 rounded-b-xl">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  sheetDef.columns.forEach((col) => {
                    const isStatusField =
                      col.label.toLowerCase().includes('status') ||
                      col.key.toLowerCase().includes('status');
                    if (isStatusField) {
                      const val = String(newRowState[col.key] || '').trim();
                      if (val && val !== '-' && val !== '__ADD_NEW__') {
                        setCustomStatuses((prev) => Array.from(new Set([...prev, val])));
                      }
                    }
                  });
                  onAddRow(newRowState);
                  setIsAddModalOpen(false);
                  setNewRowState({});
                  setNewStatusMode({});
                }}
                className="flex items-center gap-1.5 rounded-md bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-500 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
