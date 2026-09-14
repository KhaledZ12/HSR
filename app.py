"""
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

# -----------------------------------------------------------------------------
# 1. APPLICATION CONFIGURATION & THEME
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="HSR Engineering Document Tracker",
    page_icon="🚆",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Enterprise Engineering CSS
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: white;
        padding: 24px 30px;
        border-radius: 12px;
        margin-bottom: 24px;
        border-left: 6px solid #0284c7;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .main-header h1 {
        color: #ffffff;
        font-size: 26px;
        font-weight: 700;
        margin: 0 0 6px 0;
        letter-spacing: -0.5px;
    }
    .main-header p {
        color: #94a3b8;
        font-size: 14px;
        margin: 0;
    }
    .kpi-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 16px 20px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
    }
    .kpi-title {
        color: #64748b;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
    }
    .kpi-value {
        color: #0f172a;
        font-size: 24px;
        font-weight: 800;
        margin-bottom: 4px;
    }
    .kpi-sub {
        font-size: 12px;
        color: #0284c7;
        font-weight: 500;
    }
    .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
    }
    .badge-approved { background-color: #dcfce7; color: #15803d; }
    .badge-review { background-color: #fef9c3; color: #854d0e; }
    .badge-rejected { background-color: #fee2e2; color: #b91c1c; }
    .badge-update { background-color: #e0f2fe; color: #0369a1; }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 2. DATA CONSTANTS & SCHEMA DEFINITIONS
# -----------------------------------------------------------------------------
STATIONS_21 = [
    "NEW CAPITAL", "MOHAMED NAGUIB", "ALAMIAN", "RAS ELHEKMA", "WADI NATROUN",
    "OCTOBER GARDEN", "CAIRO", "GIZA", "SIDI ABDELRAHMAN", "EL NOUBARYA",
    "EL SADAT", "El Ain ElSOKHNA", "6TH OF OCTOBER", "SPHINX", "ALEXANDRIA",
    "BORG ELARAB", "EL HAMMAM", "EL DABAA", "AlAMRIA", "MARSA MATROUH", "Army Stadium"
]

STATUS_HNWL_OPTIONS = [
    "Not Submitted from HNWL",
    "Under CJV review",
    "Under Safety Review",
    "Under HNWL update due to CJV comments",
    "Approved from CJV",
    "Under HNWL update due to SYS comments",
    "Under HNWL update due to safety comments",
    "Under HNWL update due to SMO comments",
    "Under HNWL update"
]

DOC_WF_OPTIONS = [
    "Under SMO Review",
    "Approved with Comments",
    "Released to Systra",
    "Returned from SMO",
    "On Hold"
]

STATUS_SYSTRA_OPTIONS = [
    "Under Systra Review",
    "Rejected",
    "Approved with Comments",
    "Approved",
    "Not Submitted"
]

TEL_SUBSYSTEMS = [
    "MCS", "MSN (Active)", "MSN (Passive)", "ACS", "PAS", "PIS",
    "OATS", "VRS", "WIFI", "FO", "CCTV", "UPS", "IDS", "Cybersecurity",
    "Power Cables", "Cable Pulling And Fiber Splicing indoor"
]

SHEETS_LIST = [
    "1. Conclusion",
    "2. Reference",
    "3. ICT DD (Stations)",
    "4. ICT DD (Depot)",
    "5. ICT DD - Service Point",
    "6. ELV DD (Stations)",
    "7. ELV DD (Depot)",
    "8. ELV DD - Service Point",
    "9. Installation Details",
    "10. Provision Drawings (Stations)",
    "11. SDS",
    "12. TPS",
    "13. TSS3",
    "14. RCP",
    "15. Inspection Test Report (ITP)",
    "16. Technical Rooms",
    "17. Method of Statement (MOS)",
    "18. Factory Test Acceptance (FAT)",
    "19. LLD"
]

# -----------------------------------------------------------------------------
# 3. BASELINE DATA GENERATOR FUNCTIONS
# -----------------------------------------------------------------------------
def get_conclusion_df() -> pd.DataFrame:
    data = [
        {"Transmittal/Status": "ELV Detailed Design", "Total No. of Documents (1st Batch)": 1067, "Total submitted from HNWL": 803, "% of Total submitted from HNWL": "75%", "Not Submitted from HNWL": 264, "% of Total Not submitted from HNWL": "25%", "Under HNWL updated": 138, "Under CJV Review": 34, "Under Safety Review": 5, "Under SMO Review": 23, "Under Systra Review": 201, "Approved with Comments": 424, "% of Approved from SYS": "53%", "Rejected": 50, "% of Rejected from SYS": "6%"},
        {"Transmittal/Status": "ICT Detailed Design", "Total No. of Documents (1st Batch)": 435, "Total submitted from HNWL": 369, "% of Total submitted from HNWL": "85%", "Not Submitted from HNWL": 66, "% of Total Not submitted from HNWL": "15%", "Under HNWL updated": 72, "Under CJV Review": 0, "Under Safety Review": 9, "Under SMO Review": 53, "Under Systra Review": 98, "Approved with Comments": 210, "% of Approved from SYS": "36%", "Rejected": 16, "% of Rejected from SYS": "4%"},
        {"Transmittal/Status": "SDS", "Total No. of Documents (1st Batch)": 14, "Total submitted from HNWL": 14, "% of Total submitted from HNWL": "100%", "Not Submitted from HNWL": 0, "% of Total Not submitted from HNWL": "0%", "Under HNWL updated": 0, "Under CJV Review": 0, "Under Safety Review": 0, "Under SMO Review": 0, "Under Systra Review": 2, "Approved with Comments": 11, "% of Approved from SYS": "79%", "Rejected": 2, "% of Rejected from SYS": "14%"},
        {"Transmittal/Status": "Installation Details", "Total No. of Documents (1st Batch)": 11, "Total submitted from HNWL": 8, "% of Total submitted from HNWL": "73%", "Not Submitted from HNWL": 3, "% of Total Not submitted from HNWL": "27%", "Under HNWL updated": 1, "Under CJV Review": 0, "Under Safety Review": 0, "Under SMO Review": 0, "Under Systra Review": 1, "Approved with Comments": 6, "% of Approved from SYS": "13%", "Rejected": 0, "% of Rejected from SYS": "0%"},
        {"Transmittal/Status": "Technical Rooms", "Total No. of Documents (1st Batch)": 232, "Total submitted from HNWL": 215, "% of Total submitted from HNWL": "93%", "Not Submitted from HNWL": 17, "% of Total Not submitted from HNWL": "7%", "Under HNWL updated": 68, "Under CJV Review": 44, "Under Safety Review": 0, "Under SMO Review": 20, "Under Systra Review": 28, "Approved with Comments": 54, "% of Approved from SYS": "25%", "Rejected": 1, "% of Rejected from SYS": "0%"},
        {"Transmittal/Status": "Method of Statement", "Total No. of Documents (1st Batch)": 14, "Total submitted from HNWL": 9, "% of Total submitted from HNWL": "64%", "Not Submitted from HNWL": 5, "% of Total Not submitted from HNWL": "36%", "Under HNWL updated": 0, "Under CJV Review": 0, "Under Safety Review": 0, "Under SMO Review": 0, "Under Systra Review": 1, "Approved with Comments": 6, "% of Approved from SYS": "67%", "Rejected": 2, "% of Rejected from SYS": "22%"},
        {"Transmittal/Status": "Factory Test Acceptance (FAT)", "Total No. of Documents (1st Batch)": 15, "Total submitted from HNWL": 13, "% of Total submitted from HNWL": "87%", "Not Submitted from HNWL": 2, "% of Total Not submitted from HNWL": "13%", "Under HNWL updated": 1, "Under CJV Review": 1, "Under Safety Review": 0, "Under SMO Review": 0, "Under Systra Review": 2, "Approved with Comments": 9, "% of Approved from SYS": "69%", "Rejected": 0, "% of Rejected from SYS": "0%"},
        {"Transmittal/Status": "Factory Test Report", "Total No. of Documents (1st Batch)": 15, "Total submitted from HNWL": 8, "% of Total submitted from HNWL": "53%", "Not Submitted from HNWL": 7, "% of Total Not submitted from HNWL": "47%", "Under HNWL updated": 0, "Under CJV Review": 0, "Under Safety Review": 0, "Under SMO Review": 0, "Under Systra Review": 0, "Approved with Comments": 8, "% of Approved from SYS": "100%", "Rejected": 0, "% of Rejected from SYS": "0%"},
        {"Transmittal/Status": "Wayside DD (ICT, ELV)", "Total No. of Documents (1st Batch)": 17, "Total submitted from HNWL": 0, "% of Total submitted from HNWL": "0%", "Not Submitted from HNWL": 17, "% of Total Not submitted from HNWL": "100%", "Under HNWL updated": 0, "Under CJV Review": 0, "Under Safety Review": 0, "Under SMO Review": 0, "Under Systra Review": 0, "Approved with Comments": 0, "% of Approved from SYS": "0%", "Rejected": 0, "% of Rejected from SYS": "0%"},
    ]
    df = pd.DataFrame(data)
    return df

def get_reference_df() -> pd.DataFrame:
    data = [
        {"Category": "Status With Honeywell", "Allowed Value": "Not Submitted from HNWL", "Responsible": "Honeywell Engineering", "SLA / Description": "Pending initial submission"},
        {"Category": "Status With Honeywell", "Allowed Value": "Under CJV review", "Responsible": "Civil JV Technical Office", "SLA / Description": "Standard 7 days review"},
        {"Category": "Status With Honeywell", "Allowed Value": "Under Safety Review", "Responsible": "System Safety & RAMS", "SLA / Description": "RAMS audit process"},
        {"Category": "Status With Honeywell", "Allowed Value": "Under HNWL update due to CJV comments", "Responsible": "Honeywell Engineering", "SLA / Description": "Revising comments from CJV"},
        {"Category": "Status With Honeywell", "Allowed Value": "Approved from CJV", "Responsible": "Civil JV Technical Office", "SLA / Description": "Cleared to transmittal queue"},
        {"Category": "Status With Honeywell", "Allowed Value": "Under HNWL update due to SYS comments", "Responsible": "Honeywell Engineering", "SLA / Description": "Addressing Systra consultant review"},
        {"Category": "Status With Honeywell", "Allowed Value": "Under HNWL update due to safety comments", "Responsible": "Honeywell Engineering", "SLA / Description": "Safety mitigation inclusion"},
        {"Category": "Status With Honeywell", "Allowed Value": "Under HNWL update due to SMO comments", "Responsible": "Honeywell Engineering", "SLA / Description": "Siemens interface alignment"},
        {"Category": "Status With Honeywell", "Allowed Value": "Under HNWL update", "Responsible": "Honeywell Engineering", "SLA / Description": "Internal drawing update"},
        {"Category": "Document through WF Status", "Allowed Value": "Under SMO Review", "Responsible": "Siemens Mobility", "SLA / Description": "Interface coordination"},
        {"Category": "Document through WF Status", "Allowed Value": "Approved with Comments", "Responsible": "Integration Committee", "SLA / Description": "Approved to forward"},
        {"Category": "Document through WF Status", "Allowed Value": "Released to Systra", "Responsible": "Aconex Doc Control", "SLA / Description": "Transmitted officially"},
        {"Category": "Document through WF Status", "Allowed Value": "Returned from SMO", "Responsible": "SMO Lead", "SLA / Description": "Pending contractor resolution"},
        {"Category": "Document through WF Status", "Allowed Value": "On Hold", "Responsible": "Project Office", "SLA / Description": "Design frozen pending RFI"},
        {"Category": "Status with Systra", "Allowed Value": "Under Systra Review", "Responsible": "Systra General Consultant", "SLA / Description": "14 days contractual review"},
        {"Category": "Status with Systra", "Allowed Value": "Rejected", "Responsible": "Systra General Consultant", "SLA / Description": "Code 3 Rejected - Resubmission required"},
        {"Category": "Status with Systra", "Allowed Value": "Approved with Comments", "Responsible": "Systra General Consultant", "SLA / Description": "Code 2 - Proceed with comments incorporation"},
        {"Category": "Status with Systra", "Allowed Value": "Approved", "Responsible": "Systra General Consultant", "SLA / Description": "Code 1 - Approved for Construction"},
        {"Category": "Status with Systra", "Allowed Value": "Not Submitted", "Responsible": "Contractor Queue", "SLA / Description": "Awaiting initial transmittal"},
    ]
    return pd.DataFrame(data)

def get_ict_stations_df() -> pd.DataFrame:
    # 21 Stations x 12 subsystems = 252 rows
    subsystems = ["MCS", "MSN (Active)", "MSN (Passive)", "ACS", "PAS", "PIS", "OATS", "VRS", "WIFI", "FO", "CCTV", "UPS"]
    rows = []
    counter = 1
    for s_idx, station in enumerate(STATIONS_21):
        st_code = station.replace(" ", "")[:3].upper()
        for sub_idx, sub in enumerate(subsystems):
            is_approved = (s_idx + sub_idx) % 3 == 0
            is_review = (s_idx + sub_idx) % 3 == 1
            rows.append({
                "STATION NAME": station,
                "TEL Sub-Systems": sub,
                "Document Title": f"{station} - {sub} Detailed Design Architecture & Routing",
                "Document No.": f"HSR-SOA-DRW-TEL{sub[:3].upper().replace(' ', '')}-{st_code}-12000{sub_idx+1:02d}",
                "Rev.": "B" if is_approved else "A",
                "Status With Honeywell": "Approved from CJV" if is_approved else ("Under CJV review" if is_review else "Under HNWL update due to SYS comments"),
                "Status Date": f"2026-0{(s_idx%8)+1:01d}-15",
                "Document through WF Status": "Released to Systra" if is_approved else ("Under SMO Review" if is_review else "Approved with Comments"),
                "WF no.": f"WF-{20000+counter}",
                "Status with Systra": "Approved with Comments" if is_approved else ("Under Systra Review" if is_review else "Not Submitted"),
                "Status Date ": f"2026-0{(s_idx%8)+1:01d}-28" if is_approved else "",
                "REASONS OF RETURN": "-" if is_approved else ("Under General Consultant review" if is_review else "Cable containment sizing update required"),
                "Comment": "Code 2 approved with standard remarks" if is_approved else "Coordinated with civil platform drawings"
            })
            counter += 1
    return pd.DataFrame(rows)

def get_ict_depot_df() -> pd.DataFrame:
    # 9 buildings, 79 rows total
    bldgs = [
        ("OCS - Main Switching HUB 1", 7), ("OCS - Main Switching HUB 2", 7),
        ("MWB Building", 7), ("WPMS Building", 7), ("Stabling Yard 1", 12),
        ("Stabling Yard 2", 12), ("Automatic Train Washing Plant", 7),
        ("Fresh Water Refiling Building", 7), ("REL Workshop Building", 7)
    ]
    subsystems_pool = ["MCS", "MSN (Active)", "MSN (Passive)", "ACS", "PAS", "PIS", "CCTV", "WIFI", "FO", "UPS", "OATS", "VRS"]
    rows = []
    counter = 1
    for bldg_name, count in bldgs:
        for i in range(count):
            sub = subsystems_pool[i % len(subsystems_pool)]
            is_app = i % 2 == 0
            rows.append({
                "Building NAME": bldg_name,
                "TEL Sub-Systems": sub,
                "Document Title": f"{bldg_name} - {sub} Network Scheme & Wiring",
                "Rev.": "B" if is_app else "A",
                "Status With Honeywell": "Approved from CJV" if is_app else "Under HNWL update",
                "Status Date": "2026-03-12",
                "Document through WF Status": "Released to Systra" if is_app else "Under SMO Review",
                "WF no.": f"WF-{21500+counter}",
                "Status with Systra": "Approved with Comments" if is_app else "Under Systra Review",
                "Status Date ": "2026-04-05" if is_app else "",
                "REASONS OF RETURN": "-" if is_app else "Honeywell addressing layout clearance comments",
                "Comment": "Depot operational communication package"
            })
            counter += 1
    return pd.DataFrame(rows)

def get_ict_sp_df() -> pd.DataFrame:
    # 6 Buildings, 52 rows total
    bldgs = [
        ("NC SP - Fresh Water Building", 7), ("NC & MM SP - Stabling Yard Building", 12),
        ("NC SP - High Pressure Curtain Wash Building", 7), ("Borg El-Arab SP - Stabling Yard Building", 12),
        ("Borg El-Arab SP - WPMS", 7), ("NC SP - OCS switching hub", 7)
    ]
    subsystems_pool = ["MSN (Active)", "MSN (Passive)", "CCTV", "ACS", "PAS", "WIFI", "FO", "MCS", "UPS", "PIS", "OATS", "VRS"]
    rows = []
    counter = 1
    for bldg_name, count in bldgs:
        for i in range(count):
            sub = subsystems_pool[i % len(subsystems_pool)]
            is_app = (i + counter) % 3 != 0
            rows.append({
                "Building NAME": bldg_name,
                "TEL Sub-Systems": sub,
                "Document Title": f"{bldg_name} - {sub} Schematics & Enclosures",
                "Rev.": "A",
                "Status With Honeywell": "Approved from CJV" if is_app else "Under Safety Review",
                "Status Date": "2026-02-20",
                "Document through WF Status": "Released to Systra" if is_app else "On Hold",
                "WF no.": f"WF-{22000+counter}",
                "Status with Systra": "Approved with Comments" if is_app else "Under Systra Review",
                "Status Date ": "2026-03-18" if is_app else "",
                "REASONS OF RETURN": "-" if is_app else "Service point power interface clarification",
                "Comment": "Service point transmittal verified"
            })
            counter += 1
    return pd.DataFrame(rows)

def get_elv_stations_df() -> pd.DataFrame:
    # 21 Stations x 29 rows = 609 rows
    elv_items = [
        "External CCTV Cameras Layout", "Internal CCTV Cameras Concourse", "Internal CCTV Platform Level",
        "Access Control System Entrance Doors", "Access Control System Technical Rooms",
        "Public Address Loudspeakers Concourse", "Public Address Loudspeakers Platform",
        "Passenger Information Display (PIDS) Foyer", "Passenger Information Display (PIDS) Platform",
        "Master Clock Display Subsystem", "Wi-Fi Access Points Public Areas", "Wi-Fi Access Points Staff & Office Areas",
        "Intrusion Detection System (IDS) Perimeter", "Intrusion Detection System (IDS) Internal Doors",
        "Civil Defense & Fire Alarm Integration Matrix", "Emergency Call Point (ECP) Station Network",
        "Station Telephony Intercom Terminals", "Telecom Equipment Room (TER) Rack Layout",
        "Communications Equipment Room (CER) Rack Layout", "Station Cable Containment Routing Plan Ground",
        "Station Cable Containment Routing Plan First Floor", "Station Cable Containment Platform Routing",
        "Grounding and Bonding Mesh Network", "Main Power Feeder & Telecom Distribution Board",
        "Fiber Optic ODF Termination Schedule", "Cat6A Structured Cabling Patch Schedule",
        "Earthing Pit & Surge Protection Diagram", "UPS Distribution Scheme for ELV Systems",
        "Overall Station ELV Architecture Schematic"
    ]
    rows = []
    counter = 1
    for s_idx, station in enumerate(STATIONS_21):
        st_code = station.replace(" ", "")[:3].upper()
        for item_idx, item in enumerate(elv_items):
            is_app = (s_idx + item_idx) % 2 == 0
            sub_code = "CCTV/ACS" if item_idx < 5 else ("PAS/PIS/WIFI" if item_idx < 12 else ("IDS/SAFETY" if item_idx < 17 else "CABLING/TER"))
            rows.append({
                "STATION NAME": station,
                "TEL Sub-Systems": sub_code,
                "Document Title": f"{station} - {item}",
                "Document No.": f"HSR-SOA-DRW-ELV-{st_code}-110{item_idx+1:03d}",
                "Rev.": "B" if is_app else "A",
                "Status With Honeywell": "Approved from CJV" if is_app else "Under HNWL update due to CJV comments",
                "Document through WF Status": "Released to Systra" if is_app else "Under SMO Review",
                "WF no.": f"WF-{18000+counter}",
                "Status with Systra": "Approved with Comments" if is_app else "Under Systra Review",
                "Comment": "Approved for construction transmittal" if is_app else "Pending coordinated RCP verification"
            })
            counter += 1
    return pd.DataFrame(rows)

def get_elv_depot_df() -> pd.DataFrame:
    # 10 Buildings, 167 rows
    depot_configs = [
        ("MANUAL WASH", 14), ("WPMS", 14), ("MAIN OCS SWITCHING HUB", 14),
        ("OCS SECTIONING HUB", 14), ("STABLING YARD 1", 19), ("STABLING YARD 2", 14),
        ("REL WORKSHOP", 25), ("Automatic Train Wash Building", 19),
        ("Fresh water Building", 19), ("Admin Building", 14)
    ]
    systems = ["CCTV", "ACS", "PAS", "WIFI", "IDS", "Telecom Cable Tray", "UPS", "Fire Interface"]
    rows = []
    counter = 1
    for bldg_name, count in depot_configs:
        for i in range(count):
            sys = systems[i % len(systems)]
            is_app = (i + counter) % 3 == 0
            rows.append({
                "Building NAME": bldg_name,
                "TEL Sub-Systems": sys,
                "Document Title": f"{bldg_name} - {sys} Layout & Details",
                "Document No.": f"HSR-SOA-DRW-ELV-DEP-{counter:04d}",
                "Rev.": "A",
                "Status With Honeywell": "Approved from CJV" if is_app else "Under HNWL update",
                "Status Date": "2026-03-01",
                "Document through WF Status": "Released to Systra" if is_app else "Under SMO Review",
                "WF no.": f"WF-{19500+counter}",
                "Status with Systra": "Approved with Comments" if is_app else "Under Systra Review",
                "Status Date ": "2026-04-12" if is_app else "",
                "REASONS OF RETURN": "-" if is_app else "Depot maintenance safety clearance check",
                "Comment": "Depot ELV documentation batch"
            })
            counter += 1
    return pd.DataFrame(rows)

def get_elv_sp_df() -> pd.DataFrame:
    # 139 rows (81 New Capital, 58 Borg El Arab)
    sp_configs = [
        ("New Capital SP", 81, ["NC SP - Administration", "NC SP - Locomotive Shed", "NC SP - Sanding Facility", "NC SP - Switching Center"]),
        ("Borg El Arab SP", 58, ["BEA SP - Maintenance Building", "BEA SP - Water Tank Facility", "BEA SP - Staff Rest Area"])
    ]
    rows = []
    counter = 1
    for loc_name, count, bldgs in sp_configs:
        for i in range(count):
            bldg = bldgs[i % len(bldgs)]
            is_app = i % 2 == 0
            rows.append({
                "Location Name": loc_name,
                "Building NAME": f"{bldg} (Part {(i//len(bldgs))+1})",
                "Status With Honeywell": "Approved from CJV" if is_app else "Under HNWL update due to SYS comments",
                "Status Date": "2026-03-15",
                "Document through WF Status": "Released to Systra" if is_app else "Under SMO Review",
                "WF no.": f"WF-{23000+counter}",
                "Status with Systra": "Approved with Comments" if is_app else "Under Systra Review",
                "Status Date ": "2026-04-20" if is_app else "",
                "REASONS OF RETURN": "-" if is_app else "Awaiting cable trench alignment confirmation",
                "Comment": "Service point electrical & ELV interface"
            })
            counter += 1
    return pd.DataFrame(rows)

def get_installation_details_df() -> pd.DataFrame:
    data = [
        {"System": "MCS", "Document No.": "HSR-SOA-TYP-TELMCS-GL-1400001", "Document Name": "Master Clock System Typical Mounting & Cabinet Details", "Rev.": "B", "Status With Honeywell": "Approved from CJV", "Status Date": "2026-01-10", "Document through WF Status": "Released to Systra", "WF no.": "WF-017693", "Status with Systra": "Approved with Comments", "REASONS OF RETURN": "-", "Comment": "Standard mounting approved"},
        {"System": "ACS", "Document No.": "HSR-SOA-TYP-TELACS-GL-1400001", "Document Name": "Access Control System Reader & Magnetic Lock Mounting", "Rev.": "B", "Status With Honeywell": "Approved from CJV", "Status Date": "2026-01-15", "Document through WF Status": "Released to Systra", "WF no.": "WF-020868", "Status with Systra": "Approved with Comments", "REASONS OF RETURN": "-", "Comment": "Door contact interface validated"},
        {"System": "PAS", "Document No.": "HSR-SOA-TYP-TELPAS-GL-1400001", "Document Name": "Public Address Horn & Ceiling Speaker Suspension Details", "Rev.": "B", "Status With Honeywell": "Approved from CJV", "Status Date": "2026-01-18", "Document through WF Status": "Released to Systra", "WF no.": "WF-017777", "Status with Systra": "Approved with Comments", "REASONS OF RETURN": "-", "Comment": "Acoustic baffle isolation approved"},
        {"System": "WIFI", "Document No.": "HSR-SOA-TYP-TELWIFI-GL-1400001", "Document Name": "Outdoor & Indoor Wi-Fi Access Point Bracket Mounting", "Rev.": "C", "Status With Honeywell": "Approved from CJV", "Status Date": "2026-01-22", "Document through WF Status": "Released to Systra", "WF no.": "WF-017608", "Status with Systra": "Approved with Comments", "REASONS OF RETURN": "-", "Comment": "Vibration dampening approved"},
        {"System": "PIS", "Document No.": "HSR-SOA-TYP-TELPIS-GL-1400001", "Document Name": "Platform Information Display Structural Steel Fixing", "Rev.": "A", "Status With Honeywell": "Under HNWL update due to SYS comments", "Status Date": "2026-02-05", "Document through WF Status": "Returned from SMO", "WF no.": "WF-018090", "Status with Systra": "Under Systra Review", "REASONS OF RETURN": "Wind load calculation update requested by Systra", "Comment": "Structural calculation report revised"},
        {"System": "CCTV", "Document No.": "HSR-SOA-TYP-TELCCTV-GL-1400001", "Document Name": "Fixed & PTZ Camera Pole Mounting Details for Stations", "Rev.": "B", "Status With Honeywell": "Approved from CJV", "Status Date": "2026-02-12", "Document through WF Status": "Released to Systra", "WF no.": "WF-020262", "Status with Systra": "Approved with Comments", "REASONS OF RETURN": "-", "Comment": "Anti-drop safety wire detail included"},
        {"System": "OATS", "Document No.": "HSR-SOA-TYP-TELOATS-GL-1400001", "Document Name": "Operational Telephone Weatherproof Enclosure Mounting", "Rev.": "A", "Status With Honeywell": "Not Submitted from HNWL", "Status Date": "", "Document through WF Status": "On Hold", "WF no.": "-", "Status with Systra": "Not Submitted", "REASONS OF RETURN": "Awaiting vendor enclosure sample", "Comment": "To be submitted with next transmittal batch"},
        {"System": "MSN-Passive", "Document No.": "HSR-SOA-TYP-TELMSN-GL-1400001", "Document Name": "Multiservice Network 19-inch Rack Anchoring & Seismic Bracing", "Rev.": "A", "Status With Honeywell": "Approved from CJV", "Status Date": "2026-02-18", "Document through WF Status": "Released to Systra", "WF no.": "WF-023166", "Status with Systra": "Approved with Comments", "REASONS OF RETURN": "-", "Comment": "Seismic zone 3 calculation verified"},
        {"System": "UPS", "Document No.": "HSR-SOA-TYP-TELUPS-GL-1400001", "Document Name": "Telecom Battery Rack & Inverter Seismic Foundation Details", "Rev.": "A", "Status With Honeywell": "Not Submitted from HNWL", "Status Date": "", "Document through WF Status": "On Hold", "WF no.": "-", "Status with Systra": "Not Submitted", "REASONS OF RETURN": "Battery room floor load certificate pending", "Comment": "Coordinating with civil team"},
        {"System": "IDS", "Document No.": "HSR-SOA-TYP-TELIDS-GL-1400001", "Document Name": "Perimeter Infrared Sensor Fence Mountings & Conduit Entry", "Rev.": "A", "Status With Honeywell": "Not Submitted from HNWL", "Status Date": "", "Document through WF Status": "On Hold", "WF no.": "-", "Status with Systra": "Not Submitted", "REASONS OF RETURN": "Depot perimeter fence type revision pending", "Comment": "Civil package alignment required"},
        {"System": "FO Enclosure on OCS", "Document No.": "HSR-SOA-TYP-TELFO-GL-1400001", "Document Name": "Fiber Optic Splice Enclosure Clamping on OCS Mast", "Rev.": "A", "Status With Honeywell": "Approved from CJV", "Status Date": "2026-02-25", "Document through WF Status": "Released to Systra", "WF no.": "WF-020724", "Status with Systra": "Approved with Comments", "REASONS OF RETURN": "-", "Comment": "High voltage clearance compliant"}
    ]
    return pd.DataFrame(data)

def get_provision_drawings_df() -> pd.DataFrame:
    # Exact 21 Stations from Provision Drawings.png
    data = [
        {"Station Name": "Ain Al Sokhna", "HNWL Status": "Approved from CJV", "Date": "3/9/2026", "Systra Status": "under Systra review", "Date ": "3/9/2026", "Comments": "Platform cable sleeve provisions verified"},
        {"Station Name": "New Capital", "HNWL Status": "Approved from CJV", "Date": "23/8/2026", "Systra Status": "under Systra review", "Date ": "23/8/2026", "Comments": "Main concourse floor trenches included"},
        {"Station Name": "Mohamed Naguib", "HNWL Status": "Approved from CJV", "Date": "18-1-2026", "Systra Status": "closed", "Date ": "18/1/2026", "Comments": "Civil signoff completed"},
        {"Station Name": "Cairo", "HNWL Status": "Approved from CJV", "Date": "15/2/2026", "Systra Status": "closed", "Date ": "15/2/2026", "Comments": "Tunnel duct coordination finished"},
        {"Station Name": "Giza", "HNWL Status": "Approved from CJV", "Date": "16-5-2026", "Systra Status": "Under Systra Review", "Date ": "16-5-2026", "Comments": "Underground chamber penetration checks"},
        {"Station Name": "October Gardens", "HNWL Status": "Approved from CJV", "Date": "22-12-2026", "Systra Status": "Closed", "Date ": "22/12/2026", "Comments": "Code 1 final approval"},
        {"Station Name": "6th October", "HNWL Status": "Approved from CJV", "Date": "7/6/2026", "Systra Status": "Under Systra Review", "Date ": "7/6/2026", "Comments": "Viaduct conduit route review"},
        {"Station Name": "Sphinx", "HNWL Status": "Approved from CJV", "Date": "17/5/2026", "Systra Status": "closed", "Date ": "18/5/2026", "Comments": "Station building structural sleeve pass"},
        {"Station Name": "Sadat", "HNWL Status": "Not Submitted from HNWL", "Date": "", "Systra Status": "Not Submitted", "Date ": "", "Comments": "Civil foundation drawings awaiting release"},
        {"Station Name": "Wadi Al Natroun", "HNWL Status": "Approved from CJV", "Date": "17/5/2026", "Systra Status": "closed", "Date ": "18/5/2026", "Comments": "Closed without observations"},
        {"Station Name": "Noubarya", "HNWL Status": "Approved from CJV", "Date": "23-5-2026", "Systra Status": "Under Systra Review", "Date ": "23-5-2026", "Comments": "Substation interface under review"},
        {"Station Name": "Borg Al Arab", "HNWL Status": "Under HNWL update", "Date": "26-8-2026", "Systra Status": "SYStra shared the As built for Platform", "Date ": "26-8-2026", "Comments": "Platform edge conduit update in progress"},
        {"Station Name": "El Hammam", "HNWL Status": "Under HNWL update", "Date": "26-8-2026", "Systra Status": "Systra Shared their comments", "Date ": "13-6-2026", "Comments": "Honeywell revising wall opening details"},
        {"Station Name": "Ras El Hekma", "HNWL Status": "Approved from CJV", "Date": "2/5/2026", "Systra Status": "Under Systra Review", "Date ": "2/5/2026", "Comments": "Coastal corrosion protection sleeves"},
        {"Station Name": "El Dabaa", "HNWL Status": "Approved from CJV", "Date": "1/7/2026", "Systra Status": "Under Systra Review", "Date ": "", "Comments": "Transmitted via Aconex batch 04"},
        {"Station Name": "Marsa Matrouh", "HNWL Status": "Approved from CJV", "Date": "7/4/2026", "Systra Status": "Under Systra Review", "Date ": "7/4/2026", "Comments": "End terminal facility provisions"},
        {"Station Name": "Army Stadium", "HNWL Status": "Approved from CJV", "Date": "14/6/2026", "Systra Status": "Under Systra Review", "Date ": "14-6-2026", "Comments": "Stadium concourse interface review"},
        {"Station Name": "Alamein", "HNWL Status": "Approved from CJV", "Date": "14-6-2026", "Systra Status": "Under Systra Review", "Date ": "14-6-2026", "Comments": "Express track cable pipe provisions"},
        {"Station Name": "Sidi Abdelrahman", "HNWL Status": "Approved from CJV", "Date": "21-5-2026", "Systra Status": "Under Systra Review", "Date ": "21-5-2026", "Comments": "Passenger bridge duct pass review"},
        {"Station Name": "Amrya", "HNWL Status": "Not Submitted from HNWL", "Date": "", "Systra Status": "Not Submitted", "Date ": "", "Comments": "Awaiting revised architectural layout"},
        {"Station Name": "Alexandria", "HNWL Status": "Not Submitted from HNWL", "Date": "", "Systra Status": "Not Submitted", "Date ": "", "Comments": "Historical terminal design freeze pending"}
    ]
    return pd.DataFrame(data)

def get_sds_df() -> pd.DataFrame:
    # 15 rows (Serial 0 to 14)
    data = [
        {"Serial": "0", "System Code": "GEN", "Submission Tittle": "General Telecommunication System Design Description", "Doc No.": "HSR-SOA-SDS-TEL-GL-1100000", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "1", "System Code": "MCS", "Submission Tittle": "Master Clock System (MCS) Design Specification", "Doc No.": "HSR-SOA-SDS-TELMCS-GL-1100001", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "2", "System Code": "MSN-Active", "Submission Tittle": "Multiservice Network (MSN) Active Equipment Specification", "Doc No.": "HSR-SOA-SDS-TELMSN-GL-1100002", "Status": "Code 3 Rejected", "HNWL Status": "Under HNWL update due to SYS comments"},
        {"Serial": "3", "System Code": "MSN-Passive", "Submission Tittle": "Multiservice Network (MSN) Fiber Optic Infrastructure", "Doc No.": "HSR-SOA-SDS-TELMSN-GL-1100003", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "4", "System Code": "ACS", "Submission Tittle": "Access Control System (ACS) Specification & Security Levels", "Doc No.": "HSR-SOA-SDS-TELACS-GL-1100001", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "5", "System Code": "PAS", "Submission Tittle": "Public Address System (PAS) Acoustic & STI Performance", "Doc No.": "HSR-SOA-SDS-TELPAS-GL-1100001", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "6", "System Code": "PIS", "Submission Tittle": "Passenger Information System (PIS) Display Engine Spec", "Doc No.": "HSR-SOA-SDS-TELPIS-GL-1100001", "Status": "Code 3 Rejected", "HNWL Status": "Under HNWL update due to SYS comments"},
        {"Serial": "7", "System Code": "CCTV", "Submission Tittle": "Closed Circuit Television (CCTV) Video Analytics & VMS", "Doc No.": "HSR-SOA-SDS-TELCCTV-GL-1100001", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "8", "System Code": "WIFI", "Submission Tittle": "Station Wi-Fi Passenger & Operational Portal Architecture", "Doc No.": "HSR-SOA-SDS-TELWIFI-GL-1100001", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "9", "System Code": "OATS", "Submission Tittle": "Operational and Administrative Telephony System Spec", "Doc No.": "HSR-SOA-SDS-TELOATS-GL-1100001", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "10", "System Code": "VRS", "Submission Tittle": "Voice Recording System (VRS) Regulatory Compliance", "Doc No.": "HSR-SOA-SDS-TELVRS-GL-1100001", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "11", "System Code": "UPS", "Submission Tittle": "Uninterruptible Power Supply (UPS) Telecom Autonomy Spec", "Doc No.": "HSR-SOA-SDS-TELUPS-GL-1100001", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "12", "System Code": "IDS", "Submission Tittle": "Intrusion Detection System (IDS) Integration Architecture", "Doc No.": "HSR-SOA-SDS-TELIDS-GL-1100001", "Status": "Code 2 Approved", "HNWL Status": "Approved from CJV"},
        {"Serial": "13", "System Code": "Cybersecurity", "Submission Tittle": "Railway Telecom IEC 62443 Cybersecurity Architecture", "Doc No.": "HSR-SOA-SDS-TELCYB-GL-1100001", "Status": "Under Systra Review", "HNWL Status": "Approved from CJV"},
        {"Serial": "14", "System Code": "Grounding", "Submission Tittle": "Earthing & Lightning Protection for Telecommunication Systems", "Doc No.": "HSR-SOA-SDS-TELGRD-GL-1100001", "Status": "Under Systra Review", "HNWL Status": "Approved from CJV"}
    ]
    return pd.DataFrame(data)

def get_tps_df() -> pd.DataFrame:
    # 74 rows total: 26 TSS, 24 SP, 24 PP
    sections = [("TSS", "Traction Supply Station", 26), ("SP", "Sectioning Post", 24), ("PP", "Paralleling Post", 24)]
    rows = []
    counter = 1
    for prefix, name, count in sections:
        for i in range(1, count + 1):
            loc_id = f"{prefix}-{i:02d}"
            is_app = (i + counter) % 3 != 0
            rows.append({
                "Location": f"{name} {loc_id}",
                "TEL Sub-Systems": "TEL-CCTV/ACS" if i % 2 == 0 else "TEL-MSN/FO",
                "Document Title": f"{loc_id} Telecom Interface Drawing & Cable Routing",
                "Document No.": f"HSR-SOA-DRW-TELTPS-{prefix}{i:02d}-120001",
                "Rev.": "B" if is_app else "A",
                "Status With Honeywell": "Approved from CJV" if is_app else "Under HNWL update",
                "Status Date": "2026-02-10",
                "Document through WF Status": "Released to Systra" if is_app else "Under SMO Review",
                "WF no.": f"WF-{24000+counter}",
                "Date": "2026-02-15",
                "Status with Systra": "Approved with Comments" if is_app else "Under Systra Review",
                "Status Date ": "2026-03-01" if is_app else "",
                "REASONS OF RETURN": "-" if is_app else "Optical bypass configuration check",
                "Comment": "High voltage traction substation boundary verified"
            })
            counter += 1
    return pd.DataFrame(rows)

def get_tss3_df() -> pd.DataFrame:
    # Exact from TSS3.png
    data = [
        {"Document Number": "HSR-SOA-DRW-TELCCTV-GLDTSS03-1200004", "Document Title": "System Overall Architecture (SLD)", "Rev.": "A", "System Code": "TEL-CCTV", "Location": "GL-D-TSS03 Traction Supply Station 03", "Status with Systra": "Approved with Comments", "WF no.": "021093"},
        {"Document Number": "HSR-SOA-DRW-TELCCTV-GLDTSS03-1200005", "Document Title": "System Cable routing plan", "Rev.": "A", "System Code": "TEL-CCTV", "Location": "GL-D-TSS03 Traction Supply Station 03", "Status with Systra": "Approved with Comments", "WF no.": "021093"},
        {"Document Number": "HSR-SOA-DRW-TELCCTV-GLDTSS03-1200006", "Document Title": "System Equipment Layout", "Rev.": "A", "System Code": "TEL-CCTV", "Location": "GL-D-TSS03 Traction Supply Station 03", "Status with Systra": "Approved with Comments", "WF no.": "021093"},
        {"Document Number": "HSR-SOA-DES-TELCCTV-GLDTSS03-1200004", "Document Title": "Cable Schedule", "Rev.": "A", "System Code": "TEL-CCTV", "Location": "GL-D-TSS03 Traction Supply Station 03", "Status with Systra": "Approved with Comments", "WF no.": "021094"},
        {"Document Number": "HSR-SOA-DES-TELCCTV-GLDTSS03-1200005", "Document Title": "Coverage Report / Field of View", "Rev.": "A", "System Code": "TEL-CCTV", "Location": "GL-D-TSS03 Traction Supply Station 03", "Status with Systra": "Approved with Comments", "WF no.": "021093"}
    ]
    return pd.DataFrame(data)

def get_rcp_df() -> pd.DataFrame:
    # Exact from RCP.png
    data = [
        {"S/n": 1, "Station Name": "Station Ain El Sokhna", "Systra Status": "Released to Systra", "Scope": "Main Halls", "Sent by mail to systra date": "", "SYS-RFI number": "", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0318-9693"},
        {"S/n": 2, "Station Name": "Station New Capital", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "", "SYS-RFI number": "", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0302-9436"},
        {"S/n": 3, "Station Name": "Station Mohamed Naguib", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "", "SYS-RFI number": "", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0329-9745"},
        {"S/n": 4, "Station Name": "Station Cairo", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "", "SYS-RFI number": "", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0423-10068"},
        {"S/n": 5, "Station Name": "Station Giza", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "02-25-2026", "SYS-RFI number": "SYS-RFI-000790", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0409-9913"},
        {"S/n": 6, "Station Name": "Station October Gardens", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "", "SYS-RFI number": "", "Coordinated status": "Coordinated", "Transmittal/Ref": "-"},
        {"S/n": 7, "Station Name": "Station 6th October", "Systra Status": "Did not Received from SYSTRA", "Scope": "Did not Received from SYSTRA", "Sent by mail to systra date": "", "SYS-RFI number": "", "Coordinated status": "Pending", "Transmittal/Ref": "-"},
        {"S/n": 8, "Station Name": "Station Sphinx", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "03-18-2026", "SYS-RFI number": "SYS-RFI-000753", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0430-10142"},
        {"S/n": 9, "Station Name": "Station Al Sadat", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "", "SYS-RFI number": "", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0412-9919"},
        {"S/n": 10, "Station Name": "Station Wadi El Natroun", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "", "SYS-RFI number": "", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0329-9743"},
        {"S/n": 11, "Station Name": "Station Al Noubarya", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "04-05-2026", "SYS-RFI number": "SYS-RFI-000825", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0412-9920"},
        {"S/n": 12, "Station Name": "Station Borg Al Arab", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "03-28-2026", "SYS-RFI number": "SYS-RFI-000992", "Coordinated status": "Coordinated", "Transmittal/Ref": "-"},
        {"S/n": 13, "Station Name": "Station Al Hamam", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "03-30-2026", "SYS-RFI number": "SYS-RFI-000993", "Coordinated status": "Coordinated", "Transmittal/Ref": "-"},
        {"S/n": 14, "Station Name": "Station Al Alameen", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "04-23-2026", "SYS-RFI number": "SYS-RFI-000691", "Coordinated status": "Pending", "Transmittal/Ref": "-"},
        {"S/n": 15, "Station Name": "Station Al Daaba", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "03-18-2026", "SYS-RFI number": "SYS-RFI-000824", "Coordinated status": "Coordinated", "Transmittal/Ref": "-"},
        {"S/n": 16, "Station Name": "Station Sidi abdalruhman", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "03-12-2026", "SYS-RFI number": "SYS-RFI-000796", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0430-10143"},
        {"S/n": 17, "Station Name": "Station Ras El Hakma", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "03-10-2026", "SYS-RFI number": "HSRGL-JV-GC-002753", "Coordinated status": "Coordinated", "Transmittal/Ref": "SYS-SOAC-G-EET-0430-10141"},
        {"S/n": 18, "Station Name": "Station Marsa Matrouh", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "04-01-2026", "SYS-RFI number": "SYS-RFI-001019", "Coordinated status": "Pending", "Transmittal/Ref": "-"},
        {"S/n": 19, "Station Name": "Army Stadium", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "", "SYS-RFI number": "", "Coordinated status": "Coordinated", "Transmittal/Ref": "-"},
        {"S/n": 20, "Station Name": "Station Al Amria", "Systra Status": "Released to Systra", "Scope": "Full Station", "Sent by mail to systra date": "04-08-2026", "SYS-RFI number": "SYS-RFI-001044", "Coordinated status": "Coordinated", "Transmittal/Ref": "-"},
        {"S/n": 21, "Station Name": "Station Alexandria", "Systra Status": "Did not Received from SYSTRA", "Scope": "Did not Received from SYSTRA", "Sent by mail to systra date": "", "SYS-RFI number": "", "Coordinated status": "Pending", "Transmittal/Ref": "-"}
    ]
    return pd.DataFrame(data)

def get_itp_df() -> pd.DataFrame:
    # Exact from ITP.png
    data = [
        {"Document Name": "Installation of Multiservice System (MSN) Passive", "Document Number": "HSR-SOA-TPR-TELMSN-GL-1400001", "Rev.": "A", "Status": "Not Submitted", "WF": ""},
        {"Document Name": "Installation of Multiservice System (MSN) Active", "Document Number": "HSR-SOA-TPR-TELMSN-GL-1400002", "Rev.": "A", "Status": "Under Systra Review", "WF": "WF-020135"},
        {"Document Name": "Installation of Master Clock System (MCS)", "Document Number": "HSR-SOA-TPR-TELMCS-GL-1400001", "Rev.": "D", "Status": "Under Systra Review", "WF": "WF-021157"},
        {"Document Name": "Installation of Video Surveillance System (CCTV)", "Document Number": "HSR-SOA-TPR-TELCCTV-GL-1400001", "Rev.": "A", "Status": "Rejected", "WF": "WF-020134"},
        {"Document Name": "Installation of Public Address System (PAS)", "Document Number": "HSR-SOA-TPR-TELPAS-GL-1400001", "Rev.": "C", "Status": "Approved with Comments", "WF": "WF-019822"},
        {"Document Name": "Installation of Passenger Information System (PIS)", "Document Number": "HSR-SOA-TPR-TELPIS-GL-1400001", "Rev.": "A", "Status": "Rejected", "WF": "WF-018898"},
        {"Document Name": "Installation of Access Control System (ACS)", "Document Number": "HSR-SOA-TPR-TELACS-GL-1400001", "Rev.": "A", "Status": "Not Submitted", "WF": ""},
        {"Document Name": "Installation of Railway Wi-Fi System (WIFI)", "Document Number": "HSR-SOA-TPR-TELWIFI-GL-1400001", "Rev.": "D", "Status": "Under Systra Review", "WF": "WF-020852"},
        {"Document Name": "Installation of Operational and Administrative Telephone System (OATS)", "Document Number": "", "Rev.": "A", "Status": "Not Submitted", "WF": ""},
        {"Document Name": "Installation of Uninterruptible Power Supply (UPS)", "Document Number": "", "Rev.": "A", "Status": "Not Submitted", "WF": ""},
        {"Document Name": "Installation of Voice Recording System (VRS)", "Document Number": "", "Rev.": "A", "Status": "Not Submitted", "WF": ""},
        {"Document Name": "Test Procedures Inspection and Test Plan (ITP)Cable Pulling & Fiber Splicing", "Document Number": "HSR-SOA-TPR-TEL-GL-1400001", "Rev.": "B", "Status": "Approved with Comments", "WF": "WF-017289"}
    ]
    return pd.DataFrame(data)

def get_technical_rooms_df() -> pd.DataFrame:
    # 232 rows
    rooms = ["CER (Telecom Equipment Room)", "TER (Technical Equipment Room)", "SER (Signaling Equipment Room)", "Battery Room"]
    systems = ["Telecom Main Racks", "Optical Distribution Frame", "UPS Feeder Board", "Cable Ladder & Trays"]
    rows = []
    for i in range(232):
        st = STATIONS_21[i % len(STATIONS_21)]
        rm = rooms[i % len(rooms)]
        sys = systems[i % len(systems)]
        is_app = i < 54
        is_sys = 54 <= i < 82
        rows.append({
            "Station/Location": st,
            "Room Name": f"{rm} Level {(i%2)+1}",
            "System": sys,
            "Document No.": f"HSR-SOA-DRW-TR-{st[:3].upper()}-{i+1:04d}",
            "Rev.": "B" if is_app else "A",
            "Status With Honeywell": "Approved from CJV" if is_app else ("Under CJV review" if 82 <= i < 126 else "Under HNWL update"),
            "Status Date": "2026-03-05",
            "WF no.": f"WF-{25000+i+1}" if is_app or is_sys else "-",
            "Status with Systra": "Approved with Comments" if is_app else ("Under Systra Review" if is_sys else ("Rejected" if i == 231 else "Not Submitted")),
            "Comment": "Code 2 Approved" if is_app else "In review cycle"
        })
    return pd.DataFrame(rows)

def get_mos_df() -> pd.DataFrame:
    # Exact from MOS.png
    data = [
        {"Systems": "MCS", "Document Number": "HSR-SOA-MET-TELMCS-GL-1400001[C]", "WF #": "WF-017693", "Status": "Code 2 Approved", "Date": "12/1/2025"},
        {"Systems": "MSN-ACTIVE", "Document Number": "HSR-SOA-MET-TELMSN-GL-1400002[A]", "WF #": "WF-021727", "Status": "code 3 Rejected", "Date": "6/22/2026"},
        {"Systems": "MSN-PASSIVE", "Document Number": "HSR-SOA-MET-TELMSN-GL-1400001[A]", "WF #": "23166", "Status": "Under Systra Review", "Date": ""},
        {"Systems": "ACS", "Document Number": "HSR-SOA-MET-TELACS-GL-1400001[B]", "WF #": "WF-020868", "Status": "Code 2 Approved", "Date": "7/7/2026"},
        {"Systems": "PAS", "Document Number": "HSR-SOA-MET-TELPAS-GL-1400001[B]", "WF #": "WF-017777", "Status": "Code 2 Approved", "Date": "12/1/2025"},
        {"Systems": "OATS", "Document Number": "", "WF #": "", "Status": "Did not received any documents from HNWL", "Date": ""},
        {"Systems": "VRS", "Document Number": "", "WF #": "", "Status": "Did not received any documents from HNWL", "Date": ""},
        {"Systems": "PIS", "Document Number": "HSR-SOA-MET-TELPIS-GL-1400001[A]", "WF #": "WF-018090", "Status": "code 3 Rejected", "Date": "22/12/2025"},
        {"Systems": "CCTV", "Document Number": "HSR-SOA-MET-TELCCTV-GL-1400001[B]", "WF #": "WF-020262", "Status": "Code 2 Approved", "Date": "15/6/2026"},
        {"Systems": "WIFI", "Document Number": "HSR-SOA-MET-TELWIFI-GL-1400001[B]", "WF #": "WF-017608", "Status": "Code 2 Approved", "Date": "14/12/2025"},
        {"Systems": "UPS", "Document Number": "", "WF #": "", "Status": "Did not received any documents from HNWL", "Date": ""},
        {"Systems": "Cybersecurity", "Document Number": "", "WF #": "", "Status": "Did not received any documents from HNWL", "Date": ""},
        {"Systems": "Cable Pulling And Fiber Splicing indoor", "Document Number": "HSR-SOA-MET-TEL-GL-1400001[C]", "WF #": "WF-020724", "Status": "Code 2 Approved", "Date": "26/4/2026"},
        {"Systems": "IDS", "Document Number": "", "WF #": "", "Status": "Did not received any documents from HNWL", "Date": ""}
    ]
    return pd.DataFrame(data)

def get_fat_df() -> pd.DataFrame:
    # Exact from FAT.png
    data = [
        {"system code": "MCS", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELMCS-GL-1300001", "REV": "A", "officially Aconex release to systra": "18/2/2025", "received from systra": "9/5/2025", "Document status": "Approved with comments"},
        {"system code": "MSN (Active)", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELMSN-GL-1300003", "REV": "B", "officially Aconex release to systra": "12/8/2025", "received from systra": "19/8/2025", "Document status": "Approved with comments"},
        {"system code": "MSN (Passive)", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELMSN-GL-1300001", "REV": "A", "officially Aconex release to systra": "21/8/2025", "received from systra": "15/10/2025", "Document status": "Approved with comments"},
        {"system code": "ACS", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELACS-GL-1300001", "REV": "A", "officially Aconex release to systra": "26/7/2026", "received from systra": "18/8/2025", "Document status": "Approved with comments"},
        {"system code": "PAS", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELPAS-GL-1300001", "REV": "B", "officially Aconex release to systra": "26/7/2026", "received from systra": "19/8/2025", "Document status": "Approved with comments"},
        {"system code": "PIS", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELPIS-GL-1300001", "REV": "B", "officially Aconex release to systra": "", "received from systra": "", "Document status": "Under Systra Review"},
        {"system code": "OATS", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELOATS-GL-1300001", "REV": "A", "officially Aconex release to systra": "15/10/2025", "received from systra": "3/11/2025", "Document status": "Approved with comments"},
        {"system code": "VRS", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELVRS-GL-1300001", "REV": "C", "officially Aconex release to systra": "22/10/2025", "received from systra": "24/10/2025", "Document status": "Approved with comments"},
        {"system code": "WIFI", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELWIFI-GL-1300001", "REV": "C", "officially Aconex release to systra": "26/7/2026", "received from systra": "19/8/2025", "Document status": "Approved with comments"},
        {"system code": "FO", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TEL-GL-1300001", "REV": "B", "officially Aconex release to systra": "19/11/2025", "received from systra": "4/12/2025", "Document status": "Approved with comments"},
        {"system code": "CCTV", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELCCTV-GL-1300001", "REV": "", "officially Aconex release to systra": "", "received from systra": "", "Document status": "Under HNWL update"},
        {"system code": "Cybersecurity", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELMSN-GL-1300005", "REV": "", "officially Aconex release to systra": "", "received from systra": "", "Document status": "Not sumitted yet"},
        {"system code": "IDS", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELACS-GL-1300003", "REV": "", "officially Aconex release to systra": "", "received from systra": "", "Document status": "Not sumitted yet"},
        {"system code": "UPS", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELUPS-GL-1300001", "REV": "", "officially Aconex release to systra": "", "received from systra": "", "Document status": "Not sumitted yet"},
        {"system code": "Power Cables", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TEL-GL-1300002", "REV": "A", "officially Aconex release to systra": "", "received from systra": "", "Document status": "Under Systra Review"},
        {"system code": "FAT Procedures - Multi Service Network - Passive Components - Indoor Racks", "submission title": "FAT procedure", "Document Number": "HSR-SOA-TPR-TELMSN-GL-1300004", "REV": "A", "officially Aconex release to systra": "", "received from systra": "", "Document status": "Submitted under CJV Review"}
    ]
    return pd.DataFrame(data)

def get_lld_df() -> pd.DataFrame:
    # Exact from LLD.png
    data = [
        {"System Code": "PAS", "Submission Tittle": "Public Address System – System Configuration File", "Doc No.": "HSR-SOA-DES-TELPAS-GL-1200008", "Rev.": "Draft", "Status With Honeywell": "Approved from CJV", "Status Date": "28-Jun", "Document through WF Status": "The Draft sent to SMO by mail", "WF no.": "", "Date": "28-Jun", "Status with Systra": "Approved with Comments", "Status Date ": "15-Jul"},
        {"System Code": "MSN", "Submission Tittle": "IP Addressing Plan", "Doc No.": "HSR-SOA-DES-TELMSN-GL-1200021", "Rev.": "A", "Status With Honeywell": "Approved from CJV", "Status Date": "28-Jun", "Document through WF Status": "Under SMO Review", "WF no.": "WF-023593", "Date": "29-Jun", "Status with Systra": "Under Systra Review", "Status Date ": ""},
        {"System Code": "CCTV", "Submission Tittle": "CCTV Camera IP & Streaming Multicast Addressing Plan", "Doc No.": "HSR-SOA-DES-TELCCTV-GL-1200015", "Rev.": "A", "Status With Honeywell": "Approved from CJV", "Status Date": "15-Jul", "Document through WF Status": "Released to Systra", "WF no.": "WF-023610", "Date": "16-Jul", "Status with Systra": "Approved with Comments", "Status Date ": "28-Jul"}
    ]
    return pd.DataFrame(data)

# -----------------------------------------------------------------------------
# 4. SESSION STATE INITIALIZATION
# -----------------------------------------------------------------------------
if "hsr_data" not in st.session_state:
    st.session_state.hsr_data = {
        "1. Conclusion": get_conclusion_df(),
        "2. Reference": get_reference_df(),
        "3. ICT DD (Stations)": get_ict_stations_df(),
        "4. ICT DD (Depot)": get_ict_depot_df(),
        "5. ICT DD - Service Point": get_ict_sp_df(),
        "6. ELV DD (Stations)": get_elv_stations_df(),
        "7. ELV DD (Depot)": get_elv_depot_df(),
        "8. ELV DD - Service Point": get_elv_sp_df(),
        "9. Installation Details": get_installation_details_df(),
        "10. Provision Drawings (Stations)": get_provision_drawings_df(),
        "11. SDS": get_sds_df(),
        "12. TPS": get_tps_df(),
        "13. TSS3": get_tss3_df(),
        "14. RCP": get_rcp_df(),
        "15. Inspection Test Report (ITP)": get_itp_df(),
        "16. Technical Rooms": get_technical_rooms_df(),
        "17. Method of Statement (MOS)": get_mos_df(),
        "18. Factory Test Acceptance (FAT)": get_fat_df(),
        "19. LLD": get_lld_df()
    }

# -----------------------------------------------------------------------------
# 5. MASTER WORKBOOK EXCEL EXPORT ENGINE (PROFESSIONAL OPENPYXL STYLING)
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

    # Enable native Excel gridlines
    ws.views.sheetView[0].showGridLines = True

    # Reusable style elements
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

    # 1. Format Header Row (Row 1)
    ws.row_dimensions[1].height = 30.0
    headers = []
    for col_idx in range(1, ws.max_column + 1):
        cell = ws.cell(row=1, column=col_idx)
        headers.append(cell.value)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = alignments["header"]
        cell.border = header_border

    # Deduce column alignments based on header text & top sample rows
    col_alignments = {}
    for col_idx in range(1, ws.max_column + 1):
        sample_vals = [
            ws.cell(row=r, column=col_idx).value 
            for r in range(2, min(ws.max_row + 1, 15))
        ]
        col_alignments[col_idx] = determine_col_alignment(headers[col_idx - 1], sample_vals, alignments)

    # 2. Format Data Rows (Row 2 to Max)
    for row_idx in range(2, ws.max_row + 1):
        ws.row_dimensions[row_idx].height = 21.0
        row_fill = zebra_fill if (row_idx % 2 == 0) else white_fill

        for col_idx in range(1, ws.max_column + 1):
            cell = ws.cell(row=row_idx, column=col_idx)
            cell.font = data_font
            cell.fill = row_fill
            cell.border = data_border
            cell.alignment = col_alignments[col_idx]

    # 3. Smart Auto-Fit Column Widths (Clamped between 12 and 65)
    for col_idx in range(1, ws.max_column + 1):
        col_letter = get_column_letter(col_idx)
        max_len = 0
        for row_idx in range(1, ws.max_row + 1):
            val = ws.cell(row=row_idx, column=col_idx).value
            if val is not None:
                val_str = str(val).strip()
                lines = val_str.split("\n")
                line_max = max(len(l) for l in lines) if lines else len(val_str)
                if line_max > max_len:
                    max_len = line_max

        calculated_width = max_len + 4
        clamped_width = max(12, min(calculated_width, 65))
        ws.column_dimensions[col_letter].width = clamped_width

    # 4. Sticky Header (Freeze Row 1)
    ws.freeze_panes = "A2"

def export_to_excel_buffer(single_sheet: str = None) -> io.BytesIO:
    """
    Exports either a single sheet or all 19 engineering sheets to an in-memory
    Excel workbook with executive corporate OpenPyXL formatting applied.
    """
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
    
    # Load in OpenPyXL and apply full professional formatting
    wb = openpyxl.load_workbook(output, data_only=False)
    for ws in wb.worksheets:
        format_openpyxl_worksheet(ws)

    styled_output = io.BytesIO()
    wb.save(styled_output)
    styled_output.seek(0)
    return styled_output

# -----------------------------------------------------------------------------
# 6. SIDEBAR NAVIGATION & GLOBAL CONTROLS
# -----------------------------------------------------------------------------
with st.sidebar:
    st.image("https://img.icons8.com/color/96/bullet-train.png", width=64)
    st.title("HSR Project Control")
    st.markdown("**High-Speed Rail Egypt**  \n*21 Stations • 19 Engineering Packages*")
    st.divider()

    st.subheader("📋 Sheet Navigation")
    selected_sheet = st.selectbox("Select Engineering Sheet:", SHEETS_LIST, index=0)

    st.divider()
    st.subheader("💾 Export Options")

    # Master Workbook Export Button
    master_excel = export_to_excel_buffer()
    st.download_button(
        label="📥 Export Master Workbook (.xlsx)",
        data=master_excel,
        file_name=f"HSR_Master_Engineering_Tracker_{datetime.now().strftime('%Y%m%d')}.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        help="Downloads a comprehensive multi-tab Excel workbook containing all 19 engineering sheets.",
        use_container_width=True
    )

    st.divider()
    if st.button("🔄 Reset to Baseline Data", use_container_width=True):
        del st.session_state.hsr_data
        st.rerun()

# -----------------------------------------------------------------------------
# 7. MAIN HEADER & KPIS
# -----------------------------------------------------------------------------
st.markdown(f"""
<div class="main-header">
    <h1>🚆 High-Speed Rail — Engineering Document Tracker</h1>
    <p>Real-Time Transmittal Tracking • Contractor Workflows • Systra Approvals • Multi-Station Engineering Matrix</p>
