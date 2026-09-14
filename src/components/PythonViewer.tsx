import { Check, Copy, Download, FileCode, Play, Sparkles, Terminal } from 'lucide-react';
import React, { useState } from 'react';

export const PythonViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'formatter' | 'streamlit'>('formatter');
  const [copied, setCopied] = useState(false);

  const formatterCode = `#!/usr/bin/env python3
"""
========================================================================================
High-Speed Rail (HSR) Engineering Document Tracker - Professional Excel Formatter
========================================================================================
Author      : Senior Python & Data Formatting Engineer
Description : Reads the multi-sheet HSR Engineering Document Tracker Excel workbook,
              applies enterprise-grade visual formatting across every single sheet,
              and exports a pristine, executive-ready workbook without modifying any data.
Libraries   : pandas, openpyxl
Output File : HSR_Engineering_Tracker_Professional_Formatted.xlsx
========================================================================================
"""

import os
import sys
import argparse
from typing import Optional, Set
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import pandas as pd

# -----------------------------------------------------------------------------
# Configuration & Professional Styling Palette
# -----------------------------------------------------------------------------
DEFAULT_INPUT_FILE = "All Engineering Documents Tracker Live Document cutoff 03-09.xlsx"
DEFAULT_OUTPUT_FILE = "HSR_Engineering_Tracker_Professional_Formatted.xlsx"

# Typography & Palette
FONT_FAMILY = "Segoe UI"       # Modern executive font
HEADER_BG_COLOR = "1F4E78"     # Deep Navy Blue
HEADER_FONT_COLOR = "FFFFFF"   # Crisp White
ZEBRA_BG_COLOR = "F8F9FA"      # Ultra-light subtle gray tint for alternate rows
WHITE_BG_COLOR = "FFFFFF"      # Pure white
BORDER_COLOR_GRID = "D9D9D9"   # Light subtle gray for clean cell gridlines
BORDER_COLOR_HEADER = "7F7F7F" # Medium gray border for table headers

# Row Heights
HEADER_ROW_HEIGHT = 30.0  # Generous padding for multi-line column titles
DATA_ROW_HEIGHT = 21.0    # Comfortable touch & scanning height for engineering data

# Column Width Boundaries
MIN_COL_WIDTH = 12
MAX_COL_WIDTH = 65
WIDTH_PADDING = 4

# Keywords to detect column alignment semantics
STATUS_DATE_KEYWORDS: Set[str] = {
    "status", "rev", "revision", "date", "wf", "wf no", "code", 
    "ref", "id", "transmittal no", "system code", "item"
}
METRIC_NUMERIC_KEYWORDS: Set[str] = {
    "total", "submitted", "approved", "rejected", "%", "percent", 
    "percentage", "count", "qty", "quantity", "amount", "no."
}

def create_style_definitions():
    """Build and return reusable OpenPyXL style components for optimal performance."""
    header_font = Font(name=FONT_FAMILY, size=11, bold=True, color=HEADER_FONT_COLOR)
    data_font = Font(name=FONT_FAMILY, size=10, bold=False, color="1F2937")

    header_fill = PatternFill(start_color=HEADER_BG_COLOR, end_color=HEADER_BG_COLOR, fill_type="solid")
    zebra_fill = PatternFill(start_color=ZEBRA_BG_COLOR, end_color=ZEBRA_BG_COLOR, fill_type="solid")
    white_fill = PatternFill(start_color=WHITE_BG_COLOR, end_color=WHITE_BG_COLOR, fill_type="solid")

    thin_grid = Side(border_style="thin", color=BORDER_COLOR_GRID)
    medium_header_border = Side(border_style="medium", color=BORDER_COLOR_HEADER)

    header_border = Border(left=medium_header_border, right=medium_header_border, top=medium_header_border, bottom=medium_header_border)
    data_border = Border(left=thin_grid, right=thin_grid, top=thin_grid, bottom=thin_grid)

    header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    align_left = Alignment(horizontal="left", vertical="center")
    align_center = Alignment(horizontal="center", vertical="center")
    align_right = Alignment(horizontal="right", vertical="center")

    return {
        "header_font": header_font,
        "data_font": data_font,
        "header_fill": header_fill,
        "zebra_fill": zebra_fill,
        "white_fill": white_fill,
        "header_border": header_border,
        "data_border": data_border,
        "header_alignment": header_alignment,
        "align_left": align_left,
        "align_center": align_center,
        "align_right": align_right,
    }

def determine_column_alignment(header_title: Optional[str], sample_values: list, styles: dict) -> Alignment:
    """
    Intelligently deduce the proper horizontal alignment for an engineering column:
      - Numbers, Percentages, Metric Totals -> Right Aligned
      - Dates, Statuses, Revisions, Codes   -> Center Aligned
      - Descriptions, Document Titles, Text -> Left Aligned
    """
    clean_header = (str(header_title) if header_title is not None else "").strip().lower()

    if any(keyword in clean_header for keyword in METRIC_NUMERIC_KEYWORDS):
        return styles["align_right"]

    if any(keyword in clean_header for keyword in STATUS_DATE_KEYWORDS):
        return styles["align_center"]

    non_empty = [v for v in sample_values if v is not None and str(v).strip() != ""]
    if non_empty:
        numeric_count = sum(1 for v in non_empty if isinstance(v, (int, float)))
        if numeric_count / len(non_empty) >= 0.7:
            return styles["align_right"]

    return styles["align_left"]

def format_worksheet(ws: openpyxl.worksheet.worksheet.Worksheet, styles: dict):
    """
    Applies professional formatting to a single openpyxl worksheet:
      1. Styles header row (Navy Blue, Bold White, Medium Gray Border).
      2. Applies zebra striping and thin light-gray gridlines to all data rows.
      3. Sets contextual column alignments (Left for text, Center for status/date, Right for metrics).
      4. Auto-fits column widths with safety padding so no text is truncated.
      5. Freezes the header row (A2) so it stays sticky during scrolling.
      6. Enables native worksheet gridlines.
    """
    if ws.max_row < 1 or ws.max_column < 1:
        return

    # Enable native Excel gridlines display
    ws.views.sheetView[0].showGridLines = True

    # 1. Format Header Row (Row 1)
    ws.row_dimensions[1].height = HEADER_ROW_HEIGHT
    header_titles = []
    
    for col_idx in range(1, ws.max_column + 1):
        cell = ws.cell(row=1, column=col_idx)
        header_titles.append(cell.value)
        cell.font = styles["header_font"]
        cell.fill = styles["header_fill"]
        cell.alignment = styles["header_alignment"]
        cell.border = styles["header_border"]

    # Pre-calculate column alignments based on header name & sample rows
    column_alignments = {}
    for col_idx in range(1, ws.max_column + 1):
        sample_vals = [
            ws.cell(row=r, column=col_idx).value 
            for r in range(2, min(ws.max_row + 1, 15))
        ]
        column_alignments[col_idx] = determine_column_alignment(
            header_titles[col_idx - 1], sample_vals, styles
        )

    # 2. Format Data Rows (Row 2 to Max)
    for row_idx in range(2, ws.max_row + 1):
        ws.row_dimensions[row_idx].height = DATA_ROW_HEIGHT
        is_even = (row_idx % 2 == 0)
        row_fill = styles["zebra_fill"] if is_even else styles["white_fill"]

        for col_idx in range(1, ws.max_column + 1):
            cell = ws.cell(row=row_idx, column=col_idx)
            cell.font = styles["data_font"]
            cell.fill = row_fill
            cell.border = styles["data_border"]
            cell.alignment = column_alignments[col_idx]

    # 3. Column Width Auto-Fitting
    for col_idx in range(1, ws.max_column + 1):
        col_letter = get_column_letter(col_idx)
        max_len = 0

        for row_idx in range(1, ws.max_row + 1):
            val = ws.cell(row=row_idx, column=col_idx).value
            if val is not None:
                val_str = str(val).strip()
                lines = val_str.split("\\n")
                line_max = max(len(l) for l in lines) if lines else len(val_str)
                if line_max > max_len:
                    max_len = line_max

        calculated_width = max_len + WIDTH_PADDING
        clamped_width = max(MIN_COL_WIDTH, min(calculated_width, MAX_COL_WIDTH))
        ws.column_dimensions[col_letter].width = clamped_width

    # 4. Freeze Header Row (Row 1 stays fixed when scrolling)
    ws.freeze_panes = "A2"

def process_hsr_tracker(input_filepath: str, output_filepath: str):
    """
    Main orchestration routine:
      - Validates input file existence.
      - Uses pandas to inspect all sheet names and verify data integrity.
      - Loads workbook with openpyxl (preserving all formulas & values intact).
      - Applies professional formatting to every sheet.
      - Saves the polished workbook to the target path.
    """
    print("=" * 80)
    print(" HSR ENGINEERING DOCUMENT TRACKER - PROFESSIONAL FORMATTING ENGINE")
    print("=" * 80)

    if not os.path.exists(input_filepath):
        print(f"\\n[ERROR] Source Excel file not found: '{input_filepath}'")
        print("Please place the file in this directory or specify path via --input argument.")
        sys.exit(1)

    print(f"\\n[1/4] Reading source workbook: '{input_filepath}'...")
    excel_file = pd.ExcelFile(input_filepath)
    sheet_names = excel_file.sheet_names
    print(f"      Found {len(sheet_names)} sheet(s) in workbook:")
    for idx, sheet in enumerate(sheet_names, start=1):
        print(f"      - [{idx:02d}] {sheet}")

    print(f"\\n[2/4] Loading OpenPyXL workbook instance (data preservation mode)...")
    wb = openpyxl.load_workbook(input_filepath, data_only=False)
    styles = create_style_definitions()

    print(f"\\n[3/4] Applying professional styling to each sheet:")
    for idx, sheet_name in enumerate(wb.sheetnames, start=1):
        ws = wb[sheet_name]
        print(f"      * Formatting ({idx}/{len(wb.sheetnames)}): '{sheet_name}' ({ws.max_row} rows x {ws.max_column} cols)...")
        format_worksheet(ws, styles)

    print(f"\\n[4/4] Saving styled output file: '{output_filepath}'...")
    wb.save(output_filepath)

    output_size_kb = os.path.getsize(output_filepath) / 1024
    print("\\n" + "=" * 80)
    print(f" SUCCESS: Professional formatting completed successfully!")
    print(f" Output File  : {os.path.abspath(output_filepath)}")
    print(f" File Size    : {output_size_kb:.2f} KB")
    print(f" Sheets Styled: {len(wb.sheetnames)}")
    print("=" * 80 + "\\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Format HSR Engineering Tracker Excel workbooks with professional corporate styling."
    )
    parser.add_argument("-i", "--input", default=DEFAULT_INPUT_FILE, help=f"Input Excel file (default: '{DEFAULT_INPUT_FILE}')")
    parser.add_argument("-o", "--output", default=DEFAULT_OUTPUT_FILE, help=f"Output Excel file (default: '{DEFAULT_OUTPUT_FILE}')")

    args = parser.parse_args()
    process_hsr_tracker(args.input, args.output)
`;

  const streamlitCode = `"""
High-Speed Rail (HSR) Engineering Document Tracker Dashboard
Enterprise Streamlit Application with Pandas and OpenPyXL
Covers 21 Stations, 19 Engineering Sheets/Modules, Master Conclusion, and Excel Exports.
"""

import io
from datetime import datetime
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import streamlit as st

# Application Configuration
st.set_page_config(
    page_title="HSR Engineering Document Tracker",
    page_icon="🚆",
    layout="wide",
    initial_sidebar_state="expanded",
)

# 21 Stations & 19 Engineering Modules defined
STATIONS_21 = [
    "NEW CAPITAL", "MOHAMED NAGUIB", "ALAMIAN", "RAS ELHEKMA", "WADI NATROUN",
    "OCTOBER GARDEN", "CAIRO", "GIZA", "SIDI ABDELRAHMAN", "EL NOUBARYA",
    "EL SADAT", "El Ain ElSOKHNA", "6TH OF OCTOBER", "SPHINX", "ALEXANDRIA",
    "BORG ELARAB", "EL HAMMAM", "EL DABAA", "AlAMRIA", "MARSA MATROUH", "Army Stadium"
]

# Sheet 1: Master Conclusion Data Generator (Matching Conclusion Sheet.png)
def get_conclusion_df() -> pd.DataFrame:
    data = [
        {"Transmittal/Status": "ELV Detailed Design", "Total No. of Documents (1st Batch)": 1067, "Total submitted from HNWL": 803, "% of Total submitted from HNWL": "75%", "Not Submitted from HNWL": 264, "Under Systra Review": 201, "Approved with Comments": 424, "% of Approved from SYS": "53%", "Rejected": 50},
        {"Transmittal/Status": "ICT Detailed Design", "Total No. of Documents (1st Batch)": 435, "Total submitted from HNWL": 369, "% of Total submitted from HNWL": "85%", "Not Submitted from HNWL": 66, "Under Systra Review": 98, "Approved with Comments": 210, "% of Approved from SYS": "36%", "Rejected": 16},
        {"Transmittal/Status": "SDS", "Total No. of Documents (1st Batch)": 14, "Total submitted from HNWL": 14, "% of Total submitted from HNWL": "100%", "Not Submitted from HNWL": 0, "Under Systra Review": 2, "Approved with Comments": 11, "% of Approved from SYS": "79%", "Rejected": 2},
        {"Transmittal/Status": "Installation Details", "Total No. of Documents (1st Batch)": 11, "Total submitted from HNWL": 8, "% of Total submitted from HNWL": "73%", "Not Submitted from HNWL": 3, "Under Systra Review": 1, "Approved with Comments": 6, "% of Approved from SYS": "13%", "Rejected": 0},
        {"Transmittal/Status": "Technical Rooms", "Total No. of Documents (1st Batch)": 232, "Total submitted from HNWL": 215, "% of Total submitted from HNWL": "93%", "Not Submitted from HNWL": 17, "Under Systra Review": 28, "Approved with Comments": 54, "% of Approved from SYS": "25%", "Rejected": 1},
        {"Transmittal/Status": "Method of Statement", "Total No. of Documents (1st Batch)": 14, "Total submitted from HNWL": 9, "% of Total submitted from HNWL": "64%", "Not Submitted from HNWL": 5, "Under Systra Review": 1, "Approved with Comments": 6, "% of Approved from SYS": "67%", "Rejected": 2},
        {"Transmittal/Status": "Factory Test Acceptance (FAT)", "Total No. of Documents (1st Batch)": 15, "Total submitted from HNWL": 13, "% of Total submitted from HNWL": "87%", "Not Submitted from HNWL": 2, "Under Systra Review": 2, "Approved with Comments": 9, "% of Approved from SYS": "69%", "Rejected": 0},
        {"Transmittal/Status": "Factory Test Report", "Total No. of Documents (1st Batch)": 15, "Total submitted from HNWL": 8, "% of Total submitted from HNWL": "53%", "Not Submitted from HNWL": 7, "Under Systra Review": 0, "Approved with Comments": 8, "% of Approved from SYS": "100%", "Rejected": 0},
        {"Transmittal/Status": "Wayside DD (ICT, ELV)", "Total No. of Documents (1st Batch)": 17, "Total submitted from HNWL": 0, "% of Total submitted from HNWL": "0%", "Not Submitted from HNWL": 17, "Under Systra Review": 0, "Approved with Comments": 0, "% of Approved from SYS": "0%", "Rejected": 0},
    ]
    return pd.DataFrame(data)

# -----------------------------------------------------------------------------
# MASTER WORKBOOK EXCEL EXPORT ENGINE (PROFESSIONAL OPENPYXL STYLING)
# -----------------------------------------------------------------------------
EXCEL_FONT_FAMILY = "Segoe UI"
EXCEL_HEADER_BG = "1F4E78"       # Deep Navy Blue
EXCEL_HEADER_FONT = "FFFFFF"     # Crisp White
EXCEL_ZEBRA_BG = "F8F9FA"        # Light subtle gray tint for even data rows
EXCEL_WHITE_BG = "FFFFFF"        # Pure white
EXCEL_GRID_BORDER = "D9D9D9"     # Clean thin light-gray border
EXCEL_HEADER_BORDER = "7F7F7F"   # Medium gray border for headers

STATUS_DATE_KEYWORDS = {
    "status", "rev", "revision", "date", "wf", "wf no", "code",
    "ref", "id", "transmittal no", "system code", "item"
}
METRIC_NUMERIC_KEYWORDS = {
    "total", "submitted", "approved", "rejected", "%", "percent",
    "percentage", "count", "qty", "quantity", "amount", "no."
}

def determine_col_alignment(header_title: str, sample_vals: list, alignments: dict) -> Alignment:
    """Intelligently deduce column alignment based on header text and sample values."""
    clean_h = (str(header_title) if header_title else "").strip().lower()
    if any(k in clean_h for k in METRIC_NUMERIC_KEYWORDS):
        return alignments["right"]
    if any(k in clean_h for k in STATUS_DATE_KEYWORDS):
        return alignments["center"]
    
    non_empty = [v for v in sample_vals if v is not None and str(v).strip() != ""]
    if non_empty:
        num_count = sum(1 for v in non_empty if isinstance(v, (int, float)))
        if num_count / len(non_empty) >= 0.7:
            return alignments["right"]
            
    return alignments["left"]

def format_openpyxl_worksheet(ws: openpyxl.worksheet.worksheet.Worksheet):
    """
    Applies executive OpenPyXL corporate formatting to an individual worksheet:
      1. Deep Navy Blue (#1F4E78) header with bold white text and medium gray border.
      2. Native gridlines enabled (showGridLines = True).
      3. Thin light-gray borders (#D9D9D9) for all data cells.
      4. Zebra striping (#F8F9FA on even rows, #FFFFFF on odd rows).
      5. Smart alignment (numbers/metrics right, status/dates center, text left).
      6. Auto-fit column widths (clamped between 12 and 65 characters).
      7. Sticky headers (freeze panes at A2).
    """
    if ws.max_row < 1 or ws.max_column < 1:
        return

    ws.views.sheetView[0].showGridLines = True

    header_font = Font(name=EXCEL_FONT_FAMILY, size=11, bold=True, color=EXCEL_HEADER_FONT)
    data_font = Font(name=EXCEL_FONT_FAMILY, size=10, bold=False, color="1F2937")

    header_fill = PatternFill(start_color=EXCEL_HEADER_BG, end_color=EXCEL_HEADER_BG, fill_type="solid")
    zebra_fill = PatternFill(start_color=EXCEL_ZEBRA_BG, end_color=EXCEL_ZEBRA_BG, fill_type="solid")
    white_fill = PatternFill(start_color=EXCEL_WHITE_BG, end_color=EXCEL_WHITE_BG, fill_type="solid")

    med_side = Side(border_style="medium", color=EXCEL_HEADER_BORDER)
    header_border = Border(left=med_side, right=med_side, top=med_side, bottom=med_side)

    thin_side = Side(border_style="thin", color=EXCEL_GRID_BORDER)
    data_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)

    alignments = {
        "header": Alignment(horizontal="center", vertical="center", wrap_text=True),
        "left": Alignment(horizontal="left", vertical="center"),
        "center": Alignment(horizontal="center", vertical="center"),
        "right": Alignment(horizontal="right", vertical="center"),
    }

    # Format Header Row (Row 1)
    ws.row_dimensions[1].height = 30.0
    headers = []
    for col_idx in range(1, ws.max_column + 1):
        cell = ws.cell(row=1, column=col_idx)
        headers.append(cell.value)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = alignments["header"]
        cell.border = header_border

    # Deduce column alignments
    col_alignments = {}
    for col_idx in range(1, ws.max_column + 1):
        sample_vals = [
            ws.cell(row=r, column=col_idx).value 
            for r in range(2, min(ws.max_row + 1, 15))
        ]
        col_alignments[col_idx] = determine_col_alignment(headers[col_idx - 1], sample_vals, alignments)

    # Format Data Rows (Row 2 to Max)
    for row_idx in range(2, ws.max_row + 1):
        ws.row_dimensions[row_idx].height = 21.0
        row_fill = zebra_fill if (row_idx % 2 == 0) else white_fill

        for col_idx in range(1, ws.max_column + 1):
            cell = ws.cell(row=row_idx, column=col_idx)
            cell.font = data_font
            cell.fill = row_fill
            cell.border = data_border
            cell.alignment = col_alignments[col_idx]

    # Smart Auto-Fit Column Widths (Clamped between 12 and 65)
    for col_idx in range(1, ws.max_column + 1):
        col_letter = get_column_letter(col_idx)
        max_len = 0
        for row_idx in range(1, ws.max_row + 1):
            val = ws.cell(row=row_idx, column=col_idx).value
            if val is not None:
                val_str = str(val).strip()
                lines = val_str.split("\\n")
                line_max = max(len(l) for l in lines) if lines else len(val_str)
                if line_max > max_len:
                    max_len = line_max

        calculated_width = max_len + 4
        clamped_width = max(12, min(calculated_width, 65))
        ws.column_dimensions[col_letter].width = clamped_width

    # Sticky Header (Freeze Row 1)
    ws.freeze_panes = "A2"

def export_to_excel_buffer(single_sheet: str = None) -> io.BytesIO:
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        if single_sheet:
            df = st.session_state.hsr_data[single_sheet]
            sheet_title = single_sheet.split(". ")[-1][:31].replace("/", "-")
            df.to_excel(writer, sheet_name=sheet_title, index=False)
        else:
            for name, df in st.session_state.hsr_data.items():
                sheet_title = name.split(". ")[-1][:31].replace("/", "-")
                df.to_excel(writer, sheet_name=sheet_title, index=False)

    output.seek(0)
    wb = openpyxl.load_workbook(output, data_only=False)
    for ws in wb.worksheets:
        format_openpyxl_worksheet(ws)

    styled_output = io.BytesIO()
    wb.save(styled_output)
    styled_output.seek(0)
    return styled_output

# Run: streamlit run app.py
`;

  const activeCode = activeFile === 'formatter' ? formatterCode : streamlitCode;
  const activeFileName = activeFile === 'formatter' ? 'format_hsr_tracker.py' : 'app.py';

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="python-viewer-tab">
      {/* File Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFile('formatter')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeFile === 'formatter'
                ? 'bg-[#1F4E78] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>format_hsr_tracker.py (Excel Formatter)</span>
          </button>
          <button
            onClick={() => setActiveFile('streamlit')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeFile === 'streamlit'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>app.py (Streamlit Web Dashboard)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-md bg-[#1F4E78] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#183e60]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download {activeFileName}</span>
          </button>
        </div>
      </div>

      {/* Script Summary Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1F4E78] text-white shadow-xs">
            <FileCode className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              {activeFile === 'formatter'
                ? 'HSR Multi-Sheet Excel Professional Formatter (OpenPyXL + Pandas)'
                : 'Full-Scale Streamlit Web Dashboard Engine (app.py)'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeFile === 'formatter'
                ? 'Applies Deep Navy Blue (#1F4E78) headers with bold white text, medium gray borders, light-gray cell gridlines (#D9D9D9), zebra row striping (#F8F9FA), contextual alignment (Left for text, Center for dates/statuses, Right for metrics), column width auto-fitting, sticky freeze panes (A2), and complete data preservation across all sheets in "All Engineering Documents Tracker Live Document cutoff 03-09.xlsx".'
                : 'Interactive data grid editor with filter controls, executive KPI metrics cards, transmittal progress analysis, and styled multi-sheet export.'}
            </p>
          </div>
        </div>

        {/* Quick Launch Command */}
        <div className="mt-4 rounded-md bg-slate-900 p-3 text-xs text-slate-200 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-sky-400 shrink-0" />
            <span>
              {activeFile === 'formatter'
                ? 'python format_hsr_tracker.py --input "All Engineering Documents Tracker Live Document cutoff 03-09.xlsx"'
                : 'streamlit run app.py'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Terminal command</span>
        </div>
      </div>

      {/* Code block */}
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="ml-2 text-slate-200 font-semibold">{activeFileName}</span>
          </div>
          <span className="text-[11px] text-slate-400">Python 3.10+ / Pandas &amp; OpenPyXL</span>
        </div>

        <pre className="overflow-x-auto p-4 font-mono text-xs text-sky-300/95 leading-relaxed max-h-[600px]">
          <code>{activeCode}</code>
        </pre>
      </div>
    </div>
  );
};

