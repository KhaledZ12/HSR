import ExcelJS from 'exceljs';
import { SHEET_DEFINITIONS } from '../data/constants';
import { ConclusionRow } from '../types';

const FONT_FAMILY = 'Segoe UI';
const HEADER_BG = 'FF1F4E78';
const HEADER_FONT = 'FFFFFFFF';
const ZEBRA_BG = 'FFF8F9FA';
const WHITE_BG = 'FFFFFFFF';
const DATA_FONT = 'FF1F2937';
const GRID_BORDER = 'FFD9D9D9';
const HEADER_BORDER = 'FF7F7F7F';

const STATUS_DATE_KEYWORDS = [
  'status',
  'rev',
  'revision',
  'date',
  'wf',
  'wf no',
  'code',
  'ref',
  'id',
  'transmittal no',
  'system code',
  'item',
  'serial',
  's/n',
];

const METRIC_NUMERIC_KEYWORDS = [
  'total',
  'submitted',
  'approved',
  'rejected',
  '%',
  'percent',
  'percentage',
  'count',
  'qty',
  'quantity',
  'amount',
  'no.',
];

const MIN_COL_WIDTH = 12;
const MAX_COL_WIDTH = 65;

type HorizontalAlign = 'left' | 'center' | 'right';

function isNumericValue(value: unknown): boolean {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !Number.isNaN(Number(trimmed.replace(/,/g, '')));
}

function determineColumnAlignment(header: string, sampleValues: unknown[]): HorizontalAlign {
  const cleanHeader = (header || '').trim().toLowerCase();

  if (METRIC_NUMERIC_KEYWORDS.some((keyword) => cleanHeader.includes(keyword))) {
    return 'right';
  }

  if (STATUS_DATE_KEYWORDS.some((keyword) => cleanHeader.includes(keyword))) {
    return 'center';
  }

  const nonEmpty = sampleValues.filter(
    (value) => value !== null && value !== undefined && String(value).trim() !== ''
  );

  if (nonEmpty.length > 0) {
    const numericCount = nonEmpty.filter((value) => isNumericValue(value)).length;
    if (numericCount / nonEmpty.length >= 0.7) {
      return 'right';
    }
  }

  return 'left';
}

function cellDisplayLength(value: ExcelJS.CellValue): number {
  if (value === null || value === undefined) return 0;

  if (typeof value === 'object') {
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.reduce((sum, part) => sum + String(part.text ?? '').length, 0);
    }
    if ('text' in value && typeof value.text === 'string') {
      return value.text.length;
    }
    if (value instanceof Date) {
      return value.toLocaleDateString().length;
    }
    return String(value).length;
  }

  const text = String(value).trim();
  if (!text) return 0;

  return Math.max(...text.split('\n').map((line) => line.length));
}

function autoFitColumns(worksheet: ExcelJS.Worksheet) {
  worksheet.columns.forEach((column) => {
    let maxLength = MIN_COL_WIDTH;

    column.eachCell?.({ includeEmpty: false }, (cell) => {
      maxLength = Math.max(maxLength, cellDisplayLength(cell.value));
    });

    column.width = Math.max(MIN_COL_WIDTH, Math.min(maxLength + 4, MAX_COL_WIDTH));
  });
}

function applyWorksheetFormatting(worksheet: ExcelJS.Worksheet) {
  if (!worksheet.rowCount || !worksheet.columnCount) return;

  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;

  const columnAlignments: HorizontalAlign[] = [];

  for (let col = 1; col <= worksheet.columnCount; col += 1) {
    const headerCell = worksheet.getCell(1, col);
    const headerText = String(headerCell.value ?? '');

    const sampleValues: unknown[] = [];
    for (let row = 2; row <= Math.min(worksheet.rowCount, 15); row += 1) {
      sampleValues.push(worksheet.getCell(row, col).value);
    }

    columnAlignments[col - 1] = determineColumnAlignment(headerText, sampleValues);

    headerCell.font = {
      name: FONT_FAMILY,
      size: 11,
      bold: true,
      color: { argb: HEADER_FONT },
    };
    headerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: HEADER_BG },
    };
    headerCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    headerCell.border = {
      top: { style: 'medium', color: { argb: HEADER_BORDER } },
      left: { style: 'medium', color: { argb: HEADER_BORDER } },
      bottom: { style: 'medium', color: { argb: HEADER_BORDER } },
      right: { style: 'medium', color: { argb: HEADER_BORDER } },
    };
  }

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.height = 21;

    const rowFill = rowNumber % 2 === 0 ? ZEBRA_BG : WHITE_BG;

    for (let col = 1; col <= worksheet.columnCount; col += 1) {
      const cell = row.getCell(col);
      cell.font = {
        name: FONT_FAMILY,
        size: 10,
        color: { argb: DATA_FONT },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowFill },
      };
      cell.alignment = {
        horizontal: columnAlignments[col - 1],
        vertical: 'middle',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: GRID_BORDER } },
        left: { style: 'thin', color: { argb: GRID_BORDER } },
        bottom: { style: 'thin', color: { argb: GRID_BORDER } },
        right: { style: 'thin', color: { argb: GRID_BORDER } },
      };
    }
  }

  autoFitColumns(worksheet);

  worksheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
}

function addStyledSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  headers: string[],
  rows: Record<string, unknown>[]
) {
  const worksheet = workbook.addWorksheet(sheetName.substring(0, 31));

  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: MIN_COL_WIDTH,
  }));

  rows.forEach((row) => {
    const orderedRow: Record<string, unknown> = {};
    headers.forEach((header) => {
      orderedRow[header] = row[header] ?? '';
    });
    worksheet.addRow(orderedRow);
  });

  applyWorksheetFormatting(worksheet);

  // Add Excel AutoFilter on the header row
  if (headers.length > 0) {
    const lastCol = worksheet.getColumn(headers.length);
    const lastColLetter = lastCol.letter;
    worksheet.autoFilter = `A1:${lastColLetter}1`;
  }

  return worksheet;
}

function mapRowsToExportData(
  data: Record<string, unknown>[],
  headers: { key: string; label: string }[]
): Record<string, unknown>[] {
  return data.map((row) => {
    const cleanRow: Record<string, unknown> = {};
    headers.forEach((col) => {
      cleanRow[col.label] = row[col.key] ?? '';
    });
    return cleanRow;
  });
}

function buildExportRows(
  sheetId: string,
  data: Record<string, unknown>[]
): { headers: string[]; rows: Record<string, unknown>[] } {
  const sheetDef = SHEET_DEFINITIONS.find((sheet) => sheet.id === sheetId);

  if (sheetDef && sheetDef.columns.length > 0) {
    const headers = sheetDef.columns.map((col) => col.label);
    return {
      headers,
      rows: mapRowsToExportData(data, sheetDef.columns),
    };
  }

  if (data.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(data[0]).filter((key) => key !== 'id');
  const rows = data.map((row) => {
    const cleanRow: Record<string, unknown> = {};
    headers.forEach((header) => {
      cleanRow[header] = row[header] ?? '';
    });
    return cleanRow;
  });

  return { headers, rows };
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, fileName: string) {
  workbook.creator = 'HSR Engineering Document Tracker';
  workbook.created = new Date();
  workbook.modified = new Date();

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportSingleSheetToExcel(
  sheetId: string,
  data: Record<string, unknown>[],
  customFilename?: string
) {
  const sheetDef = SHEET_DEFINITIONS.find((sheet) => sheet.id === sheetId);
  const cleanTitle = sheetDef ? sheetDef.name.replace(/^[0-9]+\.\s*/, '') : sheetId;
  const fileName =
    customFilename ||
    `HSR_${cleanTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const { headers, rows } = buildExportRows(sheetId, data);
  const workbook = new ExcelJS.Workbook();
  addStyledSheet(workbook, cleanTitle, headers, rows);
  await downloadWorkbook(workbook, fileName);
}

export function buildConclusionExportData(
  conclusionRows: ConclusionRow[],
  provisionSummary?: {
    underHnwlUpdated: number;
    underCjvReview: number;
    underSystraReview: number;
    closedWithSystra: number;
    notSubmitted: number;
  }
) {
  const totalRow = conclusionRows.reduce(
    (acc, cur) => ({
      totalDocs: acc.totalDocs + cur.totalDocs,
      submittedHnwl: acc.submittedHnwl + cur.submittedHnwl,
      notSubmittedHnwl: acc.notSubmittedHnwl + cur.notSubmittedHnwl,
      underHnwlUpdate: acc.underHnwlUpdate + cur.underHnwlUpdate,
      underCjvReview: acc.underCjvReview + cur.underCjvReview,
      underSafetyReview: acc.underSafetyReview + cur.underSafetyReview,
      underSmoReview: acc.underSmoReview + cur.underSmoReview,
      underSystraReview: acc.underSystraReview + cur.underSystraReview,
      approvedWithComments: acc.approvedWithComments + cur.approvedWithComments,
      rejected: acc.rejected + cur.rejected,
    }),
    {
      totalDocs: 0,
      submittedHnwl: 0,
      notSubmittedHnwl: 0,
      underHnwlUpdate: 0,
      underCjvReview: 0,
      underSafetyReview: 0,
      underSmoReview: 0,
      underSystraReview: 0,
      approvedWithComments: 0,
      rejected: 0,
    }
  );

  const totalSubmittedPct = totalRow.totalDocs ? Math.round((totalRow.submittedHnwl / totalRow.totalDocs) * 100) : 0;
  const totalNotSubmittedPct = totalRow.totalDocs ? (100 - totalSubmittedPct) : 0;
  const totalApprovedPct = totalRow.submittedHnwl ? Math.round((totalRow.approvedWithComments / totalRow.submittedHnwl) * 100) : 0;
  const totalRejectedPct = totalRow.submittedHnwl ? Math.round((totalRow.rejected / totalRow.submittedHnwl) * 100) : 0;

  const exportData: Record<string, unknown>[] = conclusionRows.map((row) => ({
    'Transmittal/Status': row.transmittal,
    'Total No. of Documents (1st Batch)': row.totalDocs,
    'Total submitted from HNWL': row.submittedHnwl,
    '% of Total submitted from HNWL': row.pctSubmittedHnwl,
    'Not Submitted from HNWL': row.notSubmittedHnwl,
    '% of Total Not submitted from HNWL': row.pctNotSubmittedHnwl,
    'Under HNWL updated': row.underHnwlUpdate,
    'Under CJV Review': row.underCjvReview,
    'Under Safety Review': row.underSafetyReview,
    'Under SMO Review': row.underSmoReview,
    'Under Systra Review': row.underSystraReview,
    'Approved with Comments': row.approvedWithComments,
    '% of Approved from SYS': row.pctApprovedFromSys,
    'Rejected': row.rejected,
    '% of Rejected from SYS': row.pctRejectedFromSys,
  }));

  exportData.push({
    'Transmittal/Status': 'Total',
    'Total No. of Documents (1st Batch)': totalRow.totalDocs,
    'Total submitted from HNWL': totalRow.submittedHnwl,
    '% of Total submitted from HNWL': `${totalSubmittedPct}%`,
    'Not Submitted from HNWL': totalRow.notSubmittedHnwl,
    '% of Total Not submitted from HNWL': `${totalNotSubmittedPct}%`,
    'Under HNWL updated': totalRow.underHnwlUpdate,
    'Under CJV Review': totalRow.underCjvReview,
    'Under Safety Review': totalRow.underSafetyReview,
    'Under SMO Review': totalRow.underSmoReview,
    'Under Systra Review': totalRow.underSystraReview,
    'Approved with Comments': totalRow.approvedWithComments,
    '% of Approved from SYS': `${totalApprovedPct}%`,
    'Rejected': totalRow.rejected,
    '% of Rejected from SYS': `${totalRejectedPct}%`,
  });

  if (provisionSummary) {
    exportData.push({});
    exportData.push({
      'Transmittal/Status': 'Provision Drawings Summary',
      'Under HNWL updated': provisionSummary.underHnwlUpdated,
      'Under CJV Review': provisionSummary.underCjvReview,
      'Under Systra Review': provisionSummary.underSystraReview,
      'Approved with Comments': provisionSummary.closedWithSystra,
      'Not Submitted from HNWL': provisionSummary.notSubmitted,
    });
  }

  return exportData;
}

export async function exportMasterWorkbook(
  sheetsState: Record<string, Record<string, unknown>[]>,
  conclusionRows: ConclusionRow[],
  provisionSummary?: {
    underHnwlUpdated: number;
    underCjvReview: number;
    underSystraReview: number;
    closedWithSystra: number;
    notSubmitted: number;
  }
) {
  const workbook = new ExcelJS.Workbook();

  const conclusionHeaders = [
    'Transmittal/Status',
    'Total No. of Documents (1st Batch)',
    'Total submitted from HNWL',
    '% of Total submitted from HNWL',
    'Not Submitted from HNWL',
    '% of Total Not submitted from HNWL',
    'Under HNWL updated',
    'Under CJV Review',
    'Under Safety Review',
    'Under SMO Review',
    'Under Systra Review',
    'Approved with Comments',
    '% of Approved from SYS',
    'Rejected',
    '% of Rejected from SYS',
  ];

  const conclusionExport = buildConclusionExportData(conclusionRows, provisionSummary);

  addStyledSheet(workbook, 'Master Conclusion', conclusionHeaders, conclusionExport);

  SHEET_DEFINITIONS.forEach((sheetDef) => {
    if (sheetDef.id === 'conclusion' || sheetDef.id === 'python_code') return;

    const data = sheetsState[sheetDef.id] || [];
    const { headers, rows } = buildExportRows(sheetDef.id, data);

    const sheetTabName = sheetDef.name
      .replace(/^[0-9]+\.\s*/, '')
      .replace(/[/\\?*:[\]]/g, '')
      .substring(0, 31);

    addStyledSheet(workbook, sheetTabName, headers, rows);
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(workbook, `HSR_Master_Engineering_Tracker_${timestamp}.xlsx`);
}
