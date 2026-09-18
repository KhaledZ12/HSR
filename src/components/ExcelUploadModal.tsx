import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useCallback, useRef, useState } from 'react';
import { SHEET_DEFINITIONS } from '../data/constants';
import { uploadMasterWorkbook, uploadSingleSheet } from '../lib/firestoreUpload';
import { SheetId } from '../types';
import { parseMasterWorkbook, parseSingleSheet } from '../utils/excelParser';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UploadMode = 'single' | 'master';
type StepState = 'idle' | 'parsing' | 'preview' | 'uploading' | 'success' | 'error';

interface ExcelUploadModalProps {
  onClose: () => void;
  activeSheet: SheetId;
  onSyncComplete: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const UPLOADABLE_SHEETS = SHEET_DEFINITIONS.filter(
  (s) => s.id !== 'python_code'
);

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  onClose,
  activeSheet,
  onSyncComplete,
}) => {
  const [mode, setMode] = useState<UploadMode>('single');
  const [selectedSheet, setSelectedSheet] = useState<SheetId>(
    activeSheet === 'conclusion' || activeSheet === 'python_code' ? 'ict_stations' : activeSheet
  );
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<StepState>('idle');
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File handling ────────────────────────────────────────────────────────

  const acceptFile = useCallback(async (picked: File) => {
    if (!picked.name.endsWith('.xlsx') && !picked.name.endsWith('.xls')) {
      setErrorMsg('Only Excel files (.xlsx) are supported.');
      setStep('error');
      return;
    }

    setFile(picked);
    setErrorMsg('');
    setStep('parsing');
    setRowCount(null);

    try {
      if (mode === 'master') {
        const payload = await parseMasterWorkbook(picked);
        const total = Object.values(payload.sheets).reduce((s, r) => s + r.length, 0)
          + payload.conclusion.length;
        setRowCount(total);
      } else {
        const { rowCount: rc } = await parseSingleSheet(picked, selectedSheet);
        setRowCount(rc);
      }
      setStep('preview');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse the Excel file.');
      setStep('error');
    }
  }, [mode, selectedSheet]);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) void acceptFile(dropped);
    },
    [acceptFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) void acceptFile(picked);
    // reset so same file can be re-selected
    e.target.value = '';
  };

  // ── Sync ─────────────────────────────────────────────────────────────────

  const handleSync = async () => {
    if (!file) return;
    setStep('uploading');
    setProgress(0);

    try {
      if (mode === 'master') {
        const payload = await parseMasterWorkbook(file);
        const total = Object.keys(payload.sheets).length + 2;
        await uploadMasterWorkbook(payload, (done) => {
          setProgress(Math.round((done / total) * 100));
        });
      } else {
        const { rows } = await parseSingleSheet(file, selectedSheet);
        await uploadSingleSheet(selectedSheet, rows, (done, total) => {
          setProgress(Math.round((done / total) * 100));
        });
      }

      setStep('success');
      await onSyncComplete();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Firestore sync failed.');
      setStep('error');
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  const reset = () => {
    setFile(null);
    setStep('idle');
    setRowCount(null);
    setProgress(0);
    setErrorMsg('');
  };

  const switchMode = (m: UploadMode) => {
    setMode(m);
    reset();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const isLoading = step === 'parsing' || step === 'uploading';

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isLoading ? undefined : onClose}
      />

      {/* Panel */}
      <motion.div
        key="panel"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <div
          className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto"
          id="excel-upload-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Upload className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Import Excel to Firestore</h2>
                <p className="text-[11px] text-slate-400">Sync weekly tracker updates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition disabled:opacity-40"
              id="btn-close-upload-modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* ── Mode selector ─────────────────────────────────────────── */}
            <div className="flex gap-2" role="group" aria-label="Upload mode">
              {(['single', 'master'] as UploadMode[]).map((m) => (
                <button
                  key={m}
                  id={`btn-mode-${m}`}
                  onClick={() => switchMode(m)}
                  disabled={isLoading}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    mode === m
                      ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  {m === 'single' ? 'Single Sheet' : 'Master Workbook (All 19 Sheets)'}
                </button>
              ))}
            </div>

            {/* ── Sheet selector (single mode only) ─────────────────────── */}
            <AnimatePresence>
              {mode === 'single' && (
                <motion.div
                  key="sheet-select"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Target Sheet
                  </label>
                  <div className="relative">
                    <select
                      id="select-upload-sheet"
                      value={selectedSheet}
                      onChange={(e) => {
                        setSelectedSheet(e.target.value as SheetId);
                        reset();
                      }}
                      disabled={isLoading}
                      className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 pr-8 text-xs text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-40"
                    >
                      {UPLOADABLE_SHEETS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Drop zone ─────────────────────────────────────────────── */}
            <div
              id="excel-drop-zone"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition cursor-pointer ${
                isDragging
                  ? 'border-sky-400 bg-sky-400/5'
                  : step === 'error'
                  ? 'border-rose-600/60 bg-rose-900/10'
                  : step === 'success'
                  ? 'border-emerald-500/60 bg-emerald-900/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-800/40'
              } ${isLoading ? 'pointer-events-none' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={onFileChange}
                id="excel-file-input"
              />

              {/* State: idle / preview */}
              {(step === 'idle' || step === 'preview') && (
                <>
                  <div className={`rounded-full p-3 ${step === 'preview' ? 'bg-emerald-500/10' : 'bg-slate-700/50'}`}>
                    <FileSpreadsheet className={`h-7 w-7 ${step === 'preview' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  {file ? (
                    <div>
                      <p className="text-sm font-semibold text-white">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{humanFileSize(file.size)}</p>
                      {rowCount !== null && (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-xs font-semibold text-emerald-300">
                            {rowCount.toLocaleString()} rows detected
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Drop your <span className="text-sky-400">.xlsx</span> file here
                      </p>
                      <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                    </div>
                  )}
                </>
              )}

              {/* State: parsing */}
              {step === 'parsing' && (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
                  <p className="text-sm font-semibold text-slate-200">Parsing Excel file…</p>
                  <p className="text-xs text-slate-500">Reading worksheets</p>
                </div>
              )}

              {/* State: uploading */}
              {step === 'uploading' && (
                <div className="w-full flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                  <p className="text-sm font-semibold text-slate-200">Syncing to Firestore…</p>
                  <div className="w-full rounded-full bg-slate-700 h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{progress}% complete</p>
                </div>
              )}

              {/* State: success */}
              {step === 'success' && (
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </motion.div>
                  <p className="text-sm font-bold text-emerald-300">Sync Complete!</p>
                  <p className="text-xs text-slate-400">
                    {rowCount?.toLocaleString()} rows written to Firestore
                  </p>
                </div>
              )}

              {/* State: error */}
              {step === 'error' && (
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 text-rose-400" />
                  <p className="text-sm font-semibold text-rose-300">Upload Failed</p>
                  <p className="text-xs text-slate-400 max-w-xs whitespace-pre-wrap">{errorMsg}</p>
                </div>
              )}
            </div>

            {/* ── Help text ─────────────────────────────────────────────── */}
            {step === 'idle' && (
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {mode === 'master'
                  ? 'Upload the live tracker workbook containing all 19 engineering sheets. All existing Firestore data will be replaced.'
                  : 'Upload any .xlsx file that contains the selected sheet tab. Only that sheet\u2019s Firestore collection will be updated.'}
              </p>
            )}
          </div>

          {/* ── Footer actions ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-slate-700/60 px-6 py-4 gap-3">
            {step === 'success' || step === 'error' ? (
              <>
                <button
                  onClick={reset}
                  id="btn-upload-again"
                  className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Upload Another File
                </button>
                <button
                  onClick={onClose}
                  id="btn-close-after-upload"
                  className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-600 transition"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  id="btn-cancel-upload"
                  className="rounded-lg border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSync}
                  disabled={step !== 'preview' || isLoading}
                  id="btn-sync-to-firestore"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Sync to Firestore
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
