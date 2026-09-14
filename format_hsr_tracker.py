#!/usr/bin/env python3
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
FONT_FAMILY = "Segoe UI"  # Clean, modern enterprise font (fallback: Calibri)
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
    # Fonts
    header_font = Font(name=FONT_FAMILY, size=11, bold=True, color=HEADER_FONT_COLOR)
    data_font = Font(name=FONT_FAMILY, size=10, bold=False, color="1F2937")

    # Fills
    header_fill = PatternFill(start_color=HEADER_BG_COLOR, end_color=HEADER_BG_COLOR, fill_type="solid")
    zebra_fill = PatternFill(start_color=ZEBRA_BG_COLOR, end_color=ZEBRA_BG_COLOR, fill_type="solid")
    white_fill = PatternFill(start_color=WHITE_BG_COLOR, end_color=WHITE_BG_COLOR, fill_type="solid")

    # Borders
    thin_grid = Side(border_style="thin", color=BORDER_COLOR_GRID)
    medium_header_border = Side(border_style="medium", color=BORDER_COLOR_HEADER)

    header_border = Border(left=medium_header_border, right=medium_header_border, top=medium_header_border, bottom=medium_header_border)
    data_border = Border(left=thin_grid, right=thin_grid, top=thin_grid, bottom=thin_grid)

    # Alignments
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

    # Rule 1: Metric or percentage header keywords
    if any(keyword in clean_header for keyword in METRIC_NUMERIC_KEYWORDS):
        return styles["align_right"]

    # Rule 2: Status, Date, Revision, or Code header keywords
    if any(keyword in clean_header for keyword in STATUS_DATE_KEYWORDS):
        return styles["align_center"]

    # Rule 3: Inspect sample data types
    non_empty = [v for v in sample_values if v is not None and str(v).strip() != ""]
    if non_empty:
        numeric_count = sum(1 for v in non_empty if isinstance(v, (int, float)))
        if numeric_count / len(non_empty) >= 0.7:
            return styles["align_right"]

    # Default fallback for text, descriptions, titles
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
                # Format check for multi-line text or string lengths
                val_str = str(val).strip()
                lines = val_str.split("\n")
                line_max = max(len(l) for l in lines) if lines else len(val_str)
                if line_max > max_len:
                    max_len = line_max

        # Auto-fit width calculation with clamped bounds
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
      - Loads the workbook with openpyxl (preserving all formulas & original values).
      - Applies professional formatting to every sheet.
      - Saves the polished workbook to the target path.
    """
    print("=" * 80)
    print(" HSR ENGINEERING DOCUMENT TRACKER - PROFESSIONAL FORMATTING ENGINE")
    print("=" * 80)

    if not os.path.exists(input_filepath):
        print(f"\n[ERROR] Source Excel file not found: '{input_filepath}'")
        print("Please place the file in this directory or specify the path via --input argument.")
        sys.exit(1)

    print(f"\n[1/4] Reading source workbook: '{input_filepath}'...")
    
    # Use pandas to inspect all sheet names and row statistics
    excel_file = pd.ExcelFile(input_filepath)
    sheet_names = excel_file.sheet_names
    print(f"      Found {len(sheet_names)} sheet(s) in workbook:")
    for idx, sheet in enumerate(sheet_names, start=1):
        print(f"      - [{idx:02d}] {sheet}")

    print(f"\n[2/4] Loading OpenPyXL workbook instance (data preservation mode)...")
    # data_only=False preserves formulas and formatting references
    wb = openpyxl.load_workbook(input_filepath, data_only=False)

    styles = create_style_definitions()

    print(f"\n[3/4] Applying professional styling to each sheet:")
    for idx, sheet_name in enumerate(wb.sheetnames, start=1):
        ws = wb[sheet_name]
        print(f"      * Formatting ({idx}/{len(wb.sheetnames)}): '{sheet_name}' ({ws.max_row} rows x {ws.max_column} cols)...")
        format_worksheet(ws, styles)

    print(f"\n[4/4] Saving styled output file: '{output_filepath}'...")
    wb.save(output_filepath)

    output_size_kb = os.path.getsize(output_filepath) / 1024
    print("\n" + "=" * 80)
    print(f" SUCCESS: Professional formatting completed successfully!")
    print(f" Output File  : {os.path.abspath(output_filepath)}")
    print(f" File Size    : {output_size_kb:.2f} KB")
    print(f" Sheets Styled: {len(wb.sheetnames)}")
    print("=" * 80 + "\n")


def generate_sample_file_if_needed(target_file: str):
    """
    Helper utility: If the user runs the script in an environment where the
    original file hasn't been copied yet, generate an authentic HSR demo tracker.
    """
    print(f"[INFO] Generating sample HSR Tracker dataset to '{target_file}' for instant testing...")
    
    conclusion_data = [
        {"Transmittal/Status": "ELV Detailed Design", "Total No. of Documents": 1067, "Submitted HNWL": 803, "% Submitted": "75%", "Under SYS Review": 201, "Approved with Comments": 424, "% Approved": "53%", "Rejected": 50},
        {"Transmittal/Status": "ICT Detailed Design", "Total No. of Documents": 435, "Submitted HNWL": 369, "% Submitted": "85%", "Under SYS Review": 98, "Approved with Comments": 210, "% Approved": "36%", "Rejected": 16},
        {"Transmittal/Status": "SDS Specifications", "Total No. of Documents": 14, "Submitted HNWL": 14, "% Submitted": "100%", "Under SYS Review": 2, "Approved with Comments": 11, "% Approved": "79%", "Rejected": 2},
        {"Transmittal/Status": "Installation Details", "Total No. of Documents": 11, "Submitted HNWL": 8, "% Submitted": "73%", "Under SYS Review": 1, "Approved with Comments": 6, "% Approved": "13%", "Rejected": 0},
        {"Transmittal/Status": "Technical Rooms", "Total No. of Documents": 232, "Submitted HNWL": 215, "% Submitted": "93%", "Under SYS Review": 28, "Approved with Comments": 54, "% Approved": "25%", "Rejected": 1},
        {"Transmittal/Status": "Method of Statement", "Total No. of Documents": 14, "Submitted HNWL": 9, "% Submitted": "64%", "Under SYS Review": 1, "Approved with Comments": 6, "% Approved": "67%", "Rejected": 2},
        {"Transmittal/Status": "Factory Test Acceptance (FAT)", "Total No. of Documents": 15, "Submitted HNWL": 13, "% Submitted": "87%", "Under SYS Review": 2, "Approved with Comments": 9, "% Approved": "69%", "Rejected": 0},
    ]

    elv_stations_data = [
        {"Station Name": "NEW CAPITAL", "System Code": "CCTV", "Submission Title": "CCTV Schematic & Camera Coverage Drawing", "Doc No": "HSR-SOA-DES-TELCCTV-ST-1200001", "Rev": "A", "Status Honeywell": "Approved from CJV", "Status Systra": "Approved with Comments", "Date": "14-Jul"},
        {"Station Name": "MOHAMED NAGUIB", "System Code": "PA/PIS", "Submission Title": "Public Address & Passenger Info System Layout", "Doc No": "HSR-SOA-DES-TELPAPIS-ST-1200002", "Rev": "B", "Status Honeywell": "Under HNWL update due to SYS comments", "Status Systra": "Under Systra Review", "Date": "18-Jul"},
        {"Station Name": "ALAMIAN", "System Code": "ACS", "Submission Title": "Access Control System & Intrusion Detection Plan", "Doc No": "HSR-SOA-DES-TELACS-ST-1200003", "Rev": "A", "Status Honeywell": "Approved from CJV", "Status Systra": "Approved with Comments", "Date": "22-Jul"},
        {"Station Name": "RAS ELHEKMA", "System Code": "FAS", "Submission Title": "Fire Alarm & Suppression Interface Drawing", "Doc No": "HSR-SOA-DES-TELFAS-ST-1200004", "Rev": "A", "Status Honeywell": "Under CJV Review", "Status Systra": "Pending Submission", "Date": "25-Jul"},
        {"Station Name": "WADI NATROUN", "System Code": "TELEPHONE", "Submission Title": "Operational Telephone Network Schematic", "Doc No": "HSR-SOA-DES-TELTEL-ST-1200005", "Rev": "C", "Status Honeywell": "Approved from CJV", "Status Systra": "Code 3 Rejected", "Date": "29-Jul"},
    ]

    with pd.ExcelWriter(target_file, engine="openpyxl") as writer:
        pd.DataFrame(conclusion_data).to_excel(writer, sheet_name="Master Conclusion", index=False)
        pd.DataFrame(elv_stations_data).to_excel(writer, sheet_name="ELV DD Stations", index=False)
    
    print(f"[INFO] Created test workbook: '{target_file}' with 2 sample sheets.\n")


# -----------------------------------------------------------------------------
# Command Line Interface (CLI) Entry Point
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Format HSR Engineering Tracker Excel workbooks with professional corporate styling."
    )
    parser.add_argument(
        "-i", "--input",
        default=DEFAULT_INPUT_FILE,
        help=f"Input Excel file path (default: '{DEFAULT_INPUT_FILE}')"
    )
    parser.add_argument(
        "-o", "--output",
        default=DEFAULT_OUTPUT_FILE,
        help=f"Output styled Excel file path (default: '{DEFAULT_OUTPUT_FILE}')"
    )
    parser.add_argument(
        "--create-sample",
        action="store_true",
        help="Generate a sample HSR tracker file if input does not exist."
    )

    args = parser.parse_args()

    # Automatically generate sample if input file doesn't exist and user requested or is testing
    if not os.path.exists(args.input) and args.create_sample:
        generate_sample_file_if_needed(args.input)

    process_hsr_tracker(args.input, args.output)
