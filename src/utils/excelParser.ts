/**
 * Browser-side Excel parser for the HSR Engineering Document Tracker.
 * Mirrors the logic in scripts/parseExcelTracker.mjs using SheetJS (xlsx)
 * which is already bundled as a production dependency.
 */
import * as XLSX from 'xlsx';
import { ConclusionRow, HSRRow, SheetId } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MasterWorkbookPayload {
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
}

// ---------------------------------------------------------------------------
// SHEET_MAPS – mirrors scripts/parseExcelTracker.mjs
// ---------------------------------------------------------------------------

export interface SheetSpec {
  id: string;
  excelName: string;
  headerRow: number;
  startRow?: number;
  keys: string[];
}

export const SHEET_MAPS: SheetSpec[] = [
  {
    id: 'ict_stations',
    excelName: 'ICT DD (Stations) ',
    headerRow: 3,
    keys: [
      'no', 'stationName', 'stationRef', 'telSubSystems', 'docTitle', 'docNo', 'rev',
      'statusHoneywell', 'statusDateHnwl', 'docWfStatus', 'wfNo', 'smoDate',
      'statusSystra', 'statusDateSys', 'reasonsReturn', 'comment',
    ],
  },
  {
    id: 'ict_depot',
    excelName: 'ICT DD (Depot)',
    headerRow: 3,
    keys: [
      'buildingName', 'buildingRef', 'telSubSystems', 'docTitle', 'docNo', 'rev',
      'statusHoneywell', 'statusDateHnwl', 'docWfStatus', 'wfNo', 'smoDate',
      'statusSystra', 'statusDateSys', 'reasonsReturn', 'comment',
    ],
  },
  {
    id: 'ict_sp',
    excelName: 'ICT DD - Service Point',
    headerRow: 3,
    keys: [
      'buildingName', 'buildingRef', 'telSubSystems', 'docTitle', 'docNo', 'rev',
      'statusHoneywell', 'statusDateHnwl', 'docWfStatus', 'wfNo', 'smoDate',
      'statusSystra', 'statusDateSys', 'reasonsReturn', 'comment',
    ],
  },
  {
    id: 'elv_stations',
    excelName: 'ELV DD (Stations) ',
    headerRow: 3,
    keys: [
      'no', 'stationName', 'stationRef', 'telSubSystems', 'docTitle', 'docNo', 'rev',
      'statusHoneywell', 'statusDateHnwl', 'docWfStatus', 'wfNo', 'smoDate',
      'statusSystra', 'statusDateSys', 'comment',
    ],
  },
  {
    id: 'elv_depot',
    excelName: 'ELV DD (Depot)',
    headerRow: 3,
    keys: [
      'buildingName', 'telSubSystems', 'docTitle', 'docNo', 'rev',
      'statusHoneywell', 'statusDateHnwl', 'docWfStatus', 'wfNo', 'smoDate',
      'statusSystra', 'statusDateSys', 'reasonsReturn', 'comment',
    ],
  },
  {
    id: 'elv_sp',
    excelName: 'ELV DD - Service Point',
    headerRow: 3,
    keys: [
      'locationName', 'buildingName', 'buildingRef', 'telSubSystems', 'docTitle', 'docNo', 'rev',
      'statusHoneywell', 'statusDateHnwl', 'docWfStatus', 'wfNo', 'smoDate',
      'statusSystra', 'statusDateSys', 'reasonsReturn', 'comment',
    ],
  },
  {
    id: 'installation_details',
    excelName: 'Instalaltion Details',
    headerRow: 3,
    keys: [
      'system', 'docNo', 'docName', 'rev', 'statusHoneywell', 'statusDateHnwl',
      'docWfStatus', 'wfNo', 'smoDate', 'statusSystra', 'statusDateSys', 'reasonsReturn', 'comment',
    ],
  },
  {
    id: 'provision_drawings',
    excelName: 'Provision Drawings (Stations)',
    headerRow: 2,
    keys: ['stationName', 'rev', 'hnwlStatus', 'dateHnwl', 'systraStatus', 'dateSystra', 'comments'],
  },
  {
    id: 'sds',
    excelName: 'SDS',
    headerRow: 2,
    keys: ['serial', 'systemCode', 'submissionTitle', 'docNo', 'rev', 'documentStatus', 'status', 'remarks', 'hnwlStatus'],
  },
  {
    id: 'tps',
    excelName: 'TPS',
    headerRow: 3,
    keys: [
      'location', 'telSubSystems', 'docTitle', 'docNo', 'rev', 'statusHoneywell', 'statusDateHnwl',
      'docWfStatus', 'wfNo', 'smoDate', 'statusSystra', 'statusDateSys', 'reasonsReturn', 'comment',
    ],
  },
  {
    id: 'tss3',
    excelName: 'TSS3',
    headerRow: 0,
    startRow: 2,
    keys: ['docNo', 'docTitle', 'rev', 'systemCode', 'location', 'statusSystra', 'wfNo'],
  },
  {
    id: 'rcp',
    excelName: 'RCP',
    headerRow: 2,
    keys: ['sn', 'stationName', 'systraStatus', 'scope', 'sentMailDate', 'sysRfiNo', 'coordinatedStatus', 'transmittalRef'],
  },
  {
    id: 'itp',
    excelName: 'Inspection Test Report (ITP)',
    headerRow: 1,
    keys: ['docName', 'docNo', 'rev', 'status', 'wf'],
  },
  {
    id: 'technical_rooms',
    excelName: 'Technical Rooms',
    headerRow: 2,
    keys: [
      'station', 'roomName', 'statusHoneywell', 'executionStatus', 'asBuiltVsShop', 'completionPct',
      'remarks', 'comment', 'smoStatus', 'wfNo', 'statusDate', 'statusSystra', 'dateSystra',
    ],
  },
  {
    id: 'mos',
    excelName: 'Method of Statement (MOS)',
    headerRow: 2,
    keys: ['systems', 'docNo', 'wfNo', 'status', 'date'],
  },
  {
    id: 'fat',
    excelName: 'Factory Test Acceptance (FAT)',
    headerRow: 2,
    keys: ['systemCode', 'submissionTitle', 'docNo', 'rev', 'officiallyAconexDate', 'receivedFromSystra', 'docStatus'],
  },
  {
    id: 'lld',
    excelName: 'LLD ',
    headerRow: 2,
    keys: [
      'systemCode', 'submissionTitle', 'docNo', 'rev', 'statusHoneywell', 'statusDateHnwl',
      'docWfStatus', 'wfNo', 'smoDate', 'statusSystra', 'statusDateSys',
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers – mirrors the script helpers
// ---------------------------------------------------------------------------

function formatDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function cellValue(value: unknown): string | number | boolean {
  if (value == null || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) return formatDate(value);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value;
  return String(value).trim();
}

function formatPercent(value: unknown): string {
  if (value === '' || value == null) return '';
  if (typeof value === 'string' && value.includes('%')) return value;
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  const pct = num <= 1 ? num * 100 : num;
  return `${Math.round(pct)}%`;
}

function toNumber(value: unknown): number {
  if (value === '' || value == null) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function isEmptyRow(values: (string | number | boolean)[]): boolean {
  return values.every((v) => v === '' || v == null);
}

type Matrix = unknown[][];

function sheetMatrix(wb: XLSX.WorkBook, name: string): Matrix | null {
  const sheet = wb.Sheets[name];
  if (!sheet) return null;
  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: '',
    blankrows: true,
  }) as Matrix;
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function parseMappedSheet(matrix: Matrix, spec: SheetSpec): HSRRow[] {
  const rows: HSRRow[] = [];
  const start = (spec.startRow || spec.headerRow + 1) - 1;

  for (let r = start; r < matrix.length; r++) {
    const excelRow = (matrix[r] as unknown[]) || [];
    const values = spec.keys.map((_, idx) => cellValue(excelRow[idx]));
    if (isEmptyRow(values)) continue;

    const first = String(values[0] ?? '').toLowerCase();
    if (first === 'total' || first.startsWith('cutoff')) continue;

    const record: HSRRow = { id: `${spec.id}_${rows.length + 1}` };
    spec.keys.forEach((key, idx) => {
      record[key] = values[idx] === '' ? '' : values[idx];
    });
    rows.push(record);
  }

  return rows;
}

function parseReference(matrix: Matrix): HSRRow[] {
  const rows: HSRRow[] = [];
  const categories = (matrix[0] || []).map((v) => String(cellValue(v) || '').trim());

  for (let r = 1; r < matrix.length; r++) {
    const excelRow = (matrix[r] as unknown[]) || [];
    excelRow.forEach((raw, idx) => {
      const value = cellValue(raw);
      if (!value) return;
      rows.push({
        id: `reference_${rows.length + 1}`,
        category: categories[idx] || '',
        code: '',
        value: String(value),
        department: '',
        slaDays: '',
      });
    });
  }

  return rows;
}

function parseConclusion(matrix: Matrix): {
  rows: ConclusionRow[];
  provisionSummary: MasterWorkbookPayload['provisionSummary'];
} {
  const headerIndex = matrix.findIndex((row) =>
    String(cellValue((row as unknown[])?.[0]) || '').toLowerCase().includes('transmittal')
  );

  const conclusionRows: ConclusionRow[] = [];
  const start = headerIndex >= 0 ? headerIndex + 1 : 2;

  for (let r = start; r < matrix.length; r++) {
    const excelRow = (matrix[r] as unknown[]) || [];
    const transmittal = String(cellValue(excelRow[0]) || '').trim();
    if (!transmittal) continue;
    if (transmittal.toLowerCase() === 'total') break;
    if (transmittal.toLowerCase() === 'transmittal/status') break;

    conclusionRows.push({
      transmittal,
      totalDocs: toNumber(excelRow[1]),
      submittedHnwl: toNumber(excelRow[2]),
      pctSubmittedHnwl: formatPercent(excelRow[3]),
      notSubmittedHnwl: toNumber(excelRow[4]),
      pctNotSubmittedHnwl: formatPercent(excelRow[5]),
      underHnwlUpdate: toNumber(excelRow[6]),
      underCjvReview: toNumber(excelRow[7]),
      underSafetyReview: toNumber(excelRow[8]),
      underSmoReview: toNumber(excelRow[9]),
      underSystraReview: toNumber(excelRow[10]),
      approvedWithComments: toNumber(excelRow[11]),
      pctApprovedFromSys: formatPercent(excelRow[12]),
      rejected: toNumber(excelRow[13]),
      pctRejectedFromSys: formatPercent(excelRow[14]),
    });
  }

  const provisionIndex = matrix.findIndex((row) =>
    String(cellValue((row as unknown[])?.[0]) || '').toLowerCase().includes('provision drawings')
  );
  const provisionRow = (provisionIndex >= 0 ? matrix[provisionIndex] : []) as unknown[];
  const provisionSummary = {
    underHnwlUpdated: toNumber(provisionRow[1]),
    underCjvReview: toNumber(provisionRow[2]),
    underSystraReview: toNumber(provisionRow[3]),
    closedWithSystra: toNumber(provisionRow[4]),
    notSubmitted: toNumber(provisionRow[5]),
  };

  return { rows: conclusionRows, provisionSummary };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Read an .xlsx File into a SheetJS workbook (browser-compatible). */
async function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  const buffer = await file.arrayBuffer();
  return XLSX.read(buffer, { type: 'array', cellDates: true });
}

/**
 * Parse a single sheet from an uploaded .xlsx file.
 * The file must contain the relevant worksheet tab for the given sheetId.
 */
export async function parseSingleSheet(
  file: File,
  sheetId: SheetId
): Promise<{ rows: HSRRow[]; rowCount: number }> {
  const wb = await readWorkbook(file);

  if (sheetId === 'conclusion') {
    const matrix = sheetMatrix(wb, 'Conclusion');
    if (!matrix) throw new Error('Could not find the "Conclusion" tab in the uploaded file.');
    const { rows } = parseConclusion(matrix);
    return { rows: rows as unknown as HSRRow[], rowCount: rows.length };
  }

  if (sheetId === 'reference') {
    const matrix = sheetMatrix(wb, 'Reference');
    if (!matrix) throw new Error('Could not find the "Reference" tab in the uploaded file.');
    const rows = parseReference(matrix);
    return { rows, rowCount: rows.length };
  }

  const spec = SHEET_MAPS.find((s) => s.id === sheetId);
  if (!spec) throw new Error(`No parser defined for sheet "${sheetId}".`);

  const matrix = sheetMatrix(wb, spec.excelName);
  if (!matrix) {
    throw new Error(
      `Could not find a worksheet named "${spec.excelName}" in the uploaded file.\n` +
      `Available tabs: ${wb.SheetNames.join(', ')}`
    );
  }

  const rows = parseMappedSheet(matrix, spec);
  return { rows, rowCount: rows.length };
}

/**
 * Parse a complete master workbook (.xlsx with all 19 engineering sheets).
 * Returns the full payload that matches the excelImported.json shape.
 */
export async function parseMasterWorkbook(file: File): Promise<MasterWorkbookPayload> {
  const wb = await readWorkbook(file);
  const sheets: Record<string, HSRRow[]> = {};

  for (const spec of SHEET_MAPS) {
    const matrix = sheetMatrix(wb, spec.excelName);
    if (!matrix) {
      console.warn(`parseMasterWorkbook: missing worksheet "${spec.excelName}" – sheet will be empty.`);
      sheets[spec.id] = [];
      continue;
    }
    sheets[spec.id] = parseMappedSheet(matrix, spec);
  }

  // Reference sheet
  const refMatrix = sheetMatrix(wb, 'Reference');
  sheets['reference'] = refMatrix ? parseReference(refMatrix) : [];

  // Conclusion + provision summary
  const conclusionMatrix = sheetMatrix(wb, 'Conclusion');
  const { rows: conclusion, provisionSummary } = conclusionMatrix
    ? parseConclusion(conclusionMatrix)
    : {
        rows: [],
        provisionSummary: {
          underHnwlUpdated: 0,
          underCjvReview: 0,
          underSystraReview: 0,
          closedWithSystra: 0,
          notSubmitted: 0,
        },
      };

  return {
    version: `excel-upload-${Date.now()}`,
    sourceFile: file.name,
    importedAt: new Date().toISOString(),
    sheets,
    conclusion,
    provisionSummary,
  };
}
