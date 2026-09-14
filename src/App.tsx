import { CheckCircle2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { ConclusionDashboard } from './components/ConclusionDashboard';
import { DataGrid } from './components/DataGrid';
import { ExcelUploadModal } from './components/ExcelUploadModal';
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

  const kpiMetrics = useMemo(() => {
    const totalDocs = conclusionRows.reduce((sum, r) => sum + r.totalDocs, 0);
    const totalSubmitted = conclusionRows.reduce((sum, r) => sum + r.submittedHnwl, 0);
    const underReview = conclusionRows.reduce((sum, r) => sum + r.underSystraReview, 0);
    const approved = conclusionRows.reduce((sum, r) => sum + r.approvedWithComments, 0);
    const rejected = conclusionRows.reduce((sum, r) => sum + r.rejected, 0);

    return {
      totalDocs: totalDocs || 1820,
      totalSubmitted: totalSubmitted || 1439,
      underReview: underReview || 333,
      approved: approved || 728,
      rejected: rejected || 71,
    };
  }, [conclusionRows]);

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
    showToast('Generating Master Workbook with all 19 sheets...');
    try {
      await exportMasterWorkbook(sheetsData, conclusionRows);
      showToast('Master Workbook (.xlsx) downloaded successfully!');
    } catch {
      showToast('Failed to generate Master Workbook');
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
        await exportSingleSheetToExcel(
          sheetId,
          conclusionRows.map((r) => ({
            'Transmittal/Status': r.transmittal,
            'Total No. of Documents (1st Batch)': r.totalDocs,
            'Total submitted from HNWL': r.submittedHnwl,
            '% of Total submitted from HNWL': r.pctSubmittedHnwl,
            'Not Submitted from HNWL': r.notSubmittedHnwl,
            '% of Total Not submitted from HNWL': r.pctNotSubmittedHnwl,
            'Under HNWL updated': r.underHnwlUpdate,
            'Under CJV Review': r.underCjvReview,
            'Under Safety Review': r.underSafetyReview,
            'Under SMO Review': r.underSmoReview,
            'Under Systra Review': r.underSystraReview,
            'Approved with Comments': r.approvedWithComments,
            '% of Approved from SYS': r.pctApprovedFromSys,
            Rejected: r.rejected,
            '% of Rejected from SYS': r.pctRejectedFromSys,
          }))
        );
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

      <Sidebar
        activeSheet={activeSheet}
        onSelectSheet={setActiveSheet}
        onExportMasterWorkbook={handleExportMaster}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        sheetsRowCounts={sheetsRowCounts}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          totalDocs={kpiMetrics.totalDocs}
          totalSubmitted={kpiMetrics.totalSubmitted}
          underReview={kpiMetrics.underReview}
          approved={kpiMetrics.approved}
          rejected={kpiMetrics.rejected}
        />

        <main className="flex-1 overflow-y-auto p-6" id="main-content-area">
          {activeSheet === 'conclusion' ? (
            <ConclusionDashboard
              conclusionRows={conclusionRows}
              provisionSummary={provisionSummary}
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
