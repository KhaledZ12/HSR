import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import excelImported from '../data/excelImported.json';
import { ConclusionRow, HSRRow } from '../types';
import { getDb } from './firebase';

const META_COLLECTION = 'tracker_meta';
const META_DOC = 'seed';
const SHEETS_COLLECTION = 'sheets';
const ROWS_COLLECTION = 'rows';
const ORDER_FIELD = '__order';
const BATCH_LIMIT = 400;

type ExcelPayload = {
  version: string;
  sourceFile: string;
  importedAt: string;
  sheets: Record<string, HSRRow[]>;
  conclusion: ConclusionRow[];
  provisionSummary: {
    underHnwlUpdated: number;
    underCjvReview: number;
    underSystraReview: number;
    closedWithSystra: number;
    notSubmitted: number;
  };
};

const EXCEL_DATA = excelImported as ExcelPayload;

export const SHEET_COLLECTION_IDS = Object.keys(EXCEL_DATA.sheets);
export const CONCLUSION_SHEET_ID = 'conclusion';
export const EXCEL_SOURCE_VERSION = EXCEL_DATA.version;

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

function fromFirestoreRow(data: Record<string, unknown>, fallbackId: string): HSRRow {
  const { [ORDER_FIELD]: _order, ...rest } = data;
  return {
    ...(rest as HSRRow),
    id: String(rest.id ?? fallbackId),
  };
}

function conclusionDocId(row: ConclusionRow, index: number): string {
  const slug = row.transmittal
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || `conclusion-${index + 1}`;
}

function rowsCollection(sheetId: string) {
  return collection(getDb(), SHEETS_COLLECTION, sheetId, ROWS_COLLECTION);
}

async function commitInBatches(
  items: Array<{ id: string; data: Record<string, unknown> }>,
  sheetId: string
) {
  const db = getDb();

  for (let i = 0; i < items.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    const chunk = items.slice(i, i + BATCH_LIMIT);

    chunk.forEach(({ id, data }) => {
      batch.set(doc(db, SHEETS_COLLECTION, sheetId, ROWS_COLLECTION, id), data);
    });

    await batch.commit();
  }
}

async function clearSheetRows(sheetId: string) {
  const snapshot = await getDocs(rowsCollection(sheetId));
  const db = getDb();

  for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snapshot.docs.slice(i, i + BATCH_LIMIT).forEach((rowDoc) => {
      batch.delete(rowDoc.ref);
    });
    await batch.commit();
  }
}

export async function syncExcelSourceToFirestore(): Promise<'imported' | 'skipped'> {
  const db = getDb();
  const metaRef = doc(db, META_COLLECTION, META_DOC);
  const metaSnap = await getDoc(metaRef);

  if (metaSnap.exists() && metaSnap.data()?.sourceVersion === EXCEL_SOURCE_VERSION) {
    return 'skipped';
  }

  const sheetIds = [...SHEET_COLLECTION_IDS, CONCLUSION_SHEET_ID];
  for (const sheetId of sheetIds) {
    await clearSheetRows(sheetId);
  }

  for (const [sheetId, rows] of Object.entries(EXCEL_DATA.sheets)) {
    const items = rows.map((row, index) => ({
      id: String(row.id),
      data: toFirestoreRow({ ...row }, index),
    }));
    await commitInBatches(items, sheetId);
  }

  const conclusionItems = EXCEL_DATA.conclusion.map((row, index) => ({
    id: conclusionDocId(row, index),
    data: toFirestoreRow({ ...row }, index),
  }));
  await commitInBatches(conclusionItems, CONCLUSION_SHEET_ID);

  await setDoc(metaRef, {
    seeded: true,
    sourceVersion: EXCEL_SOURCE_VERSION,
    sourceFile: EXCEL_DATA.sourceFile,
    seededAt: new Date().toISOString(),
    sheetCount: SHEET_COLLECTION_IDS.length + 1,
    provisionSummary: EXCEL_DATA.provisionSummary,
  });

  return 'imported';
}

export async function loadAllSheetsFromFirestore(): Promise<Record<string, HSRRow[]>> {
  const sheets: Record<string, HSRRow[]> = {};

  await Promise.all(
    SHEET_COLLECTION_IDS.map(async (sheetId) => {
      const snapshot = await getDocs(query(rowsCollection(sheetId), orderBy(ORDER_FIELD)));
      sheets[sheetId] = snapshot.docs.map((rowDoc) =>
        fromFirestoreRow(rowDoc.data() as Record<string, unknown>, rowDoc.id)
      );
    })
  );

  return sheets;
}

export async function loadConclusionFromFirestore(): Promise<ConclusionRow[]> {
  const snapshot = await getDocs(query(rowsCollection(CONCLUSION_SHEET_ID), orderBy(ORDER_FIELD)));

  return snapshot.docs.map((rowDoc) => {
    const data = rowDoc.data() as Record<string, unknown>;
    const { [ORDER_FIELD]: _order, id: _id, ...rest } = data;
    return rest as unknown as ConclusionRow;
  });
}

export async function loadProvisionSummaryFromFirestore() {
  const metaSnap = await getDoc(doc(getDb(), META_COLLECTION, META_DOC));
  const summary = metaSnap.data()?.provisionSummary;
  if (summary) return summary as ExcelPayload['provisionSummary'];
  return EXCEL_DATA.provisionSummary;
}

export async function updateSheetRow(
  sheetId: string,
  rowId: string,
  updatedFields: Record<string, unknown>
): Promise<void> {
  const payload = sanitizeForFirestore(updatedFields) as Record<string, unknown>;
  delete payload[ORDER_FIELD];
  await updateDoc(doc(getDb(), SHEETS_COLLECTION, sheetId, ROWS_COLLECTION, rowId), payload);
}

export async function addSheetRow(
  sheetId: string,
  row: HSRRow,
  order: number
): Promise<void> {
  await setDoc(
    doc(getDb(), SHEETS_COLLECTION, sheetId, ROWS_COLLECTION, row.id),
    toFirestoreRow({ ...row }, order)
  );
}

export async function deleteSheetRow(sheetId: string, rowId: string): Promise<void> {
  await deleteDoc(doc(getDb(), SHEETS_COLLECTION, sheetId, ROWS_COLLECTION, rowId));
}
