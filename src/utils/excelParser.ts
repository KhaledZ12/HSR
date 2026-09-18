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
    keys: ['stationName', 'hnwlStatus', 'dateHnwl', 'systraStatus', 'dateSystra', 'comments'],
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
    excelName: 'TEL Room Passenger Stations',
    headerRow: 2,
    keys: [
      'station', 'roomName', 'statusHoneywell', 'plannedSubmissionDate', 'cjvRemarks',
      'smoStatus', 'wfNo', 'officialAconexReview', 'statusSystra', 'officialAconexRelease', 'dateSystraResponse',
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

const TAB_ALIASES: Record<string, string[]> = {
  technical_rooms: [
    'TEL Room Passenger Stations',
    'TEL Rooms Status',
    'Technical Rooms',
    'Technical Room',
    'TEL Rooms Passenger Stations',
    'TEL Rooms',
    'TEL Passenger Stations',
    'Rooms Status',
  ],
  ict_stations: ['ICT DD (Stations)', 'ICT DD (Stations) ', 'ICT Stations', 'ICT DD Stations'],
  elv_stations: ['ELV DD (Stations)', 'ELV DD (Stations) ', 'ELV Stations', 'ELV DD Stations'],
  installation_details: ['Instalaltion Details', 'Installation Details', 'Installation details'],
  provision_drawings: ['Provision Drawings', 'Provision drawings', 'Provision Drawings '],
  lld: ['LLD ', 'LLD', 'LLD Status'],
};

/**
 * Propagates merged cell values across the entire merge range.
 * In Excel/SheetJS, only the top-left cell of a merge range holds the value;
 * all other cells in the merge range are empty/undefined.
 * This function copies the top-left cell's value and formatting to every cell
 * inside the merge rectangle so that every row has its complete data.
 */
function propagateMergedCells(sheet: XLSX.WorkSheet): void {
  if (!sheet || !sheet['!merges'] || !Array.isArray(sheet['!merges'])) return;

  for (const merge of sheet['!merges']) {
    const startAddr = XLSX.utils.encode_cell(merge.s);
    const startCell = sheet[startAddr];
    if (!startCell || startCell.v === undefined || startCell.v === '') continue;

    for (let r = merge.s.r; r <= merge.e.r; r++) {
      for (let c = merge.s.c; c <= merge.e.c; c++) {
        if (r === merge.s.r && c === merge.s.c) continue;
        const cellAddr = XLSX.utils.encode_cell({ r, c });
        sheet[cellAddr] = {
          t: startCell.t,
          v: startCell.v,
          w: startCell.w,
          z: startCell.z,
        };
      }
    }
  }
}

function sheetMatrix(wb: XLSX.WorkBook, name: string, sheetId?: string): Matrix | null {
  let sheet = wb.Sheets[name];

  // 1. Try case-insensitive trimmed match
  if (!sheet) {
    const trimmedTarget = name.trim().toLowerCase();
    const match = wb.SheetNames.find((s) => s.trim().toLowerCase() === trimmedTarget);
    if (match) {
      sheet = wb.Sheets[match];
    }
  }

  // 2. Try aliases if sheetId is provided
  if (!sheet && sheetId && TAB_ALIASES[sheetId]) {
    for (const alias of TAB_ALIASES[sheetId]) {
      if (wb.Sheets[alias]) {
        sheet = wb.Sheets[alias];
        break;
      }
      const lowerAlias = alias.trim().toLowerCase();
      const match = wb.SheetNames.find((s) => s.trim().toLowerCase() === lowerAlias);
      if (match) {
        sheet = wb.Sheets[match];
        break;
      }
    }
  }

  // 3. Fallback fuzzy search for technical_rooms
  if (!sheet && sheetId === 'technical_rooms') {
    const fuzzyMatch = wb.SheetNames.find((s) => {
      const lower = s.toLowerCase();
      return (lower.includes('tel') && lower.includes('room')) || lower.includes('technical');
    });
    if (fuzzyMatch) {
      sheet = wb.Sheets[fuzzyMatch];
    }
  }

  if (!sheet) return null;

  // Propagate merged cells strictly for technical_rooms
  if (sheetId === 'technical_rooms') {
    propagateMergedCells(sheet);
  }

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
  let headerRowIndex = -1;
  const keyToIndexMap: Record<string, number> = {};

  // 1. Inspect top rows to dynamically detect the header row and map columns
  for (let r = 0; r < Math.min(matrix.length, 8); r++) {
    const row = (matrix[r] as unknown[]) || [];
    const lowerCells = row.map((c) => String(cellValue(c) || '').toLowerCase().trim());

    if (spec.id === 'technical_rooms') {
      const tempMap: Record<string, number> = {};
      let matches = 0;

      lowerCells.forEach((cellText, colIdx) => {
        if (!cellText) return;
        if ((cellText.includes('station') || cellText.includes('location')) && tempMap['station'] === undefined) {
          tempMap['station'] = colIdx;
          matches++;
        } else if (cellText.includes('room') && tempMap['roomName'] === undefined) {
          tempMap['roomName'] = colIdx;
          matches++;
        } else if (cellText.includes('hnwl') && (cellText.includes('status') || cellText.includes('planned')) && tempMap['statusHoneywell'] === undefined) {
          if (cellText.includes('planned') || cellText.includes('date')) {
            tempMap['plannedSubmissionDate'] = colIdx;
          } else {
            tempMap['statusHoneywell'] = colIdx;
          }
          matches++;
        } else if ((cellText.includes('planned') || cellText.includes('submission')) && tempMap['plannedSubmissionDate'] === undefined) {
          tempMap['plannedSubmissionDate'] = colIdx;
          matches++;
        } else if ((cellText.includes('cjv') || cellText.includes('remark')) && tempMap['cjvRemarks'] === undefined) {
          tempMap['cjvRemarks'] = colIdx;
          matches++;
        } else if (cellText.includes('smo') && tempMap['smoStatus'] === undefined) {
          tempMap['smoStatus'] = colIdx;
          matches++;
        } else if ((cellText.includes('wf') || cellText.includes('wf.no')) && tempMap['wfNo'] === undefined) {
          tempMap['wfNo'] = colIdx;
          matches++;
        } else if (cellText.includes('aconex') && cellText.includes('review') && tempMap['officialAconexReview'] === undefined) {
          tempMap['officialAconexReview'] = colIdx;
          matches++;
        } else if (cellText.includes('systra') && !cellText.includes('release') && !cellText.includes('response') && !cellText.includes('date') && tempMap['statusSystra'] === undefined) {
          tempMap['statusSystra'] = colIdx;
          matches++;
        } else if ((cellText.includes('release') || (cellText.includes('aconex') && cellText.includes('systra'))) && tempMap['officialAconexRelease'] === undefined) {
          tempMap['officialAconexRelease'] = colIdx;
          matches++;
        } else if ((cellText.includes('response') || cellText.includes('receiving') || cellText.includes('official response')) && tempMap['dateSystraResponse'] === undefined) {
          tempMap['dateSystraResponse'] = colIdx;
          matches++;
        }
      });

      if (matches >= 3) {
        headerRowIndex = r;
        Object.assign(keyToIndexMap, tempMap);
        break;
      }
    }
  }

  // Fallback to positional mapping if dynamic mapping wasn't found or for unmapped keys
  spec.keys.forEach((key, idx) => {
    if (keyToIndexMap[key] === undefined) {
      keyToIndexMap[key] = idx;
    }
  });

  const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
  let currentStation = '';

  for (let r = startRow; r < matrix.length; r++) {
    const excelRow = (matrix[r] as unknown[]) || [];
    const values = spec.keys.map((key) => cellValue(excelRow[keyToIndexMap[key]]));
    if (isEmptyRow(values)) continue;

    const first = String(values[0] ?? '').toLowerCase();
    if (first === 'total' || first.startsWith('cutoff')) continue;

    // Detect header row keywords to skip redundant header lines
    let headerMatches = 0;
    for (const v of values) {
      const lowerV = String(v).toLowerCase().trim();
      if (
        lowerV === 'no' || lowerV === 'no.' || lowerV === 'sn' || lowerV === 'serial' ||
        lowerV.includes('name') ||
        lowerV.includes('title') ||
        lowerV === 'rev' || lowerV === 'rev.' ||
        lowerV.includes('status') ||
        lowerV.includes('date') ||
        lowerV.includes('comment') ||
        lowerV.includes('system') ||
        lowerV.includes('remarks')
      ) {
        headerMatches++;
      }
    }

    // If 4 or more columns match header keywords, it's definitively a header row
    if (headerMatches >= 4) {
      continue;
    }

    const record: HSRRow = { id: `${spec.id}_${rows.length + 1}` };
    spec.keys.forEach((key) => {
      record[key] = values[spec.keys.indexOf(key)] === '' ? '' : values[spec.keys.indexOf(key)];
    });

    // Forward-fill station strictly for technical_rooms
    // in case the Excel user didn't merge cells but left blank rows under a station
    if (spec.id === 'technical_rooms') {
      const stationVal = String(record['station'] || '').trim();
      if (stationVal) {
        currentStation = stationVal;
      } else if (currentStation && (record['roomName'] || record['wfNo'] || record['smoStatus'])) {
        record['station'] = currentStation;
      }
    }

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

  const matrix = sheetMatrix(wb, spec.excelName, spec.id);
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
    const matrix = sheetMatrix(wb, spec.excelName, spec.id);
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
