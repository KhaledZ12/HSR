import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import path from 'path';

config();

const payload = JSON.parse(
  readFileSync(path.resolve('src/data/excelImported.json'), 'utf8')
);

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});

const db = getFirestore(app);
const BATCH_LIMIT = 400;
const SHEETS = 'sheets';
const ROWS = 'rows';

function conclusionDocId(row, index) {
  const slug = String(row.transmittal || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || `conclusion-${index + 1}`;
}

async function clearRows(sheetId) {
  const snapshot = await getDocs(collection(db, SHEETS, sheetId, ROWS));
  for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snapshot.docs.slice(i, i + BATCH_LIMIT).forEach((rowDoc) => batch.delete(rowDoc.ref));
    await batch.commit();
  }
}

async function writeRows(sheetId, rows) {
  for (let i = 0; i < rows.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    rows.slice(i, i + BATCH_LIMIT).forEach((row, offset) => {
      const id = String(row.id || conclusionDocId(row, i + offset));
      batch.set(doc(db, SHEETS, sheetId, ROWS, id), { ...row, __order: i + offset });
    });
    await batch.commit();
  }
}

if (!process.env.VITE_FIREBASE_PROJECT_ID || !process.env.VITE_FIREBASE_API_KEY) {
  throw new Error('Missing VITE_FIREBASE_* values in .env');
}

console.log('Uploading Excel tracker to Firestore project', process.env.VITE_FIREBASE_PROJECT_ID);

const sheetIds = [...Object.keys(payload.sheets), 'conclusion'];
for (const sheetId of sheetIds) {
  process.stdout.write(`Clearing ${sheetId}... `);
  await clearRows(sheetId);
  console.log('done');
}

for (const [sheetId, rows] of Object.entries(payload.sheets)) {
  process.stdout.write(`Writing ${sheetId} (${rows.length})... `);
  await writeRows(sheetId, rows);
  console.log('done');
}

process.stdout.write(`Writing conclusion (${payload.conclusion.length})... `);
await writeRows(
  'conclusion',
  payload.conclusion.map((row, index) => ({ ...row, id: conclusionDocId(row, index) }))
);
console.log('done');

await setDoc(doc(db, 'tracker_meta', 'seed'), {
  seeded: true,
  sourceVersion: payload.version,
  sourceFile: payload.sourceFile,
  seededAt: new Date().toISOString(),
  sheetCount: Object.keys(payload.sheets).length + 1,
  provisionSummary: payload.provisionSummary,
});

console.log('Firestore import complete.');
process.exit(0);
