import { CheckSquare, Download, FileSpreadsheet, Square, X } from 'lucide-react';
import React, { useState } from 'react';
import { SHEET_DEFINITIONS } from '../data/constants';

interface ExportSheetsModalProps {
  onClose: () => void;
  onExportSelected: (selectedIds: string[]) => void;
  onExportAll: () => void;
}

const CATEGORIES = [
  'Overview',
  'Detailed Design (DD)',
  'Engineering Packages',
  'Tests & Specs',
] as const;

const EXPORTABLE_SHEETS = SHEET_DEFINITIONS.filter((s) => s.id !== 'python_code');

export const ExportSheetsModal: React.FC<ExportSheetsModalProps> = ({
  onClose,
  onExportSelected,
  onExportAll,
}) => {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(EXPORTABLE_SHEETS.map((s) => s.id))
  );

  const totalCount = EXPORTABLE_SHEETS.length;
  const selectedCount = selected.size;
  const allSelected = selectedCount === totalCount;
  const noneSelected = selectedCount === 0;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategory = (category: string) => {
    const catSheets = EXPORTABLE_SHEETS.filter((s) => s.category === category);
    const allCatSelected = catSheets.every((s) => selected.has(s.id));
    setSelected((prev) => {
      const next = new Set(prev);
      catSheets.forEach((s) => {
        if (allCatSelected) next.delete(s.id);
        else next.add(s.id);
      });
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(EXPORTABLE_SHEETS.map((s) => s.id)));
  };

  const handleExportSelected = () => {
    if (noneSelected) return;
    onExportSelected(Array.from(selected));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Export Sheets</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose which sheets to include in the export
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick actions bar */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-100 bg-slate-50">
          <button
            onClick={toggleAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
          >
            {allSelected
              ? <CheckSquare className="h-3.5 w-3.5" />
              : <Square className="h-3.5 w-3.5" />}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{selectedCount}</span>
            {' '}of {totalCount} sheets selected
          </span>
        </div>

        {/* Sheet checklist */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {CATEGORIES.map((category) => {
            const catSheets = EXPORTABLE_SHEETS.filter((s) => s.category === category);
            if (catSheets.length === 0) return null;
            const allCatSelected = catSheets.every((s) => selected.has(s.id));
            const someCatSelected = catSheets.some((s) => selected.has(s.id));

            return (
              <div key={category}>
                {/* Category header with toggle */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 w-full mb-2 group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors whitespace-nowrap">
                    {category}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap transition-colors ${
                    allCatSelected
                      ? 'bg-sky-100 text-sky-700'
                      : someCatSelected
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {allCatSelected ? 'All selected' : someCatSelected ? 'Partial' : 'None'}
                  </span>
                </button>

                {/* Sheets */}
                <div className="space-y-1">
                  {catSheets.map((sheet) => {
                    const isChecked = selected.has(sheet.id);
                    return (
                      <label
                        key={sheet.id}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer border transition-all ${
                          isChecked
                            ? 'bg-sky-50 border-sky-200'
                            : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(sheet.id)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer shrink-0"
                        />
                        <FileSpreadsheet className={`h-3.5 w-3.5 shrink-0 ${isChecked ? 'text-sky-500' : 'text-slate-400'}`} />
                        <span className={`text-xs font-medium truncate ${isChecked ? 'text-sky-900' : 'text-slate-600'}`}>
                          {sheet.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50/60 rounded-b-xl">
          {/* Export All shortcut */}
          <button
            onClick={() => { onExportAll(); onClose(); }}
            className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            All 21 Sheets
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExportSelected}
              disabled={noneSelected}
              className="flex items-center gap-1.5 rounded-md bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" />
              Export Selected ({selectedCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
