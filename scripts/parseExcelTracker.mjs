import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const EXCEL_PATH = path.resolve(
  'src/excel/All Engineering Documents Tracker Live Document .xlsx'
);
const OUT_PATH = path.resolve('src/data/excelImported.json');

function formatDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function cellValue(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) return formatDate(value);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value;
  return String(value).trim();
}

function formatPercent(value) {
  if (value === '' || value == null) return '';
  if (typeof value === 'string' && value.includes('%')) return value;
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  const pct = num <= 1 ? num * 100 : num;
  return `${Math.round(pct)}%`;
}

function toNumber(value) {
  if (value === '' || value == null) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function isEmptyRow(values) {
  return values.every((value) => value === '' || value == null);
}

function sheetMatrix(wb, name) {
  const sheet = wb.Sheets[name];
  if (!sheet) return null;
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '', blankrows: true });
}

const SHEET_MAPS = [
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

function parseMappedSheet(matrix, spec) {
  const rows = [];
  const start = (spec.startRow || spec.headerRow + 1) - 1;

  for (let r = start; r < matrix.length; r += 1) {
    const excelRow = matrix[r] || [];
    const values = spec.keys.map((_, index) => cellValue(excelRow[index]));
    if (isEmptyRow(values)) continue;

    const first = String(values[0] ?? '').toLowerCase();
    if (first === 'total' || first.startsWith('cutoff')) continue;

    const record = { id: `${spec.id}_${rows.length + 1}` };
    spec.keys.forEach((key, index) => {
      record[key] = values[index] === '' ? '' : values[index];
    });
    rows.push(record);
  }

  return rows;
}

function parseReference(matrix) {
  const rows = [];
  const categories = (matrix[0] || []).map((value) => String(cellValue(value) || '').trim());

  for (let r = 1; r < matrix.length; r += 1) {
    const excelRow = matrix[r] || [];
    excelRow.forEach((raw, index) => {
      const value = cellValue(raw);
      if (!value) return;
      rows.push({
        id: `reference_${rows.length + 1}`,
        category: categories[index] || '',
        code: '',
        value: String(value),
        department: '',
        slaDays: '',
      });
    });
  }

  return rows;
}

function parseConclusion(matrix) {
  const headerIndex = matrix.findIndex((row) =>
    String(cellValue(row?.[0]) || '').toLowerCase().includes('transmittal')
  );
  const rows = [];
  const start = headerIndex >= 0 ? headerIndex + 1 : 2;

  for (let r = start; r < matrix.length; r += 1) {
    const excelRow = matrix[r] || [];
    const transmittal = String(cellValue(excelRow[0]) || '').trim();
    if (!transmittal) continue;
    if (transmittal.toLowerCase() === 'total') break;
    if (transmittal.toLowerCase() === 'transmittal/status') break;

    rows.push({
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
    String(cellValue(row?.[0]) || '').toLowerCase().includes('provision drawings')
  );
  const provisionRow = provisionIndex >= 0 ? matrix[provisionIndex] : [];
  const provisionSummary = {
    underHnwlUpdated: toNumber(provisionRow[1]),
    underCjvReview: toNumber(provisionRow[2]),
    underSystraReview: toNumber(provisionRow[3]),
    closedWithSystra: toNumber(provisionRow[4]),
    notSubmitted: toNumber(provisionRow[5]),
  };

  return { rows, provisionSummary };
}

const workbook = XLSX.readFile(EXCEL_PATH, { cellDates: true });
const sheets = {};

for (const spec of SHEET_MAPS) {
  const matrix = sheetMatrix(workbook, spec.excelName);
  if (!matrix) {
    console.warn('Missing worksheet:', spec.excelName);
    sheets[spec.id] = [];
    continue;
  }
  sheets[spec.id] = parseMappedSheet(matrix, spec);
  console.log(`${spec.id}: ${sheets[spec.id].length} rows`);
}

sheets.reference = parseReference(sheetMatrix(workbook, 'Reference') || []);
console.log(`reference: ${sheets.reference.length} rows`);

const { rows: conclusion, provisionSummary } = parseConclusion(sheetMatrix(workbook, 'Conclusion') || []);
console.log(`conclusion: ${conclusion.length} rows`);

const payload = {
  version: 'excel-live-v1',
  sourceFile: 'All Engineering Documents Tracker Live Document .xlsx',
  importedAt: new Date().toISOString(),
  sheets,
  conclusion,
  provisionSummary,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(payload));
console.log('Wrote', OUT_PATH);
