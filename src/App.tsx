import { CheckCircle2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
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
  const [provisionSummary, setProvisionSummary] = useState({
    underHnwlUpdated: 2,
    underCjvReview: 0,
    underSystraReview: 11,
    closedWithSystra: 5,
    notSubmitted: 3,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
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
    const computeStats = (sheetId: string, filterFn?: (row: any) => boolean) => {
      let rows = sheetsData[sheetId] || [];
      if (filterFn) {
        rows = rows.filter(filterFn);
      }
      
      let underHnwlUpdate = 0, underCjvReview = 0, underSafetyReview = 0, underSmoReview = 0, notSubmittedHnwl = 0;
      let underSystraReview = 0, approvedWithComments = 0, rejected = 0;
      
      rows.forEach(r => {
        const hStatus = String(r.statusHoneywell || r.hnwlStatus || '').toLowerCase();
        const wfStatus = String(r.docWfStatus || '').toLowerCase();
        const sysStatus = String(r.statusSystra || r.documentStatus || '').toLowerCase();
        // Fallbacks for FAT or other sheets that might use different columns like 'docStatus' or 'status'
        const docStatus = String(r.docStatus || r.status || '').toLowerCase();
        
        const combinedSys = sysStatus + ' ' + docStatus; // Search across all possible systra columns
        const combinedHnwl = hStatus + ' ' + docStatus; // Search across all possible hnwl columns
        
        if (combinedSys.includes('under systra review') || combinedSys.includes('under review')) underSystraReview++;
        else if (combinedSys.includes('rejected')) rejected++;
        else if (combinedSys.includes('approved') || combinedSys.includes('closed')) approvedWithComments++;
        else if (combinedHnwl.includes('not submitted') || combinedSys.includes('not submitted') || combinedHnwl.includes('not sumitted') || combinedSys.includes('not sumitted')) notSubmittedHnwl++;
        else if (combinedHnwl.includes('cjv review')) underCjvReview++;
        else if (combinedHnwl.includes('safety review')) underSafetyReview++;
        else if (wfStatus.includes('under smo review') || combinedHnwl.includes('smo comments')) underSmoReview++;
        else if (combinedHnwl.includes('hnwl update')) {
          if (sheetId === 'installation_details' || sheetId === 'fat') {
            notSubmittedHnwl++;
          } else {
            underHnwlUpdate++;
          }
        }
        else if (!combinedHnwl.trim() && !combinedSys.trim() && !wfStatus.trim()) notSubmittedHnwl++; // blank means not submitted
        // Anything else is considered submitted because it skips notSubmittedHnwl
      });
      
      const totalDocs = rows.length;
      const submittedHnwl = totalDocs - notSubmittedHnwl;
      
      return {
        totalDocs,
        submittedHnwl,
        notSubmittedHnwl,
        underHnwlUpdate,
        underCjvReview,
        underSafetyReview,
        underSmoReview,
        underSystraReview,
        approvedWithComments,
        rejected,
        pctSubmittedHnwl: totalDocs ? Math.round((submittedHnwl / totalDocs) * 100) + '%' : '0%',
        pctNotSubmittedHnwl: totalDocs ? (100 - Math.round((submittedHnwl / totalDocs) * 100)) + '%' : '0%',
        pctApprovedFromSys: submittedHnwl ? Math.round((approvedWithComments / submittedHnwl) * 100) + '%' : '0%',
        pctRejectedFromSys: submittedHnwl ? Math.round((rejected / submittedHnwl) * 100) + '%' : '0%',
      };
    };

    const ictStats = computeStats('ict_wayside');
    const elvStats = computeStats('elv_wayside');
    const fatStats = computeStats('fat');
    const mosStats = computeStats('mos');
    const installationStats = computeStats('installation_details');
    const sdsStats = computeStats('sds', (row) => {
      const code = String(row.systemCode || '').toLowerCase();
      const title = String(row.submissionTitle || '').toLowerCase();
      return !code.includes('fo cable') && !title.includes('fo cable');
    });
    
    let hasIct = false;
    let hasElv = false;

    const mapped = conclusionRows.map(row => {
      const trans = row.transmittal.toLowerCase();
      if (trans.includes('factory test acceptance') || (trans.includes('fat') && !trans.includes('report'))) {
        return { ...row, ...fatStats };
      }
      if (trans.includes('method of statement') || (trans.includes('mos') && trans.length < 15)) {
        return { ...row, ...mosStats };
      }
      if (trans.includes('installation details')) {
        return { ...row, ...installationStats };
      }
      if (trans.includes('sds') || trans.includes('system design spec')) {
        return { ...row, ...sdsStats };
      }
      // For Wayside DD: fully dynamic — sum ICT + ELV wayside stats
      if (trans.includes('wayside dd')) {
        const totalDocs = ictStats.totalDocs + elvStats.totalDocs;
        const submittedHnwl = ictStats.submittedHnwl + elvStats.submittedHnwl;
        const notSubmittedHnwl = ictStats.notSubmittedHnwl + elvStats.notSubmittedHnwl;
        const underHnwlUpdate = ictStats.underHnwlUpdate + elvStats.underHnwlUpdate;
        const underCjvReview = ictStats.underCjvReview + elvStats.underCjvReview;
        const underSafetyReview = ictStats.underSafetyReview + elvStats.underSafetyReview;
        const underSmoReview = ictStats.underSmoReview + elvStats.underSmoReview;
        const underSystraReview = ictStats.underSystraReview + elvStats.underSystraReview;
        const approvedWithComments = ictStats.approvedWithComments + elvStats.approvedWithComments;
        const rejected = ictStats.rejected + elvStats.rejected;
        return {
          ...row,
          totalDocs,
          submittedHnwl,
          notSubmittedHnwl,
          underHnwlUpdate,
          underCjvReview,
          underSafetyReview,
          underSmoReview,
          underSystraReview,
          approvedWithComments,
          rejected,
          pctSubmittedHnwl: totalDocs ? Math.round((submittedHnwl / totalDocs) * 100) + '%' : '0%',
          pctNotSubmittedHnwl: totalDocs ? (100 - Math.round((submittedHnwl / totalDocs) * 100)) + '%' : '0%',
          pctApprovedFromSys: submittedHnwl ? Math.round((approvedWithComments / submittedHnwl) * 100) + '%' : '0%',
          pctRejectedFromSys: submittedHnwl ? Math.round((rejected / submittedHnwl) * 100) + '%' : '0%',
        };
      }
      return row;
    });

    // Filter out provision and the individual wayside sub-sheets (not shown in main table)
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
    setSheetsData((prev) => {
      const list = prev[activeSheet] || [];
      const updatedList = list.map((item) => (item.id === rowId ? { ...item, ...updatedFields } : item));
      return { ...prev, [activeSheet]: updatedList };
    });

    try {
      await updateSheetRow(activeSheet, rowId, updatedFields);
      showToast('Record updated in Firestore');
    } catch (error) {
      setSheetsData((prev) => ({ ...prev, [activeSheet]: previous }));
      showToast(error instanceof Error ? error.message : 'Failed to update Firestore');
    }
  };

  const handleAddRow = async (newRowFields: Record<string, unknown>) => {
    const newId = `${activeSheet}_${Date.now()}`;
    const newRecord: HSRRow = { id: newId, ...newRowFields };
    const previous = sheetsData[activeSheet] || [];

    setSheetsData((prev) => {
      const list = prev[activeSheet] || [];
      return { ...prev, [activeSheet]: [newRecord, ...list] };
    });

    try {
      await addSheetRow(activeSheet, newRecord, -Date.now());
      showToast('New record added to Firestore');
    } catch (error) {
      setSheetsData((prev) => ({ ...prev, [activeSheet]: previous }));
      showToast(error instanceof Error ? error.message : 'Failed to add record in Firestore');
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    const previous = sheetsData[activeSheet] || [];
    setSheetsData((prev) => {
      const list = prev[activeSheet] || [];
      return { ...prev, [activeSheet]: list.filter((item) => item.id !== rowId) };
    });

    try {
      await deleteSheetRow(activeSheet, rowId);
      showToast('Record deleted from Firestore');
    } catch (error) {
      setSheetsData((prev) => ({ ...prev, [activeSheet]: previous }));
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
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-fade-in border border-slate-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
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
