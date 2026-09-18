import { CheckCircle2, Clock, FileSpreadsheet, Layers, ShieldAlert } from 'lucide-react';
import React from 'react';
import logo from '../assets/logo.png';

interface HeaderProps {
  totalDocs: number;
  totalSubmitted: number;
  underReview: number;
  approved: number;
  rejected: number;
}

export const Header: React.FC<HeaderProps> = ({
  totalDocs,
  totalSubmitted,
  underReview,
  approved,
  rejected,
}) => {
  const submittedPct = totalDocs ? Math.round((totalSubmitted / totalDocs) * 100) : 0;
  const approvedPct = totalDocs ? Math.round((approved / totalDocs) * 100) : 0;
  const rejectedPct = totalDocs ? Math.round((rejected / totalDocs) * 100) : 0;

  return (
    <header className="border-b border-slate-200 bg-white" id="main-header">
      {/* Top Banner */}
      <div className="bg-slate-900 px-6 py-4 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Egypt High Speed Rail Consortium"
              className="h-11 w-auto rounded-lg object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  High-Speed Rail (HSR) Engineering Document Tracker
                </h1>
                <span className="rounded bg-sky-950 px-2 py-0.5 text-xs font-semibold text-sky-400 border border-sky-800">
                  Green Line 1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                21 Stations • 19 Engineering Packages • Honeywell, CJV, Siemens (SMO) & Systra Transmittals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 rounded-md bg-slate-800/80 px-3 py-1.5 border border-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-200">System Live</span>
            </div>
            <div className="rounded-md bg-slate-800/80 px-3 py-1.5 border border-slate-700">
              <span className="text-slate-400">Transmittal Cycle: </span>
              <span className="font-semibold text-white">Batch 01 Baseline</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-3 px-6 py-4 sm:grid-cols-3 lg:grid-cols-5 bg-slate-50/70">
        {/* Total Documents */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs" id="kpi-total-docs">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
              Total Documents
            </div>
            <div className="text-2xl font-black text-slate-900">{totalDocs.toLocaleString()}</div>
            <div className="text-[11px] text-slate-700">1st Batch Baseline</div>
          </div>
          <div className="rounded-md bg-slate-100 p-2 text-slate-600">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        {/* Submitted from HNWL */}
        <div className="flex items-center justify-between rounded-lg border border-sky-200 bg-sky-50/40 p-3.5 shadow-xs" id="kpi-submitted-hnwl">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-800">
              Submitted from HNWL
            </div>
            <div className="text-2xl font-black text-sky-900">{totalSubmitted.toLocaleString()}</div>
            <div className="text-[11px] font-medium text-sky-800">{submittedPct}% Submission Rate</div>
          </div>
          <div className="rounded-md bg-sky-100 p-2 text-sky-700">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </div>

        {/* Under Systra Review */}
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/40 p-3.5 shadow-xs" id="kpi-under-review">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
              Under Systra Review
            </div>
            <div className="text-2xl font-black text-amber-900">{underReview.toLocaleString()}</div>
            <div className="text-[11px] font-medium text-amber-800">Active Transmittals</div>
          </div>
          <div className="rounded-md bg-amber-100 p-2 text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Approved by Systra */}
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/40 p-3.5 shadow-xs" id="kpi-approved-systra">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
              Approved with Comments
            </div>
            <div className="text-2xl font-black text-emerald-900">{approved.toLocaleString()}</div>
            <div className="text-[11px] font-medium text-emerald-800">{approvedPct}% Code 2 Approval</div>
          </div>
          <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Rejected Code 3 */}
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50/40 p-3.5 shadow-xs col-span-2 sm:col-span-1" id="kpi-rejected-systra">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-800">
              Rejected (Code 3)
            </div>
            <div className="text-2xl font-black text-rose-900">{rejected.toLocaleString()}</div>
            <div className="text-[11px] font-medium text-rose-800">{rejectedPct}% Rejection Rate</div>
          </div>
          <div className="rounded-md bg-rose-100 p-2 text-rose-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
