import { CheckCircle2, RotateCcw } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConclusionDashboard } from './components/ConclusionDashboard';
import { DataGrid } from './components/DataGrid';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { ExportSheetsModal } from './components/ExportSheetsModal';
import { Header } from './components/Header';
import { PythonViewer } from './components/PythonViewer';
import { Sidebar } from './components/Sidebar';
import { SHEET_DEFINITIONS } from './data/constants';
import { isFirebaseConfigured } from './lib/firebase';
import {
  addSheetRow,
  deleteSheetRow,
  loadAllSheetsFromFirestore,
  loadConclusionFromFirestore,
  loadProvisionSummaryFromFirestore,
  syncExcelSourceToFirestore,
  updateSheetRow,
} from './lib/firestoreData';
import { ConclusionRow, HSRRow, SheetId } from './types';
import { exportMasterWorkbook, exportSingleSheetToExcel } from './utils/excelExporter';

export default function App() {
  const [activeSheet, setActiveSheet] = useState<SheetId>('conclusion');
  const [sheetsData, setSheetsData] = useState<Record<string, HSRRow[]>>({});
  const [conclusionRows, setConclusionRows] = useState<ConclusionRow[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [bootMessage, setBootMessage] = useState('Connecting to Firestore...');
  const [bootError, setBootError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── Per-sheet undo stack (stores previous HSRRow[] snapshots) ──
  const undoStackRef = useRef<Record<string, HSRRow[][]>>({});
  const MAX_UNDO = 50;
  const [provisionSummary, setProvisionSummary] = useState({
    underHnwlUpdated: 2,
    underCjvReview: 0,
    underSystraReview: 11,
    closedWithSystra: 5,
    notSubmitted: 3,
  });

  const [toastType, setToastType] = useState<'normal' | 'undo'>('normal');

  const showToast = (msg: string, type: 'normal' | 'undo' = 'normal') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
      setToastType('normal');
    }, 3500);
  };

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!isFirebaseConfigured()) {
        setBootError(
          'Add your Firebase web app keys to a .env file (see .env.example), then restart the dev server.'
        );
        return;
      }

      try {
        setBootMessage('Importing live Excel tracker into Firestore...');
        const syncResult = await syncExcelSourceToFirestore();
        if (cancelled) return;

        setBootMessage(
          syncResult === 'imported'
            ? 'Excel data written to Firestore. Loading sheets...'
            : 'Loading sheets from Firestore...'
        );
        const [sheets, conclusion, provision] = await Promise.all([
          loadAllSheetsFromFirestore(),
          loadConclusionFromFirestore(),
          loadProvisionSummaryFromFirestore(),
        ]);
        if (cancelled) return;

        setSheetsData(sheets);
        setConclusionRows(conclusion);
        setProvisionSummary(provision);
        setIsReady(true);
        if (syncResult === 'imported') {
          showToast('Live Excel tracker copied into Firestore');
        }
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Failed to connect to Firestore';
        setBootError(message);
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, []);

  const sheetsRowCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SHEET_DEFINITIONS.forEach((def) => {
      if (def.id === 'conclusion') {
        counts[def.id] = conclusionRows.length;
      } else if (def.id === 'python_code') {
        counts[def.id] = 0;
      } else {
        counts[def.id] = (sheetsData[def.id] || []).length;
      }
    });
    return counts;
  }, [sheetsData, conclusionRows]);

  const dynamicProvisionSummary = useMemo(() => {
    const provRows = sheetsData['provision_drawings'] || [];
    if (provRows.length === 0) return provisionSummary; // fallback to static if no data

    let underHnwlUpdated = 0;
    let underCjvReview = 0;
    let underSystraReview = 0;
    let closedWithSystra = 0;
    let notSubmitted = 0;

    provRows.forEach(row => {
      const hnwl = String(row.hnwlStatus || '').toLowerCase();
      const sys = String(row.systraStatus || '').toLowerCase();

      if (sys.includes('approved') || sys.includes('closed')) {
        closedWithSystra++;
      } else if (sys.includes('systra review')) {
        underSystraReview++;
      } else if (hnwl.includes('cjv review')) {
        underCjvReview++;
      } else if (hnwl.includes('hnwl update')) {
        underHnwlUpdated++;
      } else if (hnwl.includes('not submitted') || sys.includes('not submitted') || hnwl.includes('not sumitted') || sys.includes('not sumitted')) {
        notSubmitted++;
      } else {
        // Default to not submitted if it's completely blank, otherwise just count as under HNWL
        if (!hnwl.trim() && !sys.trim()) notSubmitted++;
        else underHnwlUpdated++;
      }
    });

    return {
      underHnwlUpdated,
      underCjvReview,
      underSystraReview,
      closedWithSystra,
      notSubmitted
    };
  }, [sheetsData, provisionSummary]);

  const dynamicConclusionRows = useMemo(() => {
    /**
     * computeStats — counts each row into exactly ONE bucket using a strict priority chain.
     * Priority (high → low):
     *   1. Systra APPROVED  (statusSystra = "Approved" / "Approved with Comments" / "Closed" / "Code 2")
     *   2. Systra REJECTED  (statusSystra = "Rejected" / "Code 3")
     *   3. UNDER SYSTRA REVIEW  (statusSystra = "Under Systra Review", or docWfStatus = "Released to Systra")
     *   4. NOT SUBMITTED  (statusHoneywell = "Not Submitted from HNWL", or both sides blank)
     *   5. UNDER SMO REVIEW  (docWfStatus contains "smo")
     *   6. UNDER CJV REVIEW  (statusHoneywell = "Under CJV review")
     *   7. UNDER SAFETY REVIEW
     *   8. UNDER HNWL UPDATE  (all remaining HNWL internal update stages)
     */
    const computeStats = (sheetId: string, filterFn?: (row: any) => boolean) => {
      let rows = sheetsData[sheetId] || [];
      if (filterFn) rows = rows.filter(filterFn);

      let underHnwlUpdate = 0, underCjvReview = 0, underSafetyReview = 0, underSmoReview = 0;
      let notSubmittedHnwl = 0, underSystraReview = 0, approvedWithComments = 0, rejected = 0;

      rows.forEach(r => {
        // Systra-side (one authoritative column; FAT uses docStatus)
        const systraRaw = String(r.statusSystra || r.documentStatus || r.docStatus || '').trim().toLowerCase();
        // HNWL-side
        const hnwlRaw = String(r.statusHoneywell || r.hnwlStatus || '').trim().toLowerCase();
        // WF workflow (SMO routing)
        const wfRaw = String(r.docWfStatus || r.smoStatus || '').trim().toLowerCase();

        if (
          systraRaw === 'approved' ||
          systraRaw === 'approved with comments' ||
          systraRaw.includes('closed') ||
          systraRaw === 'code 2'
        ) {
          approvedWithComments++;
        } else if (systraRaw === 'rejected' || systraRaw === 'code 3') {
          rejected++;
        } else if (
          systraRaw === 'under systra review' ||
          systraRaw === 'under review' ||
          wfRaw === 'released to systra'
        ) {
          underSystraReview++;
        } else if (
          hnwlRaw.includes('not submitted') ||
          hnwlRaw.includes('not sumitted') ||
          systraRaw === 'not submitted' ||
          systraRaw.includes('not submitted') ||
          (hnwlRaw === '' && systraRaw === '' && wfRaw === '')
        ) {
          notSubmittedHnwl++;
        } else if (wfRaw.includes('smo') || hnwlRaw.includes('smo comments')) {
          underSmoReview++;
        } else if (hnwlRaw === 'under cjv review' || hnwlRaw.includes('cjv review')) {
          underCjvReview++;
        } else if (hnwlRaw.includes('safety review')) {
          underSafetyReview++;
        } else if (hnwlRaw.includes('hnwl update') || hnwlRaw.includes('under hnwl') || hnwlRaw.includes('approved from cjv') || hnwlRaw !== '') {
          // Installation Details & FAT: HNWL internal stage = still not submitted to Systra
          if (sheetId === 'installation_details' || sheetId === 'fat') {
            notSubmittedHnwl++;
          } else {
            underHnwlUpdate++;
          }
        } else {
          notSubmittedHnwl++;
        }
      });

      const totalDocs = rows.length;
      const submittedHnwl = totalDocs - notSubmittedHnwl;
      return {
        totalDocs, submittedHnwl, notSubmittedHnwl,
        underHnwlUpdate, underCjvReview, underSafetyReview, underSmoReview,
        underSystraReview, approvedWithComments, rejected,
        pctSubmittedHnwl:    totalDocs     ? Math.round((submittedHnwl       / totalDocs)      * 100) + '%' : '0%',
        pctNotSubmittedHnwl: totalDocs     ? (100 - Math.round((submittedHnwl / totalDocs)     * 100)) + '%' : '0%',
        pctApprovedFromSys:  submittedHnwl ? Math.round((approvedWithComments / submittedHnwl) * 100) + '%' : '0%',
        pctRejectedFromSys:  submittedHnwl ? Math.round((rejected             / submittedHnwl) * 100) + '%' : '0%',
      };
    };

    // Merge multiple sheet stats into a single combined object
    const mergeStats = (...list: ReturnType<typeof computeStats>[]) => {
      const m = list.reduce((a, s) => ({
        totalDocs:            a.totalDocs            + s.totalDocs,
        submittedHnwl:        a.submittedHnwl        + s.submittedHnwl,
        notSubmittedHnwl:     a.notSubmittedHnwl     + s.notSubmittedHnwl,
        underHnwlUpdate:      a.underHnwlUpdate      + s.underHnwlUpdate,
        underCjvReview:       a.underCjvReview       + s.underCjvReview,
        underSafetyReview:    a.underSafetyReview    + s.underSafetyReview,
        underSmoReview:       a.underSmoReview        + s.underSmoReview,
        underSystraReview:    a.underSystraReview    + s.underSystraReview,
        approvedWithComments: a.approvedWithComments + s.approvedWithComments,
        rejected:             a.rejected              + s.rejected,
      }), { totalDocs:0,submittedHnwl:0,notSubmittedHnwl:0,underHnwlUpdate:0,underCjvReview:0,underSafetyReview:0,underSmoReview:0,underSystraReview:0,approvedWithComments:0,rejected:0 });
      const { totalDocs, submittedHnwl, approvedWithComments, rejected } = m;
      return { ...m,
        pctSubmittedHnwl:    totalDocs     ? Math.round((submittedHnwl       / totalDocs)      * 100) + '%' : '0%',
        pctNotSubmittedHnwl: totalDocs     ? (100 - Math.round((submittedHnwl / totalDocs)     * 100)) + '%' : '0%',
        pctApprovedFromSys:  submittedHnwl ? Math.round((approvedWithComments / submittedHnwl) * 100) + '%' : '0%',
        pctRejectedFromSys:  submittedHnwl ? Math.round((rejected             / submittedHnwl) * 100) + '%' : '0%',
      };
    };

    // ── Compute stats for every sheet ──
    const ictStationsStats  = computeStats('ict_stations');
    const ictDepotStats     = computeStats('ict_depot');
    const ictSpStats        = computeStats('ict_sp');
    const ictWaysideStats   = computeStats('ict_wayside');
    const elvStationsStats  = computeStats('elv_stations');
    const elvDepotStats     = computeStats('elv_depot');
    const elvSpStats        = computeStats('elv_sp');
    const elvWaysideStats   = computeStats('elv_wayside');
    const installationStats = computeStats('installation_details');
    const tpsStats          = computeStats('tps');
    const tss3Stats         = computeStats('tss3');
    const techRoomsStats    = computeStats('technical_rooms');
    const mosStats          = computeStats('mos');
    const fatStats          = computeStats('fat');
    const lldStats          = computeStats('lld');
    const sdsStats          = computeStats('sds', (row) => {
      const code  = String(row.systemCode    || '').toLowerCase();
      const title = String(row.submissionTitle || '').toLowerCase();
      return !code.includes('fo cable') && !title.includes('fo cable');
    });

    const mapped = conclusionRows.map(row => {
      const trans = row.transmittal.toLowerCase();

      // ICT DD (Stations)
      if ((trans.includes('ict') && trans.includes('station') && !trans.includes('wayside') && !trans.includes('depot') && !trans.includes('service')) || trans.includes('ict dd (stations)')) {
        return { ...row, ...ictStationsStats };
      }
      // ICT DD (Depot)
      if ((trans.includes('ict') && trans.includes('depot')) || trans.includes('ict dd (depot)')) {
        return { ...row, ...ictDepotStats };
      }
      // ICT DD (Service Point)
      if ((trans.includes('ict') && trans.includes('service point')) || trans.includes('ict dd - service point') || trans.includes('ict dd (service point)')) {
        return { ...row, ...ictSpStats };
      }
      // ELV DD (Stations)
      if ((trans.includes('elv') && trans.includes('station') && !trans.includes('wayside') && !trans.includes('depot') && !trans.includes('service')) || trans.includes('elv dd (stations)')) {
        return { ...row, ...elvStationsStats };
      }
      // ELV DD (Depot)
      if ((trans.includes('elv') && trans.includes('depot')) || trans.includes('elv dd (depot)')) {
        return { ...row, ...elvDepotStats };
      }
      // ELV DD (Service Point)
      if ((trans.includes('elv') && trans.includes('service point')) || trans.includes('elv dd - service point') || trans.includes('elv dd (service point)')) {
        return { ...row, ...elvSpStats };
      }
      // Wayside DD (ICT + ELV combined)
      if (trans.includes('wayside dd')) {
        return { ...row, ...mergeStats(ictWaysideStats, elvWaysideStats) };
      }
      // Installation Details
      if (trans.includes('installation detail')) {
        return { ...row, ...installationStats };
      }
      // TPS
      if (trans.includes('tps') || trans.includes('traction power')) {
        return { ...row, ...tpsStats };
      }
      // TSS3
      if (trans.includes('tss3') || trans.includes('tss 3') || trans.includes('traction supply station')) {
        return { ...row, ...tss3Stats };
      }
      // Technical Rooms
      if (trans.includes('technical room') || trans.includes('tech room')) {
        return { ...row, ...techRoomsStats };
      }
      // SDS
      if (trans.includes('sds') || trans.includes('system design spec')) {
        return { ...row, ...sdsStats };
      }
      // MOS
      if (trans.includes('method of statement') || (trans.includes('mos') && trans.length < 15)) {
        return { ...row, ...mosStats };
      }
      // FAT
      if (trans.includes('factory test acceptance') || trans.includes('factory acceptance') || (trans.includes('fat') && !trans.includes('report'))) {
        return { ...row, ...fatStats };
      }
      // LLD
      if (trans.includes('lld') || trans.includes('low level design') || trans.includes('low-level design')) {
        return { ...row, ...lldStats };
      }

      // Fallback: static row from Firestore
      return row;
    });

    // Filter out provision rows and individual wayside sub-sheet rows
    return mapped.filter(r => {
      const t = r.transmittal.toLowerCase();
      return !t.includes('provision') && !t.includes('ict dd (wayside shelters)') && !t.includes('elv dd (wayside shelters)');
    });
  }, [conclusionRows, sheetsData]);

  const kpiMetrics = useMemo(() => {
    const totalDocs = dynamicConclusionRows.reduce((sum, r) => sum + r.totalDocs, 0);
    const totalSubmitted = dynamicConclusionRows.reduce((sum, r) => sum + r.submittedHnwl, 0);
    const underReview = dynamicConclusionRows.reduce((sum, r) => sum + r.underSystraReview, 0);
    const approved = dynamicConclusionRows.reduce((sum, r) => sum + r.approvedWithComments, 0);
    const rejected = dynamicConclusionRows.reduce((sum, r) => sum + r.rejected, 0);

    return {
      totalDocs: totalDocs,
      totalSubmitted: totalSubmitted,
      underReview: underReview,
      approved: approved,
      rejected: rejected,
    };
  }, [dynamicConclusionRows]);

  const handleUpdateRow = async (rowId: string, updatedFields: Record<string, unknown>) => {
    const previous = sheetsData[activeSheet] || [];
    // Push snapshot to undo stack
    const stack = undoStackRef.current[activeSheet] || [];
    undoStackRef.current[activeSheet] = [...stack.slice(-MAX_UNDO + 1), previous];

    setSheetsData((prev) => {
      const list = prev[activeSheet] || [];
      const updatedList = list.map((item) => (item.id === rowId ? { ...item, ...updatedFields } : item));
      return { ...prev, [activeSheet]: updatedList };
    });

    try {
      await updateSheetRow(activeSheet, rowId, updatedFields);
      showToast('Record updated');
    } catch (error) {
      setSheetsData((prev) => ({ ...prev, [activeSheet]: previous }));
      undoStackRef.current[activeSheet]?.pop();
      showToast(error instanceof Error ? error.message : 'Failed to update Firestore');
    }
  };

  const handleAddRow = async (newRowFields: Record<string, unknown>) => {
    const newId = `${activeSheet}_${Date.now()}`;
    const newRecord: HSRRow = { id: newId, ...newRowFields };
    const previous = sheetsData[activeSheet] || [];
    // Push snapshot to undo stack
    const stack = undoStackRef.current[activeSheet] || [];
    undoStackRef.current[activeSheet] = [...stack.slice(-MAX_UNDO + 1), previous];

    setSheetsData((prev) => {
      const list = prev[activeSheet] || [];
      return { ...prev, [activeSheet]: [newRecord, ...list] };
    });

    try {
      await addSheetRow(activeSheet, newRecord, -Date.now());
      showToast('New record added');
    } catch (error) {
      setSheetsData((prev) => ({ ...prev, [activeSheet]: previous }));
      undoStackRef.current[activeSheet]?.pop();
      showToast(error instanceof Error ? error.message : 'Failed to add record in Firestore');
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    const previous = sheetsData[activeSheet] || [];
    // Push snapshot to undo stack
    const stack = undoStackRef.current[activeSheet] || [];
    undoStackRef.current[activeSheet] = [...stack.slice(-MAX_UNDO + 1), previous];

    setSheetsData((prev) => {
      const list = prev[activeSheet] || [];
      return { ...prev, [activeSheet]: list.filter((item) => item.id !== rowId) };
    });

    try {
      await deleteSheetRow(activeSheet, rowId);
      showToast('Record deleted');
    } catch (error) {
      setSheetsData((prev) => ({ ...prev, [activeSheet]: previous }));
      undoStackRef.current[activeSheet]?.pop();
      showToast(error instanceof Error ? error.message : 'Failed to delete record in Firestore');
    }
  };

  const handleExportMaster = async () => {
    showToast('Generating Master Workbook with all 21 sheets...');
    try {
      await exportMasterWorkbook(sheetsData, dynamicConclusionRows, dynamicProvisionSummary);
      showToast('Master Workbook (.xlsx) downloaded successfully!');
    } catch {
      showToast('Failed to generate Master Workbook');
    }
  };

  const handleExportSelected = async (selectedIds: string[]) => {
    showToast(`Generating workbook with ${selectedIds.length} selected sheet(s)...`);
    try {
      await exportMasterWorkbook(sheetsData, dynamicConclusionRows, dynamicProvisionSummary, selectedIds);
      showToast('Custom Export (.xlsx) downloaded successfully!');
    } catch {
      showToast('Failed to generate custom export');
    }
  };

  const handleSyncComplete = async () => {
    // Clear undo stacks after a full sync since history is now stale
    undoStackRef.current = {};
    try {
      const [sheets, conclusion, provision] = await Promise.all([
        loadAllSheetsFromFirestore(),
        loadConclusionFromFirestore(),
        loadProvisionSummaryFromFirestore(),
      ]);
      setSheetsData(sheets);
      setConclusionRows(conclusion);
      setProvisionSummary(provision);
      showToast('Firestore synced — data refreshed!');
    } catch {
      showToast('Sync complete but failed to refresh local data. Please reload.');
    }
  };

  const handleExportSingle = async (sheetId: SheetId) => {
    showToast(`Generating Excel for ${sheetId}...`);
    try {
      if (sheetId === 'conclusion') {
        const { buildConclusionExportData } = await import('./utils/excelExporter');
        const exportData = buildConclusionExportData(dynamicConclusionRows, dynamicProvisionSummary);
        await exportSingleSheetToExcel(sheetId, exportData);
      } else {
        const data = sheetsData[sheetId] || [];
        await exportSingleSheetToExcel(sheetId, data);
      }
      showToast('Sheet downloaded as Excel (.xlsx)!');
    } catch {
      showToast('Failed to generate Excel export');
    }
  };

  // ── Ctrl+Z undo handler ──
  const handleUndo = useCallback(async () => {
    const stack = undoStackRef.current[activeSheet];
    if (!stack || stack.length === 0) {
      showToast('Nothing to undo');
      return;
    }
    const snapshot = stack[stack.length - 1];
    undoStackRef.current[activeSheet] = stack.slice(0, -1);

    // Restore state locally first
    setSheetsData((prev) => ({ ...prev, [activeSheet]: snapshot }));
    showToast('Undo — restoring previous state...', 'undo');

    // Sync each row back to Firestore (diff current vs snapshot)
    try {
      const currentList = sheetsData[activeSheet] || [];
      const snapshotMap = new Map(snapshot.map((r) => [r.id, r]));
      const currentMap = new Map(currentList.map((r) => [r.id, r]));

      // Rows that exist in snapshot but not in current → re-add them
      for (const row of snapshot) {
        if (!currentMap.has(row.id)) {
          await addSheetRow(activeSheet, row, 0);
        }
      }
      // Rows that exist in current but not in snapshot → delete them
      for (const row of currentList) {
        if (!snapshotMap.has(row.id)) {
          await deleteSheetRow(activeSheet, row.id);
        }
      }
      // Rows in both → update with snapshot values
      for (const row of snapshot) {
        if (currentMap.has(row.id)) {
          const cur = currentMap.get(row.id)!;
          const changed = JSON.stringify(cur) !== JSON.stringify(row);
          if (changed) {
            const { id, ...fields } = row;
            await updateSheetRow(activeSheet, id, fields as Record<string, unknown>);
          }
        }
      }
      showToast('Undo complete ✓', 'undo');
    } catch {
      showToast('Undo applied locally — Firestore sync failed');
    }
  }, [activeSheet, sheetsData]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) — only when not in a text input
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        void handleUndo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo]);

  const currentSheetDef = SHEET_DEFINITIONS.find((s) => s.id === activeSheet);

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 px-6">
        <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">HSR Document Tracker</h1>
          {bootError ? (
            <p className="mt-3 text-sm text-rose-700">{bootError}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-600">{bootMessage}</p>
          )}
          <p className="mt-4 text-xs text-slate-500">
            First launch copies the live Excel tracker from src/excel into Firestore. Later
            launches load that same data from the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900" id="app-root">
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-xs font-semibold text-white shadow-xl border animate-fade-in ${
            toastType === 'undo'
              ? 'bg-indigo-700 border-indigo-500'
              : 'bg-slate-900 border-slate-700'
          }`}
        >
          {toastType === 'undo' ? (
            <RotateCcw className="h-4 w-4 text-indigo-300" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {isUploadModalOpen && (
        <ExcelUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          activeSheet={activeSheet}
          onSyncComplete={handleSyncComplete}
        />
      )}

      {isExportModalOpen && (
        <ExportSheetsModal
          onClose={() => setIsExportModalOpen(false)}
          onExportSelected={handleExportSelected}
          onExportAll={handleExportMaster}
        />
      )}

      <Sidebar
        activeSheet={activeSheet}
        onSelectSheet={setActiveSheet}
        onExportMasterWorkbook={() => setIsExportModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        sheetsRowCounts={sheetsRowCounts}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          totalDocs={kpiMetrics.totalDocs}
          totalSubmitted={kpiMetrics.totalSubmitted}
          underReview={kpiMetrics.underReview}
          approved={kpiMetrics.approved}
          rejected={kpiMetrics.rejected}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6" id="main-content-area">
          {activeSheet === 'conclusion' ? (
            <ConclusionDashboard
              conclusionRows={dynamicConclusionRows}
              provisionSummary={dynamicProvisionSummary}
              onExportConclusion={() => handleExportSingle('conclusion')}
            />
          ) : activeSheet === 'python_code' ? (
            <PythonViewer />
          ) : currentSheetDef ? (
            <DataGrid
              key={activeSheet}
              sheetDef={currentSheetDef}
              data={sheetsData[activeSheet] || []}
              onUpdateRow={handleUpdateRow}
              onAddRow={handleAddRow}
              onDeleteRow={handleDeleteRow}
              onExportSheet={() => handleExportSingle(activeSheet)}
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              Select a sheet from the sidebar to view data.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
