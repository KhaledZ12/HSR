import {
  BookOpen,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  Search,
  Train,
  Upload,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { SHEET_DEFINITIONS } from '../data/constants';
import { SheetId } from '../types';

interface SidebarProps {
  activeSheet: SheetId;
  onSelectSheet: (id: SheetId) => void;
  onExportMasterWorkbook: () => void;
  onOpenUploadModal: () => void;
  sheetsRowCounts: Record<string, number>;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSheet,
  onSelectSheet,
  onExportMasterWorkbook,
  onOpenUploadModal,
  sheetsRowCounts,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSheets = SHEET_DEFINITIONS.filter(
    (sheet) =>
      sheet.id !== 'python_code' &&
      (sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sheet.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = [
    'Overview',
    'Detailed Design (DD)',
    'Engineering Packages',
    'Tests & Specs',
  ] as const;

  const getSheetIcon = (id: SheetId) => {
    switch (id) {
      case 'conclusion':
        return <LayoutDashboard className="h-4 w-4" />;
      case 'reference':
        return <BookOpen className="h-4 w-4" />;
      case 'ict_stations':
      case 'elv_stations':
      case 'provision_drawings':
        return <Train className="h-4 w-4" />;
      default:
        return <FileSpreadsheet className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-slate-800 bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto shrink-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        id="app-sidebar"
      >
        {/* Brand & Project Info */}
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={logo}
                alt="Egypt High Speed Rail Consortium"
                className="h-9 w-auto rounded-lg object-contain"
              />
              <div>
                <div className="text-sm font-bold tracking-tight text-white">Egypt High-Speed Rail</div>
                <div className="text-[11px] text-slate-400">Green Line (Ain Sokhna - Matrouh)</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        {/* Global Export & Import Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={onExportMasterWorkbook}
            id="btn-export-master"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500 active:scale-[0.98]"
            title="Download formatted Excel file with all 21 sheets"
          >
            <Download className="h-4 w-4" />
            <span>Export Master Workbook (.xlsx)</span>
          </button>
          <button
            onClick={onOpenUploadModal}
            id="btn-import-excel"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 shadow-xs transition hover:bg-slate-700 hover:text-white active:scale-[0.98]"
            title="Import an Excel file to sync data into Firestore"
          >
            <Upload className="h-4 w-4 text-sky-400" />
            <span>Import Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Sheet Search */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter sheets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800/80 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Sheets Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {categories.map((category) => {
          const catSheets = filteredSheets.filter((s) => s.category === category);
          if (catSheets.length === 0) return null;

          return (
            <div key={category} className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {category}
              </div>
              <div className="space-y-0.5">
                {catSheets.map((sheet) => {
                  const isActive = activeSheet === sheet.id;
                  const rowCount = sheetsRowCounts[sheet.id] ?? 0;

                  return (
                    <button
                      key={sheet.id}
                      onClick={() => {
                        onSelectSheet(sheet.id);
                        onCloseMobile?.();
                      }}
                      id={`nav-${sheet.id}`}
                      className={`group flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium transition ${
                        isActive
                          ? 'bg-sky-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}>
                          {getSheetIcon(sheet.id)}
                        </span>
                        <span className="truncate">{sheet.name}</span>
                      </div>

                      {sheet.id !== 'conclusion' && rowCount > 0 && (
                        <span
                          className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            isActive
                              ? 'bg-sky-700 text-sky-100'
                              : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                          }`}
                        >
                          {rowCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  </>
  );
};
