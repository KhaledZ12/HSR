/**
 * Firestore upload helpers for the HSR Excel import flow.
 * Reuses the exported batch-write helpers from firestoreData.ts.
 */
import { doc, setDoc } from 'firebase/firestore';
import { ConclusionRow, HSRRow } from '../types';
import { getDb } from './firebase';
import {
  clearSheetRows,
  commitInBatches,
  CONCLUSION_SHEET_ID,
} from './firestoreData';
import { MasterWorkbookPayload } from '../utils/excelParser';

const META_COLLECTION = 'tracker_meta';
const META_DOC = 'seed';
const SHEETS_COLLECTION = 'sheets';
const ROWS_COLLECTION = 'rows';
const ORDER_FIELD = '__order';

function sanitizeForFirestore(value: unknown): unknown {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(sanitizeForFirestore);
  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
      next[key] = sanitizeForFirestore(nested);
    });
    return next;
  }
  return value;
}

function toFirestoreRow(row: Record<string, unknown>, order: number): Record<string, unknown> {
  const payload = sanitizeForFirestore(row) as Record<string, unknown>;
  payload[ORDER_FIELD] = order;
  return payload;
}

function conclusionDocId(row: ConclusionRow, index: number): string {
  const slug = row.transmittal
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || `conclusion-${index + 1}`;
}

/**
 * Progress callback — called with (completed, total) after each sheet is written.
 */
export type ProgressCallback = (completed: number, total: number) => void;

/**
 * Sync a single parsed sheet (or conclusion) to Firestore.
 * Clears all existing rows then batch-writes the new ones.
 */
export async function uploadSingleSheet(
  sheetId: string,
  rows: HSRRow[],
  onProgress?: ProgressCallback
): Promise<void> {
  onProgress?.(0, 2);

  // If this is the conclusion sheet, handle ConclusionRow shape
  if (sheetId === CONCLUSION_SHEET_ID) {
    await clearSheetRows(CONCLUSION_SHEET_ID);
    onProgress?.(1, 2);

    const items = (rows as unknown as ConclusionRow[]).map((row, index) => ({
      id: conclusionDocId(row, index),
      data: toFirestoreRow({ ...row }, index),
    }));
    await commitInBatches(items, CONCLUSION_SHEET_ID);
    onProgress?.(2, 2);
    return;
  }

  await clearSheetRows(sheetId);
  onProgress?.(1, 2);

  const items = rows.map((row, index) => ({
    id: String(row.id),
    data: toFirestoreRow({ ...row }, index),
  }));
  await commitInBatches(items, sheetId);
  onProgress?.(2, 2);
}

/**
 * Sync a full master workbook payload to Firestore.
 * Clears and rewrites every sheet collection + conclusion, then bumps the meta doc.
 */
export async function uploadMasterWorkbook(
  payload: MasterWorkbookPayload,
  onProgress?: ProgressCallback
): Promise<void> {
  const sheetIds = Object.keys(payload.sheets);
  const total = sheetIds.length + 2; // +1 conclusion, +1 meta
  let completed = 0;

  // Engineering sheets
  for (const sheetId of sheetIds) {
    await clearSheetRows(sheetId);
    const rows = payload.sheets[sheetId];
    const items = rows.map((row, index) => ({
      id: String(row.id),
      data: toFirestoreRow({ ...row }, index),
    }));
    await commitInBatches(items, sheetId);
    completed++;
    onProgress?.(completed, total);
  }

  // Conclusion
  await clearSheetRows(CONCLUSION_SHEET_ID);
  const conclusionItems = payload.conclusion.map((row, index) => ({
    id: conclusionDocId(row, index),
    data: toFirestoreRow({ ...row }, index),
  }));
  await commitInBatches(conclusionItems, CONCLUSION_SHEET_ID);
  completed++;
  onProgress?.(completed, total);

  // Bump meta doc so the boot-time seed check doesn't re-seed from old bundled JSON
  const db = getDb();
  await setDoc(doc(db, META_COLLECTION, META_DOC), {
    seeded: true,
    sourceVersion: payload.version,
    sourceFile: payload.sourceFile,
    seededAt: payload.importedAt,
    sheetCount: sheetIds.length + 1,
    provisionSummary: payload.provisionSummary,
  });
  completed++;
  onProgress?.(completed, total);
}

/** Return the full Firestore path for a row doc (for debugging). */
export function rowDocPath(sheetId: string, rowId: string): string {
  return `${SHEETS_COLLECTION}/${sheetId}/${ROWS_COLLECTION}/${rowId}`;
}