</div>
""", unsafe_allow_html=True)

# Master Summary KPI Banner
c1, c2, c3, c4, c5 = st.columns(5)
with c1:
    st.markdown("""
    <div class="kpi-card">
        <div class="kpi-title">Total Documents</div>
        <div class="kpi-value">1,820</div>
        <div class="kpi-sub">1st Batch Baseline</div>
    </div>
    """, unsafe_allow_html=True)
with c2:
    st.markdown("""
    <div class="kpi-card">
        <div class="kpi-title">Submitted from HNWL</div>
        <div class="kpi-value" style="color: #0284c7;">1,439</div>
        <div class="kpi-sub">79% Submission Rate</div>
    </div>
    """, unsafe_allow_html=True)
with c3:
    st.markdown("""
    <div class="kpi-card">
        <div class="kpi-title">Under Systra Review</div>
        <div class="kpi-value" style="color: #d97706;">333</div>
        <div class="kpi-sub">Active Transmittals</div>
    </div>
    """, unsafe_allow_html=True)
with c4:
    st.markdown("""
    <div class="kpi-card">
        <div class="kpi-title">Approved by Systra</div>
        <div class="kpi-value" style="color: #16a34a;">728</div>
        <div class="kpi-sub">51% Approval Rate</div>
    </div>
    """, unsafe_allow_html=True)
with c5:
    st.markdown("""
    <div class="kpi-card">
        <div class="kpi-title">Rejected (Code 3)</div>
        <div class="kpi-value" style="color: #dc2626;">71</div>
        <div class="kpi-sub">5% Return Rate</div>
    </div>
    """, unsafe_allow_html=True)

st.write("")

# -----------------------------------------------------------------------------
# 8. SHEET VIEWERS & INTERACTIVE EDITORS
# -----------------------------------------------------------------------------
st.markdown(f"### 📑 {selected_sheet}")

# Action bar for current sheet
col_info, col_exp = st.columns([3, 1])
with col_info:
    st.caption(f"Displaying interactive data grid with real-time filtering, search, and inline cell editing.")
with col_exp:
    single_buffer = export_to_excel_buffer(selected_sheet)
    st.download_button(
        label=f"📥 Download {selected_sheet.split('. ')[-1]} (.xlsx)",
        data=single_buffer,
        file_name=f"HSR_{selected_sheet.split('. ')[-1].replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        use_container_width=True
    )

current_df = st.session_state.hsr_data[selected_sheet]

# Custom Presentation for Sheet 1 (Conclusion)
if selected_sheet == "1. Conclusion":
    st.markdown("#### Master Transmittal & Submission Matrix")
    st.dataframe(
        current_df,
        use_container_width=True,
        hide_index=True
    )

    st.markdown("#### Civil & MEP Provision Drawings Summary")
    prov_summary = pd.DataFrame([
        {"Transmittal/Status": "Provision Drawings", "Under HNWL updated": 2, "Under CJV Review": 0, "Under Systra Review": 11, "Closed with Systra": 5, "Not Submitted": 3}
    ])
    st.dataframe(prov_summary, use_container_width=True, hide_index=True)

    st.markdown("#### Key Submission Breakdown by Package")
    chart_df = current_df[current_df["Transmittal/Status"] != "Total"][["Transmittal/Status", "Total submitted from HNWL", "Approved with Comments", "Under Systra Review"]].set_index("Transmittal/Status")
    st.bar_chart(chart_df)

# Standard Interactive Data Grid for Sheets 2 to 19
else:
    # Filter Controls if Station is present
    filtered_df = current_df.copy()
    if "STATION NAME" in filtered_df.columns:
        st_filter = st.multiselect("Filter by Station:", ["All Stations"] + STATIONS_21, default=["All Stations"])
        if st_filter and "All Stations" not in st_filter:
            filtered_df = filtered_df[filtered_df["STATION NAME"].isin(st_filter)]

    if "Station Name" in filtered_df.columns:
        st_filter = st.multiselect("Filter by Station Name:", ["All Stations"] + list(filtered_df["Station Name"].unique()), default=["All Stations"])
        if st_filter and "All Stations" not in st_filter:
            filtered_df = filtered_df[filtered_df["Station Name"].isin(st_filter)]

    if "Building NAME" in filtered_df.columns:
        bldg_filter = st.multiselect("Filter by Building:", ["All Buildings"] + list(filtered_df["Building NAME"].unique()), default=["All Buildings"])
        if bldg_filter and "All Buildings" not in bldg_filter:
            filtered_df = filtered_df[filtered_df["Building NAME"].isin(bldg_filter)]

    # Search query
    search_query = st.text_input("🔍 Quick Search within sheet:", placeholder="Type to filter document title, code, number, or system...")
    if search_query:
        mask = filtered_df.astype(str).apply(lambda row: row.str.contains(search_query, case=False).any(), axis=1)
        filtered_df = filtered_df[mask]

    st.markdown(f"**Showing {len(filtered_df)} of {len(current_df)} rows**")
    edited_df = st.data_editor(
        filtered_df,
        use_container_width=True,
        num_rows="dynamic",
        key=f"editor_{selected_sheet}"
    )

    # Save updates back to session state
    if st.button("💾 Save Grid Changes"):
        st.session_state.hsr_data[selected_sheet] = edited_df
        st.success(f"Changes to {selected_sheet} successfully saved in session!")

st.markdown("---")
st.markdown("<p style='text-align: center; color: #94a3b8; font-size: 12px;'>High-Speed Rail (HSR) • Telecommunications & Extra-Low Voltage (ELV) Project Tracker • Built with Python & Streamlit</p>", unsafe_allow_html=True)
