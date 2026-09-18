import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  PieChart,
  ShieldCheck,
} from 'lucide-react';
import React from 'react';
import { ConclusionRow } from '../types';

interface ConclusionDashboardProps {
  conclusionRows: ConclusionRow[];
  provisionSummary: {
    underHnwlUpdated: number;
    underCjvReview: number;
    underSystraReview: number;
    closedWithSystra: number;
    notSubmitted: number;
  };
  onExportConclusion: () => void;
}

export const ConclusionDashboard: React.FC<ConclusionDashboardProps> = ({
  conclusionRows,
  provisionSummary,
  onExportConclusion,
}) => {
  // Compute Grand Total Row
  const totalRow = conclusionRows.reduce(
    (acc, cur) => ({
      totalDocs: acc.totalDocs + cur.totalDocs,
      submittedHnwl: acc.submittedHnwl + cur.submittedHnwl,
      notSubmittedHnwl: acc.notSubmittedHnwl + cur.notSubmittedHnwl,
      underHnwlUpdate: acc.underHnwlUpdate + cur.underHnwlUpdate,
      underCjvReview: acc.underCjvReview + cur.underCjvReview,
      underSafetyReview: acc.underSafetyReview + cur.underSafetyReview,
      underSmoReview: acc.underSmoReview + cur.underSmoReview,
      underSystraReview: acc.underSystraReview + cur.underSystraReview,
      approvedWithComments: acc.approvedWithComments + cur.approvedWithComments,
      rejected: acc.rejected + cur.rejected,
    }),
    {
      totalDocs: 0,
      submittedHnwl: 0,
      notSubmittedHnwl: 0,
      underHnwlUpdate: 0,
      underCjvReview: 0,
      underSafetyReview: 0,
      underSmoReview: 0,
      underSystraReview: 0,
      approvedWithComments: 0,
      rejected: 0,
    }
  );

  const totalSubmittedPct = totalRow.totalDocs ? Math.round((totalRow.submittedHnwl / totalRow.totalDocs) * 100) : 0;
  const totalNotSubmittedPct = totalRow.totalDocs ? (100 - totalSubmittedPct) : 0;
  const totalApprovedPct = totalRow.submittedHnwl ? Math.round((totalRow.approvedWithComments / totalRow.submittedHnwl) * 100) : 0;
  const totalRejectedPct = totalRow.submittedHnwl ? Math.round((totalRow.rejected / totalRow.submittedHnwl) * 100) : 0;

  return (
    <div className="space-y-6" id="conclusion-dashboard-view">
      {/* Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Executive Transmittal Summary & Contractor KPI Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Live calculations across 19 telecommunication, ELV, station, and wayside engineering transmittal packages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportConclusion}
            id="btn-export-conclusion-sheet"
            className="flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-sky-500"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Conclusion (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Primary Transmittal Breakdown Table (Matches Conclusion Sheet.png) */}
      <div className="overflow-hidden rounded-lg border border-sky-300 bg-white shadow-xs">
        <div className="bg-sky-600 px-4 py-2.5 text-white font-semibold text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Master Transmittal & Review Status Matrix (Transmittal / Status)</span>
          </div>
          <span className="text-[11px] font-normal text-sky-100">
            Contractual Review Milestone 1st Batch
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[11px]" id="tbl-master-conclusion">
            <thead>
              <tr className="bg-sky-500 text-white font-bold text-center border-b border-sky-600 divide-x divide-sky-400">
                <th className="px-3 py-2.5 text-left min-w-[160px]">Transmittal / Status</th>
                <th className="px-2 py-2 min-w-[95px]">Total No. of Docs (1st Batch)</th>
                <th className="px-2 py-2 min-w-[85px]">Total submitted from HNWL</th>
                <th className="px-2 py-2 min-w-[70px]">% Total HNWL</th>
                <th className="px-2 py-2 min-w-[85px]">Not Submitted from HNWL</th>
                <th className="px-2 py-2 min-w-[70px]">% Not Sub</th>
                <th className="px-2 py-2 min-w-[80px] bg-sky-600">Under HNWL updated</th>
                <th className="px-2 py-2 min-w-[75px] bg-sky-600">Under CJV Review</th>
                <th className="px-2 py-2 min-w-[75px] bg-sky-600">Under Safety Review</th>
                <th className="px-2 py-2 min-w-[75px] bg-sky-600">Under SMO Review</th>
                <th className="px-2 py-2 min-w-[80px] bg-sky-700">Under Systra Review</th>
                <th className="px-2 py-2 min-w-[95px] bg-emerald-600">Approved with Comments</th>
                <th className="px-2 py-2 min-w-[70px] bg-emerald-700">% Approved SYS</th>
                <th className="px-2 py-2 min-w-[65px] bg-rose-600">Rejected</th>
                <th className="px-2 py-2 min-w-[65px] bg-rose-700">% Rejected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {conclusionRows.map((row, idx) => (
                <tr
                  key={row.transmittal}
                  className={`transition hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                >
                  <td className="px-3 py-2 font-semibold text-slate-800 border-r border-slate-200">
                    {row.transmittal}
                  </td>
                  <td className="px-2 py-2 text-center font-medium text-slate-900 border-r border-slate-200">
                    {row.totalDocs}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-700 border-r border-slate-200">
                    {row.submittedHnwl}
                  </td>
                  <td className="px-2 py-2 text-center font-semibold text-sky-700 bg-sky-50/40 border-r border-slate-200">
                    {row.pctSubmittedHnwl}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-600 border-r border-slate-200">
                    {row.notSubmittedHnwl}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-500 border-r border-slate-200">
                    {row.pctNotSubmittedHnwl}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-700 border-r border-slate-200">
                    {row.underHnwlUpdate}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-700 border-r border-slate-200">
                    {row.underCjvReview}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-700 border-r border-slate-200">
                    {row.underSafetyReview}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-700 border-r border-slate-200">
                    {row.underSmoReview}
                  </td>
                  <td className="px-2 py-2 text-center font-medium text-amber-700 bg-amber-50/40 border-r border-slate-200">
                    {row.underSystraReview}
                  </td>
                  <td className="px-2 py-2 text-center font-bold text-emerald-800 bg-emerald-50/50 border-r border-slate-200">
                    {row.approvedWithComments}
                  </td>
                  <td className="px-2 py-2 text-center font-semibold text-emerald-700 bg-emerald-50/70 border-r border-slate-200">
                    {row.pctApprovedFromSys}
                  </td>
                  <td className="px-2 py-2 text-center font-medium text-rose-700 bg-rose-50/40 border-r border-slate-200">
                    {row.rejected}
                  </td>
                  <td className="px-2 py-2 text-center text-rose-600">
                    {row.pctRejectedFromSys}
                  </td>
                </tr>
              ))}

              {/* Total Calculation Row (Exact Green Highlight from Screenshot) */}
              <tr className="bg-emerald-600 text-white font-black text-center border-t-2 border-emerald-700">
                <td className="px-3 py-2.5 text-left uppercase tracking-wider">Total</td>
                <td className="px-2 py-2.5">{totalRow.totalDocs}</td>
                <td className="px-2 py-2.5">{totalRow.submittedHnwl}</td>
                <td className="px-2 py-2.5">{totalSubmittedPct}%</td>
                <td className="px-2 py-2.5">{totalRow.notSubmittedHnwl}</td>
                <td className="px-2 py-2.5">{totalNotSubmittedPct}%</td>
                <td className="px-2 py-2.5">{totalRow.underHnwlUpdate}</td>
                <td className="px-2 py-2.5">{totalRow.underCjvReview}</td>
                <td className="px-2 py-2.5">{totalRow.underSafetyReview}</td>
                <td className="px-2 py-2.5">{totalRow.underSmoReview}</td>
                <td className="px-2 py-2.5">{totalRow.underSystraReview}</td>
                <td className="px-2 py-2.5">{totalRow.approvedWithComments}</td>
                <td className="px-2 py-2.5">{totalApprovedPct}%</td>
                <td className="px-2 py-2.5">{totalRow.rejected}</td>
                <td className="px-2 py-2.5">{totalRejectedPct}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Secondary Table: Provision Drawings (From Bottom of Screenshot) */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs max-w-3xl">
        <div className="bg-slate-800 px-4 py-2 text-white font-semibold text-xs flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-sky-400" />
          <span>Civil & MEP Interface Provision Drawings Summary</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs" id="tbl-provision-summary">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-center">
                <th className="px-3 py-2 text-left">Transmittal / Status</th>
                <th className="px-3 py-2 bg-sky-50 text-sky-800">Under HNWL updated</th>
                <th className="px-3 py-2">Under CJV Review</th>
                <th className="px-3 py-2 bg-amber-50 text-amber-800">Under Systra Review</th>
                <th className="px-3 py-2 bg-emerald-50 text-emerald-800">Closed with Systra</th>
                <th className="px-3 py-2 bg-rose-50 text-rose-800">Not Submitted</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 text-center font-medium">
                <td className="px-3 py-2 text-left font-semibold text-slate-900">Provision Drawings</td>
                <td className="px-3 py-2 font-bold text-sky-700 bg-sky-50/50">{provisionSummary.underHnwlUpdated}</td>
                <td className="px-3 py-2 text-slate-600">{provisionSummary.underCjvReview}</td>
                <td className="px-3 py-2 font-bold text-amber-700 bg-amber-50/50">{provisionSummary.underSystraReview}</td>
                <td className="px-3 py-2 font-bold text-emerald-700 bg-emerald-50/50">{provisionSummary.closedWithSystra}</td>
                <td className="px-3 py-2 font-bold text-rose-700 bg-rose-50/50">{provisionSummary.notSubmitted}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Visual Progress Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {conclusionRows.slice(0, 4).map((item) => {
          const appNum = item.approvedWithComments;
          const totNum = item.totalDocs;
          const pct = Math.round((appNum / totNum) * 100);

          return (
            <div key={item.transmittal} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 truncate" title={item.transmittal}>
                  {item.transmittal}
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                  {totNum} docs
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xl font-bold text-slate-900">{appNum} Approved</span>
                <span className="text-xs font-semibold text-emerald-600">{pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                ></div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>In Review: <strong className="text-amber-600">{item.underSystraReview}</strong></span>
                <span>Rejected: <strong className="text-rose-600">{item.rejected}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
