import { CheckCircle2, Clock, FileSpreadsheet, Layers, Menu, ShieldAlert } from 'lucide-react';
import React from 'react';
import logo from '../assets/logo.png';

interface HeaderProps {
  totalDocs: number;
  totalSubmitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalDocs,
  totalSubmitted,
  underReview,
  approved,
  rejected,
  onToggleMobileSidebar,
}) => {
  const submittedPct = totalDocs ? Math.round((totalSubmitted / totalDocs) * 100) : 0;
  const approvedPct = totalDocs ? Math.round((approved / totalDocs) * 100) : 0;
  const rejectedPct = totalDocs ? Math.round((rejected / totalDocs) * 100) : 0;

  return (
    <header className="border-b border-slate-200 bg-white" id="main-header">
      {/* Top Banner */}
      <div className="bg-slate-900 px-3 py-3 sm:px-6 sm:py-4 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden -ml-1 rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <img
              src={logo}
              alt="Egypt High Speed Rail Consortium"
              className="h-8 sm:h-11 w-auto rounded-lg object-contain shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white leading-tight">
                  High-Speed Rail Document Tracker
                </h1>
                <span className="rounded bg-sky-950 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-sky-400 border border-sky-800 whitespace-nowrap">
                  Green Line 1
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate sm:whitespace-normal">
                21 Stations • 19 Engineering Packages • Honeywell, CJV, Siemens (SMO) &amp; Systra
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2.5 py-1 sm:px-3 sm:py-1.5 border border-slate-700 text-[11px] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-200">System Live</span>
            </div>
            <div className="rounded-md bg-slate-800/80 px-2.5 py-1 sm:px-3 sm:py-1.5 border border-slate-700 text-[11px] sm:text-xs">
              <span className="text-slate-400">Transmittal Cycle: </span>
              <span className="font-semibold text-white">Batch 01 Baseline</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards - Horizontally scrollable on mobile, grid on tablet/desktop */}
      <div className="flex overflow-x-auto gap-2.5 px-3 py-2.5 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-3 sm:px-6 sm:py-4 bg-slate-50/70 border-b border-slate-200/60 snap-x">
        {/* Total Documents */}
        <div className="flex min-w-[200px] shrink-0 sm:min-w-0 sm:shrink snap-start items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3.5 shadow-xs" id="kpi-total-docs">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-700 truncate">
              Total Documents
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{totalDocs.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-700 truncate">1st Batch Baseline</div>
          </div>
          <div className="rounded-md bg-slate-100 p-1.5 sm:p-2 text-slate-600 shrink-0 ml-2">
            <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Submitted from HNWL */}
        <div className="flex min-w-[200px] shrink-0 sm:min-w-0 sm:shrink snap-start items-center justify-between rounded-lg border border-sky-200 bg-sky-50/40 p-2.5 sm:p-3.5 shadow-xs" id="kpi-submitted-hnwl">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-sky-800 truncate">
              Submitted from HNWL
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-900">{totalSubmitted.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] font-medium text-sky-800 truncate">{submittedPct}% Submission Rate</div>
          </div>
          <div className="rounded-md bg-sky-100 p-1.5 sm:p-2 text-sky-700 shrink-0 ml-2">
            <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Under Systra Review */}
        <div className="flex min-w-[200px] shrink-0 sm:min-w-0 sm:shrink snap-start items-center justify-between rounded-lg border border-amber-200 bg-amber-50/40 p-2.5 sm:p-3.5 shadow-xs" id="kpi-under-review">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-amber-800 truncate">
              Under Systra Review
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-900">{underReview.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] font-medium text-amber-800 truncate">Active Transmittals</div>
          </div>
          <div className="rounded-md bg-amber-100 p-1.5 sm:p-2 text-amber-700 shrink-0 ml-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Approved by Systra */}
        <div className="flex min-w-[200px] shrink-0 sm:min-w-0 sm:shrink snap-start items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5 sm:p-3.5 shadow-xs" id="kpi-approved-systra">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-emerald-800 truncate">
              Approved with Comments
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900">{approved.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] font-medium text-emerald-800 truncate">{approvedPct}% Code 2 Approval</div>
          </div>
          <div className="rounded-md bg-emerald-100 p-1.5 sm:p-2 text-emerald-700 shrink-0 ml-2">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Rejected Code 3 */}
        <div className="flex min-w-[200px] shrink-0 sm:min-w-0 sm:shrink snap-start col-span-2 sm:col-span-1 items-center justify-between rounded-lg border border-rose-200 bg-rose-50/40 p-2.5 sm:p-3.5 shadow-xs" id="kpi-rejected-systra">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-rose-800 truncate">
              Rejected (Code 3)
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-900">{rejected.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] font-medium text-rose-800 truncate">{rejectedPct}% Rejection Rate</div>
          </div>
          <div className="rounded-md bg-rose-100 p-1.5 sm:p-2 text-rose-700 shrink-0 ml-2">
            <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
