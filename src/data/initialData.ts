import { HSRRow, ConclusionRow } from '../types';
import { HSR_STATIONS, TEL_SUBSYSTEMS } from './constants';

export const INITIAL_CONCLUSION_DATA: ConclusionRow[] = [
  {
    transmittal: 'ELV Detailed Design',
    totalDocs: 1067,
    submittedHnwl: 803,
    pctSubmittedHnwl: '75%',
    notSubmittedHnwl: 264,
    pctNotSubmittedHnwl: '25%',
    underHnwlUpdate: 138,
    underCjvReview: 34,
    underSafetyReview: 5,
    underSmoReview: 23,
    underSystraReview: 201,
    approvedWithComments: 424,
    pctApprovedFromSys: '53%',
    rejected: 50,
    pctRejectedFromSys: '6%',
  },
  {
    transmittal: 'ICT Detailed Design',
    totalDocs: 435,
    submittedHnwl: 369,
    pctSubmittedHnwl: '85%',
    notSubmittedHnwl: 66,
    pctNotSubmittedHnwl: '15%',
    underHnwlUpdate: 72,
    underCjvReview: 0,
    underSafetyReview: 9,
    underSmoReview: 53,
    underSystraReview: 98,
    approvedWithComments: 210,
    pctApprovedFromSys: '36%',
    rejected: 16,
    pctRejectedFromSys: '4%',
  },
  {
    transmittal: 'SDS',
    totalDocs: 14,
    submittedHnwl: 14,
    pctSubmittedHnwl: '100%',
    notSubmittedHnwl: 0,
    pctNotSubmittedHnwl: '0%',
    underHnwlUpdate: 0,
    underCjvReview: 0,
    underSafetyReview: 0,
    underSmoReview: 0,
    underSystraReview: 2,
    approvedWithComments: 11,
    pctApprovedFromSys: '79%',
    rejected: 2,
    pctRejectedFromSys: '14%',
  },
  {
    transmittal: 'Installation Details',
    totalDocs: 11,
    submittedHnwl: 8,
    pctSubmittedHnwl: '73%',
    notSubmittedHnwl: 3,
    pctNotSubmittedHnwl: '27%',
    underHnwlUpdate: 1,
    underCjvReview: 0,
    underSafetyReview: 0,
    underSmoReview: 0,
    underSystraReview: 1,
    approvedWithComments: 6,
    pctApprovedFromSys: '13%',
    rejected: 0,
    pctRejectedFromSys: '0%',
  },
  {
    transmittal: 'Technical Rooms',
    totalDocs: 232,
    submittedHnwl: 215,
    pctSubmittedHnwl: '93%',
    notSubmittedHnwl: 17,
    pctNotSubmittedHnwl: '7%',
    underHnwlUpdate: 68,
    underCjvReview: 44,
    underSafetyReview: 0,
    underSmoReview: 20,
    underSystraReview: 28,
    approvedWithComments: 54,
    pctApprovedFromSys: '25%',
    rejected: 1,
    pctRejectedFromSys: '0%',
  },
  {
    transmittal: 'Method of Statement',
    totalDocs: 14,
    submittedHnwl: 9,
    pctSubmittedHnwl: '64%',
    notSubmittedHnwl: 5,
    pctNotSubmittedHnwl: '36%',
    underHnwlUpdate: 0,
    underCjvReview: 0,
    underSafetyReview: 0,
    underSmoReview: 0,
    underSystraReview: 1,
    approvedWithComments: 6,
    pctApprovedFromSys: '67%',
    rejected: 2,
    pctRejectedFromSys: '22%',
  },
  {
    transmittal: 'Factory Test Acceptance (FAT)',
    totalDocs: 15,
    submittedHnwl: 13,
    pctSubmittedHnwl: '87%',
    notSubmittedHnwl: 2,
    pctNotSubmittedHnwl: '13%',
    underHnwlUpdate: 1,
    underCjvReview: 1,
    underSafetyReview: 0,
    underSmoReview: 0,
    underSystraReview: 2,
    approvedWithComments: 9,
    pctApprovedFromSys: '69%',
    rejected: 0,
    pctRejectedFromSys: '0%',
  },
  {
    transmittal: 'Factory Test Report',
    totalDocs: 15,
    submittedHnwl: 8,
    pctSubmittedHnwl: '53%',
    notSubmittedHnwl: 7,
    pctNotSubmittedHnwl: '47%',
    underHnwlUpdate: 0,
    underCjvReview: 0,
    underSafetyReview: 0,
    underSmoReview: 0,
    underSystraReview: 0,
    approvedWithComments: 8,
    pctApprovedFromSys: '100%',
    rejected: 0,
    pctRejectedFromSys: '0%',
  },
  {
    transmittal: 'Wayside DD (ICT, ELV)',
    totalDocs: 17,
    submittedHnwl: 0,
    pctSubmittedHnwl: '0%',
    notSubmittedHnwl: 17,
    pctNotSubmittedHnwl: '100%',
    underHnwlUpdate: 0,
    underCjvReview: 0,
    underSafetyReview: 0,
    underSmoReview: 0,
    underSystraReview: 0,
    approvedWithComments: 0,
    pctApprovedFromSys: '0%',
    rejected: 0,
    pctRejectedFromSys: '0%',
  },
];

export const PROVISION_SUMMARY_DATA = {
  underHnwlUpdated: 2,
  underCjvReview: 0,
  underSystraReview: 11,
  closedWithSystra: 5,
  notSubmitted: 3,
};

export const INITIAL_REFERENCE_DATA: HSRRow[] = [
  { id: 'ref-1', category: 'Status With Honeywell', code: 'HNWL-01', value: 'Not Submitted from HNWL', department: 'Honeywell Engineering', slaDays: '14 Days' },
  { id: 'ref-2', category: 'Status With Honeywell', code: 'HNWL-02', value: 'Under CJV review', department: 'Civil JV Technical Office', slaDays: '7 Days' },
  { id: 'ref-3', category: 'Status With Honeywell', code: 'HNWL-03', value: 'Under Safety Review', department: 'System Safety & RAMS', slaDays: '7 Days' },
  { id: 'ref-4', category: 'Status With Honeywell', code: 'HNWL-04', value: 'Under HNWL update due to CJV comments', department: 'Honeywell Engineering', slaDays: '10 Days' },
  { id: 'ref-5', category: 'Status With Honeywell', code: 'HNWL-05', value: 'Approved from CJV', department: 'Civil JV Technical Office', slaDays: 'Closed' },
  { id: 'ref-6', category: 'Status With Honeywell', code: 'HNWL-06', value: 'Under HNWL update due to SYS comments', department: 'Honeywell Engineering', slaDays: '10 Days' },
  { id: 'ref-7', category: 'Status With Honeywell', code: 'HNWL-07', value: 'Under HNWL update due to safety comments', department: 'Honeywell Engineering', slaDays: '10 Days' },
  { id: 'ref-8', category: 'Status With Honeywell', code: 'HNWL-08', value: 'Under HNWL update due to SMO comments', department: 'Honeywell Engineering', slaDays: '10 Days' },
  { id: 'ref-9', category: 'Status With Honeywell', code: 'HNWL-09', value: 'Under HNWL update', department: 'Honeywell Engineering', slaDays: '10 Days' },

  { id: 'ref-10', category: 'Document through WF Status', code: 'WF-01', value: 'Under SMO Review', department: 'Siemens / SMO Interface', slaDays: '5 Days' },
  { id: 'ref-11', category: 'Document through WF Status', code: 'WF-02', value: 'Approved with Comments', department: 'Technical Integration Committee', slaDays: 'Closed' },
  { id: 'ref-12', category: 'Document through WF Status', code: 'WF-03', value: 'Released to Systra', department: 'Doc Control (Aconex)', slaDays: 'Transmitted' },
  { id: 'ref-13', category: 'Document through WF Status', code: 'WF-04', value: 'Returned from SMO', department: 'SMO Lead', slaDays: '3 Days' },
  { id: 'ref-14', category: 'Document through WF Status', code: 'WF-05', value: 'On Hold', department: 'Project Management Office', slaDays: 'Pending RFI' },

  { id: 'ref-15', category: 'Status with Systra', code: 'SYS-01', value: 'Under Systra Review', department: 'Systra General Consultant', slaDays: '14 Days' },
  { id: 'ref-16', category: 'Status with Systra', code: 'SYS-02', value: 'Rejected', department: 'Systra Engineering Lead', slaDays: 'Code 3 Return' },
  { id: 'ref-17', category: 'Status with Systra', code: 'SYS-03', value: 'Approved with Comments', department: 'Systra Engineering Lead', slaDays: 'Code 2' },
  { id: 'ref-18', category: 'Status with Systra', code: 'SYS-04', value: 'Approved', department: 'Systra Engineering Lead', slaDays: 'Code 1 Final' },
  { id: 'ref-19', category: 'Status with Systra', code: 'SYS-05', value: 'Not Submitted', department: 'Contractor Submittal Queue', slaDays: 'Planned' },
];

// Helper to generate ICT Stations rows (21 stations x 12 rows = 252 rows)
export const generateIctStationsData = (): HSRRow[] => {
  const subsystems = [
    'MCS', 'MSN (Active)', 'MSN (Passive)', 'ACS', 'PAS', 'PIS', 'OATS', 'VRS', 'WIFI', 'FO', 'CCTV', 'UPS'
  ];
  const rows: HSRRow[] = [];
  let counter = 1;

  HSR_STATIONS.forEach((station, sIdx) => {
    subsystems.forEach((sub, subIdx) => {
      const code = station.substring(0, 3).toUpperCase().replace(/\s/g, '');
      const isApproved = (sIdx + subIdx) % 3 === 0;
      const isReview = (sIdx + subIdx) % 3 === 1;
      
      const statusHnwl = isApproved
        ? 'Approved from CJV'
        : isReview
        ? 'Under CJV review'
        : 'Under HNWL update due to SYS comments';

      const docWf = isApproved
        ? 'Released to Systra'
        : isReview
        ? 'Under SMO Review'
        : 'Approved with Comments';

      const statusSys = isApproved
        ? 'Approved with Comments'
        : isReview
        ? 'Under Systra Review'
        : 'Not Submitted';

      rows.push({
        id: `ict-st-${counter}`,
        stationName: station,
        telSubSystems: sub,
        docTitle: `${station} - ${sub} Detailed Design Architecture & Routing`,
        docNo: `HSR-SOA-DRW-TEL${sub.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '')}-${code}-12000${(subIdx + 1).toString().padStart(2, '0')}`,
        rev: isApproved ? 'B' : 'A',
        statusHoneywell: statusHnwl,
        statusDateHnwl: `2026-0${(sIdx % 8) + 1}-15`,
        docWfStatus: docWf,
        wfNo: `WF-${(20000 + counter).toString()}`,
        statusWithSystra: statusSys,
        statusDateSys: isApproved ? `2026-0${(sIdx % 8) + 1}-28` : '',
        reasonsReturn: isApproved ? '-' : isReview ? 'Under General Consultant review' : 'Cable containment sizing update required',
        comment: isApproved ? 'Code 2 approved with standard remarks' : 'Coordinated with civil platform drawings',
      });
      counter++;
    });
  });

  return rows;
};

// Helper for ICT Depot (9 buildings, total 79 rows)
export const generateIctDepotData = (): HSRRow[] => {
  const buildingConfigs = [
    { name: 'OCS - Main Switching HUB 1', rows: 7 },
    { name: 'OCS - Main Switching HUB 2', rows: 7 },
    { name: 'MWB Building', rows: 7 },
    { name: 'WPMS Building', rows: 7 },
    { name: 'Stabling Yard 1', rows: 12 },
    { name: 'Stabling Yard 2', rows: 12 },
    { name: 'Automatic Train Washing Plant', rows: 7 },
    { name: 'Fresh Water Refiling Building', rows: 7 },
    { name: 'REL Workshop Building', rows: 7 },
  ];

  const systemsPool = ['MCS', 'MSN (Active)', 'MSN (Passive)', 'ACS', 'PAS', 'PIS', 'CCTV', 'WIFI', 'FO', 'UPS', 'OATS', 'VRS'];
  const rows: HSRRow[] = [];
  let counter = 1;

  buildingConfigs.forEach((bldg) => {
    for (let i = 0; i < bldg.rows; i++) {
      const sub = systemsPool[i % systemsPool.length];
      const isApproved = i % 2 === 0;
      rows.push({
        id: `ict-depot-${counter}`,
        buildingName: bldg.name,
        telSubSystems: sub,
        docTitle: `${bldg.name} - ${sub} Network Scheme & Wiring`,
        rev: isApproved ? 'B' : 'A',
        statusHoneywell: isApproved ? 'Approved from CJV' : 'Under HNWL update',
        statusDateHnwl: '2026-03-12',
        docWfStatus: isApproved ? 'Released to Systra' : 'Under SMO Review',
        wfNo: `WF-${(21500 + counter).toString()}`,
        statusWithSystra: isApproved ? 'Approved with Comments' : 'Under Systra Review',
        statusDateSys: isApproved ? '2026-04-05' : '',
        reasonsReturn: isApproved ? '-' : 'Honeywell addressing layout clearance comments',
        comment: 'Depot operational communication package',
      });
      counter++;
    }
  });

  return rows;
};

// Helper for ICT Service Point (6 buildings, total 52 rows)
export const generateIctSpData = (): HSRRow[] => {
  const spConfigs = [
    { name: 'NC SP - Fresh Water Building', rows: 7 },
    { name: 'NC & MM SP - Stabling Yard Building', rows: 12 },
    { name: 'NC SP - High Pressure Curtain Wash Building', rows: 7 },
    { name: 'Borg El-Arab SP - Stabling Yard Building', rows: 12 },
    { name: 'Borg El-Arab SP - WPMS', rows: 7 },
    { name: 'NC SP - OCS switching hub', rows: 7 },
  ];

  const systemsPool = ['MSN (Active)', 'MSN (Passive)', 'CCTV', 'ACS', 'PAS', 'WIFI', 'FO', 'MCS', 'UPS', 'PIS', 'OATS', 'VRS'];
  const rows: HSRRow[] = [];
  let counter = 1;

  spConfigs.forEach((sp) => {
    for (let i = 0; i < sp.rows; i++) {
      const sub = systemsPool[i % systemsPool.length];
      const isApproved = (i + counter) % 3 !== 0;
      rows.push({
        id: `ict-sp-${counter}`,
        buildingName: sp.name,
        telSubSystems: sub,
        docTitle: `${sp.name} - ${sub} Schematics & Enclosures`,
        rev: 'A',
        statusHoneywell: isApproved ? 'Approved from CJV' : 'Under Safety Review',
        statusDateHnwl: '2026-02-20',
        docWfStatus: isApproved ? 'Released to Systra' : 'On Hold',
        wfNo: `WF-${(22000 + counter).toString()}`,
        statusWithSystra: isApproved ? 'Approved with Comments' : 'Under Systra Review',
        statusDateSys: isApproved ? '2026-03-18' : '',
        reasonsReturn: isApproved ? '-' : 'Service point power interface clarification',
        comment: 'Service point transmittal verified',
      });
      counter++;
    }
  });

  return rows;
};

// Helper for ELV Stations (21 stations x 29 rows = 609 rows)
export const generateElvStationsData = (): HSRRow[] => {
  const elvItems = [
    'External CCTV Cameras Layout',
    'Internal CCTV Cameras Concourse',
    'Internal CCTV Platform Level',
    'Access Control System Entrance Doors',
    'Access Control System Technical Rooms',
    'Public Address Loudspeakers Concourse',
    'Public Address Loudspeakers Platform',
    'Passenger Information Display (PIDS) Foyer',
    'Passenger Information Display (PIDS) Platform',
    'Master Clock Display Subsystem',
    'Wi-Fi Access Points Public Areas',
    'Wi-Fi Access Points Staff & Office Areas',
    'Intrusion Detection System (IDS) Perimeter',
    'Intrusion Detection System (IDS) Internal Doors',
    'Civil Defense & Fire Alarm Integration Matrix',
    'Emergency Call Point (ECP) Station Network',
    'Station Telephony Intercom Terminals',
    'Telecom Equipment Room (TER) Rack Layout',
    'Communications Equipment Room (CER) Rack Layout',
    'Station Cable Containment Routing Plan Ground',
    'Station Cable Containment Routing Plan First Floor',
    'Station Cable Containment Platform Routing',
    'Grounding and Bonding Mesh Network',
    'Main Power Feeder & Telecom Distribution Board',
    'Fiber Optic ODF Termination Schedule',
    'Cat6A Structured Cabling Patch Schedule',
    'Earthing Pit & Surge Protection Diagram',
    'UPS Distribution Scheme for ELV Systems',
    'Overall Station ELV Architecture Schematic',
  ];

  const rows: HSRRow[] = [];
  let counter = 1;

  HSR_STATIONS.forEach((station, sIdx) => {
    elvItems.forEach((item, itemIdx) => {
      const isApproved = (sIdx + itemIdx) % 2 === 0;
      const subCode = itemIdx < 5 ? 'CCTV/ACS' : itemIdx < 12 ? 'PAS/PIS/WIFI' : itemIdx < 17 ? 'IDS/SAFETY' : 'CABLING/TER';
      const stCode = station.substring(0, 3).toUpperCase().replace(/\s/g, '');

      rows.push({
        id: `elv-st-${counter}`,
        stationName: station,
        telSubSystems: subCode,
        docTitle: `${station} - ${item}`,
        docNo: `HSR-SOA-DRW-ELV-${stCode}-110${(itemIdx + 1).toString().padStart(3, '0')}`,
        rev: isApproved ? 'B' : 'A',
        statusHoneywell: isApproved ? 'Approved from CJV' : 'Under HNWL update due to CJV comments',
        docWfStatus: isApproved ? 'Released to Systra' : 'Under SMO Review',
        wfNo: `WF-${(18000 + counter).toString()}`,
        statusWithSystra: isApproved ? 'Approved with Comments' : 'Under Systra Review',
        comment: isApproved ? 'Approved for construction transmittal' : 'Pending coordinated RCP verification',
      });
      counter++;
    });
  });

  return rows;
};

// Helper for ELV Depot (10 Buildings, 167 rows)
export const generateElvDepotData = (): HSRRow[] => {
  const depotBuildings = [
    { name: 'MANUAL WASH', rows: 14 },
    { name: 'WPMS', rows: 14 },
    { name: 'MAIN OCS SWITCHING HUB', rows: 14 },
    { name: 'OCS SECTIONING HUB', rows: 14 },
    { name: 'STABLING YARD 1', rows: 19 },
    { name: 'STABLING YARD 2', rows: 14 },
    { name: 'REL WORKSHOP', rows: 25 },
    { name: 'Automatic Train Wash Building', rows: 19 },
    { name: 'Fresh water Building', rows: 19 },
    { name: 'Admin Building', rows: 14 },
  ];

  const systems = ['CCTV', 'ACS', 'PAS', 'WIFI', 'IDS', 'Telecom Cable Tray', 'UPS', 'Fire Interface'];
  const rows: HSRRow[] = [];
  let counter = 1;

  depotBuildings.forEach((bldg) => {
    for (let i = 0; i < bldg.rows; i++) {
      const sys = systems[i % systems.length];
      const isApproved = (i + counter) % 3 === 0;
      rows.push({
        id: `elv-depot-${counter}`,
        buildingName: bldg.name,
        telSubSystems: sys,
        docTitle: `${bldg.name} - ${sys} Layout & Details`,
        docNo: `HSR-SOA-DRW-ELV-DEP-${(counter).toString().padStart(4, '0')}`,
        rev: 'A',
        statusHoneywell: isApproved ? 'Approved from CJV' : 'Under HNWL update',
        statusDateHnwl: '2026-03-01',
        docWfStatus: isApproved ? 'Released to Systra' : 'Under SMO Review',
        wfNo: `WF-${(19500 + counter).toString()}`,
        statusWithSystra: isApproved ? 'Approved with Comments' : 'Under Systra Review',
        statusDateSys: isApproved ? '2026-04-12' : '',
        reasonsReturn: isApproved ? '-' : 'Depot maintenance safety clearance check',
        comment: 'Depot ELV documentation batch',
      });
      counter++;
    }
  });

  return rows;
};

// Helper for ELV Service Point (139 rows total: 81 New Capital, 58 Borg El Arab)
export const generateElvSpData = (): HSRRow[] => {
  const rows: HSRRow[] = [];
  let counter = 1;

  const spConfigs = [
    { location: 'New Capital SP', count: 81, bldgs: ['NC SP - Administration', 'NC SP - Locomotive Shed', 'NC SP - Sanding Facility', 'NC SP - Switching Center'] },
    { location: 'Borg El Arab SP', count: 58, bldgs: ['BEA SP - Maintenance Building', 'BEA SP - Water Tank Facility', 'BEA SP - Staff Rest Area'] },
  ];

  spConfigs.forEach((sp) => {
    for (let i = 0; i < sp.count; i++) {
      const bldg = sp.bldgs[i % sp.bldgs.length];
      const isApproved = i % 2 === 0;
      rows.push({
        id: `elv-sp-${counter}`,
        locationName: sp.location,
        buildingName: `${bldg} (Part ${Math.floor(i / sp.bldgs.length) + 1})`,
        statusHoneywell: isApproved ? 'Approved from CJV' : 'Under HNWL update due to SYS comments',
        statusDateHnwl: '2026-03-15',
        docWfStatus: isApproved ? 'Released to Systra' : 'Under SMO Review',
        wfNo: `WF-${(23000 + counter).toString()}`,
        statusWithSystra: isApproved ? 'Approved with Comments' : 'Under Systra Review',
        statusDateSys: isApproved ? '2026-04-20' : '',
        reasonsReturn: isApproved ? '-' : 'Awaiting cable trench alignment confirmation',
        comment: 'Service point electrical & ELV interface',
      });
      counter++;
    }
  });

  return rows;
};

// 9. Installation Details (11 systems)
export const INITIAL_INSTALLATION_DETAILS_DATA: HSRRow[] = [
  { id: 'inst-1', system: 'MCS', docNo: 'HSR-SOA-TYP-TELMCS-GL-1400001', docName: 'Master Clock System Typical Mounting & Cabinet Details', rev: 'B', statusHoneywell: 'Approved from CJV', statusDateHnwl: '2026-01-10', docWfStatus: 'Released to Systra', wfNo: 'WF-017693', statusWithSystra: 'Approved with Comments', reasonsReturn: '-', comment: 'Standard mounting approved' },
  { id: 'inst-2', system: 'ACS', docNo: 'HSR-SOA-TYP-TELACS-GL-1400001', docName: 'Access Control System Reader & Magnetic Lock Mounting', rev: 'B', statusHoneywell: 'Approved from CJV', statusDateHnwl: '2026-01-15', docWfStatus: 'Released to Systra', wfNo: 'WF-020868', statusWithSystra: 'Approved with Comments', reasonsReturn: '-', comment: 'Door contact interface validated' },
  { id: 'inst-3', system: 'PAS', docNo: 'HSR-SOA-TYP-TELPAS-GL-1400001', docName: 'Public Address Horn & Ceiling Speaker Suspension Details', rev: 'B', statusHoneywell: 'Approved from CJV', statusDateHnwl: '2026-01-18', docWfStatus: 'Released to Systra', wfNo: 'WF-017777', statusWithSystra: 'Approved with Comments', reasonsReturn: '-', comment: 'Acoustic baffle isolation approved' },
  { id: 'inst-4', system: 'WIFI', docNo: 'HSR-SOA-TYP-TELWIFI-GL-1400001', docName: 'Outdoor & Indoor Wi-Fi Access Point Bracket Mounting', rev: 'C', statusHoneywell: 'Approved from CJV', statusDateHnwl: '2026-01-22', docWfStatus: 'Released to Systra', wfNo: 'WF-017608', statusWithSystra: 'Approved with Comments', reasonsReturn: '-', comment: 'Vibration dampening approved' },
  { id: 'inst-5', system: 'PIS', docNo: 'HSR-SOA-TYP-TELPIS-GL-1400001', docName: 'Platform Information Display Structural Steel Fixing', rev: 'A', statusHoneywell: 'Under HNWL update due to SYS comments', statusDateHnwl: '2026-02-05', docWfStatus: 'Returned from SMO', wfNo: 'WF-018090', statusWithSystra: 'Under Systra Review', reasonsReturn: 'Wind load calculation update requested by Systra', comment: 'Structural calculation report revised' },
  { id: 'inst-6', system: 'CCTV', docNo: 'HSR-SOA-TYP-TELCCTV-GL-1400001', docName: 'Fixed & PTZ Camera Pole Mounting Details for Stations', rev: 'B', statusHoneywell: 'Approved from CJV', statusDateHnwl: '2026-02-12', docWfStatus: 'Released to Systra', wfNo: 'WF-020262', statusWithSystra: 'Approved with Comments', reasonsReturn: '-', comment: 'Anti-drop safety wire detail included' },
  { id: 'inst-7', system: 'OATS', docNo: 'HSR-SOA-TYP-TELOATS-GL-1400001', docName: 'Operational Telephone Weatherproof Enclosure Mounting', rev: 'A', statusHoneywell: 'Not Submitted from HNWL', statusDateHnwl: '', docWfStatus: 'On Hold', wfNo: '-', statusWithSystra: 'Not Submitted', reasonsReturn: 'Awaiting vendor enclosure sample', comment: 'To be submitted with next transmittal batch' },
  { id: 'inst-8', system: 'MSN-Passive', docNo: 'HSR-SOA-TYP-TELMSN-GL-1400001', docName: 'Multiservice Network 19-inch Rack Anchoring & Seismic Bracing', rev: 'A', statusHoneywell: 'Approved from CJV', statusDateHnwl: '2026-02-18', docWfStatus: 'Released to Systra', wfNo: 'WF-023166', statusWithSystra: 'Approved with Comments', reasonsReturn: '-', comment: 'Seismic zone 3 calculation verified' },
  { id: 'inst-9', system: 'UPS', docNo: 'HSR-SOA-TYP-TELUPS-GL-1400001', docName: 'Telecom Battery Rack & Inverter Seismic Foundation Details', rev: 'A', statusHoneywell: 'Not Submitted from HNWL', statusDateHnwl: '', docWfStatus: 'On Hold', wfNo: '-', statusWithSystra: 'Not Submitted', reasonsReturn: 'Battery room floor load certificate pending', comment: 'Coordinating with civil team' },
  { id: 'inst-10', system: 'IDS', docNo: 'HSR-SOA-TYP-TELIDS-GL-1400001', docName: 'Perimeter Infrared Sensor Fence Mountings & Conduit Entry', rev: 'A', statusHoneywell: 'Not Submitted from HNWL', statusDateHnwl: '', docWfStatus: 'On Hold', wfNo: '-', statusWithSystra: 'Not Submitted', reasonsReturn: 'Depot perimeter fence type revision pending', comment: 'Civil package alignment required' },
  { id: 'inst-11', system: 'FO Enclosure on OCS', docNo: 'HSR-SOA-TYP-TELFO-GL-1400001', docName: 'Fiber Optic Splice Enclosure Clamping on OCS Mast', rev: 'A', statusHoneywell: 'Approved from CJV', statusDateHnwl: '2026-02-25', docWfStatus: 'Released to Systra', wfNo: 'WF-020724', statusWithSystra: 'Approved with Comments', reasonsReturn: '-', comment: 'High voltage clearance compliant' },
];

// 10. Provision Drawings (21 Stations from Provision Drawings.png)
export const INITIAL_PROVISION_DRAWINGS_DATA: HSRRow[] = [
  { id: 'prov-1', stationName: 'Ain Al Sokhna', hnwlStatus: 'Approved from CJV', dateHnwl: '3/9/2026', systraStatus: 'Under Systra Review', dateSystra: '3/9/2026', comments: 'Platform cable sleeve provisions verified' },
  { id: 'prov-2', stationName: 'New Capital', hnwlStatus: 'Approved from CJV', dateHnwl: '23/8/2026', systraStatus: 'Under Systra Review', dateSystra: '23/8/2026', comments: 'Main concourse floor trenches included' },
  { id: 'prov-3', stationName: 'Mohamed Naguib', hnwlStatus: 'Approved from CJV', dateHnwl: '18-1-2026', systraStatus: 'closed', dateSystra: '18/1/2026', comments: 'Civil signoff completed' },
  { id: 'prov-4', stationName: 'Cairo', hnwlStatus: 'Approved from CJV', dateHnwl: '15/2/2026', systraStatus: 'closed', dateSystra: '15/2/2026', comments: 'Tunnel duct coordination finished' },
  { id: 'prov-5', stationName: 'Giza', hnwlStatus: 'Approved from CJV', dateHnwl: '16-5-2026', systraStatus: 'Under Systra Review', dateSystra: '16-5-2026', comments: 'Underground chamber penetration checks' },
  { id: 'prov-6', stationName: 'October Gardens', hnwlStatus: 'Approved from CJV', dateHnwl: '22-12-2026', systraStatus: 'Closed', dateSystra: '22/12/2026', comments: 'Code 1 final approval' },
  { id: 'prov-7', stationName: '6th October', hnwlStatus: 'Approved from CJV', dateHnwl: '7/6/2026', systraStatus: 'Under Systra Review', dateSystra: '7/6/2026', comments: 'Viaduct conduit route review' },
  { id: 'prov-8', stationName: 'Sphinx', hnwlStatus: 'Approved from CJV', dateHnwl: '17/5/2026', systraStatus: 'closed', dateSystra: '18/5/2026', comments: 'Station building structural sleeve pass' },
  { id: 'prov-9', stationName: 'Sadat', hnwlStatus: 'Not Submitted from HNWL', dateHnwl: '', systraStatus: 'Not Submitted', dateSystra: '', comments: 'Civil foundation drawings awaiting release' },
  { id: 'prov-10', stationName: 'Wadi Al Natroun', hnwlStatus: 'Approved from CJV', dateHnwl: '17/5/2026', systraStatus: 'closed', dateSystra: '18/5/2026', comments: 'Closed without observations' },
  { id: 'prov-11', stationName: 'Noubarya', hnwlStatus: 'Approved from CJV', dateHnwl: '23-5-2026', systraStatus: 'Under Systra Review', dateSystra: '23-5-2026', comments: 'Substation interface under review' },
  { id: 'prov-12', stationName: 'Borg Al Arab', hnwlStatus: 'Under HNWL update', dateHnwl: '26-8-2026', systraStatus: 'SYStra shared the As built for Platform', dateSystra: '26-8-2026', comments: 'Platform edge conduit update in progress' },
  { id: 'prov-13', stationName: 'El Hammam', hnwlStatus: 'Under HNWL update', dateHnwl: '26-8-2026', systraStatus: 'Systra Shared their comments', dateSystra: '13-6-2026', comments: 'Honeywell revising wall opening details' },
  { id: 'prov-14', stationName: 'Ras El Hekma', hnwlStatus: 'Approved from CJV', dateHnwl: '2/5/2026', systraStatus: 'Under Systra Review', dateSystra: '2/5/2026', comments: 'Coastal corrosion protection sleeves' },
  { id: 'prov-15', stationName: 'El Dabaa', hnwlStatus: 'Approved from CJV', dateHnwl: '1/7/2026', systraStatus: 'Under Systra Review', dateSystra: '', comments: 'Transmitted via Aconex batch 04' },
  { id: 'prov-16', stationName: 'Marsa Matrouh', hnwlStatus: 'Approved from CJV', dateHnwl: '7/4/2026', systraStatus: 'Under Systra Review', dateSystra: '7/4/2026', comments: 'End terminal facility provisions' },
  { id: 'prov-17', stationName: 'Army Stadium', hnwlStatus: 'Approved from CJV', dateHnwl: '14/6/2026', systraStatus: 'Under Systra Review', dateSystra: '14-6-2026', comments: 'Stadium concourse interface review' },
  { id: 'prov-18', stationName: 'Alamein', hnwlStatus: 'Approved from CJV', dateHnwl: '14-6-2026', systraStatus: 'Under Systra Review', dateSystra: '14-6-2026', comments: 'Express track cable pipe provisions' },
  { id: 'prov-19', stationName: 'Sidi Abdelrahman', hnwlStatus: 'Approved from CJV', dateHnwl: '21-5-2026', systraStatus: 'Under Systra Review', dateSystra: '21-5-2026', comments: 'Passenger bridge duct pass review' },
  { id: 'prov-20', stationName: 'Amrya', hnwlStatus: 'Not Submitted from HNWL', dateHnwl: '', systraStatus: 'Not Submitted', dateSystra: '', comments: 'Awaiting revised architectural layout' },
  { id: 'prov-21', stationName: 'Alexandria', hnwlStatus: 'Not Submitted from HNWL', dateHnwl: '', systraStatus: 'Not Submitted', dateSystra: '', comments: 'Historical terminal design freeze pending' },
];

// 11. SDS (System Design Specs, Serial 0 to 14 = 15 rows)
export const INITIAL_SDS_DATA: HSRRow[] = [
  { id: 'sds-0', serial: '0', systemCode: 'GEN', submissionTitle: 'General Telecommunication System Design Description', docNo: 'HSR-SOA-SDS-TEL-GL-1100000', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-1', serial: '1', systemCode: 'MCS', submissionTitle: 'Master Clock System (MCS) Design Specification', docNo: 'HSR-SOA-SDS-TELMCS-GL-1100001', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-2', serial: '2', systemCode: 'MSN-Active', submissionTitle: 'Multiservice Network (MSN) Active Equipment Specification', docNo: 'HSR-SOA-SDS-TELMSN-GL-1100002', status: 'Code 3 Rejected', hnwlStatus: 'Under HNWL update due to SYS comments' },
  { id: 'sds-3', serial: '3', systemCode: 'MSN-Passive', submissionTitle: 'Multiservice Network (MSN) Fiber Optic Infrastructure', docNo: 'HSR-SOA-SDS-TELMSN-GL-1100003', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-4', serial: '4', systemCode: 'ACS', submissionTitle: 'Access Control System (ACS) Specification & Security Levels', docNo: 'HSR-SOA-SDS-TELACS-GL-1100001', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-5', serial: '5', systemCode: 'PAS', submissionTitle: 'Public Address System (PAS) Acoustic & STI Performance', docNo: 'HSR-SOA-SDS-TELPAS-GL-1100001', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-6', serial: '6', systemCode: 'PIS', submissionTitle: 'Passenger Information System (PIS) Display Engine Spec', docNo: 'HSR-SOA-SDS-TELPIS-GL-1100001', status: 'Code 3 Rejected', hnwlStatus: 'Under HNWL update due to SYS comments' },
  { id: 'sds-7', serial: '7', systemCode: 'CCTV', submissionTitle: 'Closed Circuit Television (CCTV) Video Analytics & VMS', docNo: 'HSR-SOA-SDS-TELCCTV-GL-1100001', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-8', serial: '8', systemCode: 'WIFI', submissionTitle: 'Station Wi-Fi Passenger & Operational Portal Architecture', docNo: 'HSR-SOA-SDS-TELWIFI-GL-1100001', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-9', serial: '9', systemCode: 'OATS', submissionTitle: 'Operational and Administrative Telephony System Spec', docNo: 'HSR-SOA-SDS-TELOATS-GL-1100001', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-10', serial: '10', systemCode: 'VRS', submissionTitle: 'Voice Recording System (VRS) Regulatory Compliance', docNo: 'HSR-SOA-SDS-TELVRS-GL-1100001', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-11', serial: '11', systemCode: 'UPS', submissionTitle: 'Uninterruptible Power Supply (UPS) Telecom Autonomy Spec', docNo: 'HSR-SOA-SDS-TELUPS-GL-1100001', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-12', serial: '12', systemCode: 'IDS', submissionTitle: 'Intrusion Detection System (IDS) Integration Architecture', docNo: 'HSR-SOA-SDS-TELIDS-GL-1100001', status: 'Code 2 Approved', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-13', serial: '13', systemCode: 'Cybersecurity', submissionTitle: 'Railway Telecom IEC 62443 Cybersecurity Architecture', docNo: 'HSR-SOA-SDS-TELCYB-GL-1100001', status: 'Under Systra Review', hnwlStatus: 'Approved from CJV' },
  { id: 'sds-14', serial: '14', systemCode: 'Grounding', submissionTitle: 'Earthing & Lightning Protection for Telecommunication Systems', docNo: 'HSR-SOA-SDS-TELGRD-GL-1100001', status: 'Under Systra Review', hnwlStatus: 'Approved from CJV' },
];

// 12. TPS (74 rows total: 26 TSS, 24 SP, 24 PP)
export const generateTpsData = (): HSRRow[] => {
  const rows: HSRRow[] = [];
  let counter = 1;

  const tpsSections = [
    { prefix: 'TSS', name: 'Traction Supply Station', count: 26 },
    { prefix: 'SP', name: 'Sectioning Post', count: 24 },
    { prefix: 'PP', name: 'Paralleling Post', count: 24 },
  ];

  tpsSections.forEach((sec) => {
    for (let i = 1; i <= sec.count; i++) {
      const locId = `${sec.prefix}-${i.toString().padStart(2, '0')}`;
      const isApproved = (i + counter) % 3 !== 0;
      rows.push({
        id: `tps-${counter}`,
        location: `${sec.name} ${locId}`,
        telSubSystems: i % 2 === 0 ? 'TEL-CCTV/ACS' : 'TEL-MSN/FO',
        docTitle: `${locId} Telecom Interface Drawing & Cable Routing`,
        docNo: `HSR-SOA-DRW-TELTPS-${sec.prefix}${i.toString().padStart(2, '0')}-120001`,
        rev: isApproved ? 'B' : 'A',
        statusHoneywell: isApproved ? 'Approved from CJV' : 'Under HNWL update',
        statusDateHnwl: '2026-02-10',
        docWfStatus: isApproved ? 'Released to Systra' : 'Under SMO Review',
        wfNo: `WF-${(24000 + counter).toString()}`,
        date: '2026-02-15',
        statusWithSystra: isApproved ? 'Approved with Comments' : 'Under Systra Review',
        statusDateSys: isApproved ? '2026-03-01' : '',
        reasonsReturn: isApproved ? '-' : 'Optical bypass configuration check',
        comment: 'High voltage traction substation boundary verified',
      });
      counter++;
    }
  });

  return rows;
};

// 13. TSS3 (From TSS3.png)
export const INITIAL_TSS3_DATA: HSRRow[] = [
  { id: 'tss3-1', docNo: 'HSR-SOA-DRW-TELCCTV-GLDTSS03-1200004', docTitle: 'System Overall Architecture (SLD)', rev: 'A', systemCode: 'TEL-CCTV', location: 'GL-D-TSS03 Traction Supply Station 03', statusSystra: 'Approved with Comments', wfNo: '021093' },
  { id: 'tss3-2', docNo: 'HSR-SOA-DRW-TELCCTV-GLDTSS03-1200005', docTitle: 'System Cable routing plan', rev: 'A', systemCode: 'TEL-CCTV', location: 'GL-D-TSS03 Traction Supply Station 03', statusSystra: 'Approved with Comments', wfNo: '021093' },
  { id: 'tss3-3', docNo: 'HSR-SOA-DRW-TELCCTV-GLDTSS03-1200006', docTitle: 'System Equipment Layout', rev: 'A', systemCode: 'TEL-CCTV', location: 'GL-D-TSS03 Traction Supply Station 03', statusSystra: 'Approved with Comments', wfNo: '021093' },
  { id: 'tss3-4', docNo: 'HSR-SOA-DES-TELCCTV-GLDTSS03-1200004', docTitle: 'Cable Schedule', rev: 'A', systemCode: 'TEL-CCTV', location: 'GL-D-TSS03 Traction Supply Station 03', statusSystra: 'Approved with Comments', wfNo: '021094' },
  { id: 'tss3-5', docNo: 'HSR-SOA-DES-TELCCTV-GLDTSS03-1200005', docTitle: 'Coverage Report / Field of View', rev: 'A', systemCode: 'TEL-CCTV', location: 'GL-D-TSS03 Traction Supply Station 03', statusSystra: 'Approved with Comments', wfNo: '021093' },
  { id: 'tss3-6', docNo: 'HSR-SOA-DRW-TELACS-GLDTSS03-1200001', docTitle: 'ACS Door Schematics & Wiring', rev: 'A', systemCode: 'TEL-ACS', location: 'GL-D-TSS03 Traction Supply Station 03', statusSystra: 'Approved with Comments', wfNo: '021095' },
  { id: 'tss3-7', docNo: 'HSR-SOA-DRW-TELMSN-GLDTSS03-1200001', docTitle: 'Fiber Patching and Core Assignment Plan', rev: 'B', systemCode: 'TEL-MSN', location: 'GL-D-TSS03 Traction Supply Station 03', statusSystra: 'Approved with Comments', wfNo: '021096' },
];

// 14. RCP (From RCP.png, 21 Stations)
export const INITIAL_RCP_DATA: HSRRow[] = [
  { id: 'rcp-1', sn: '1', stationName: 'Station Ain El Sokhna', systraStatus: 'Released to Systra', scope: 'Main Halls', sentMailDate: '', sysRfiNo: '', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0318-9693' },
  { id: 'rcp-2', sn: '2', stationName: 'Station New Capital', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '', sysRfiNo: '', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0302-9436' },
  { id: 'rcp-3', sn: '3', stationName: 'Station Mohamed Naguib', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '', sysRfiNo: '', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0329-9745' },
  { id: 'rcp-4', sn: '4', stationName: 'Station Cairo', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '', sysRfiNo: '', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0423-10068' },
  { id: 'rcp-5', sn: '5', stationName: 'Station Giza', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '02-25-2026', sysRfiNo: 'SYS-RFI-000790', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0409-9913' },
  { id: 'rcp-6', sn: '6', stationName: 'Station October Gardens', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '', sysRfiNo: '', coordinatedStatus: 'Coordinated', transmittalRef: '-' },
  { id: 'rcp-7', sn: '7', stationName: 'Station 6th October', systraStatus: 'Did not Received from SYSTRA', scope: 'Did not Received from SYSTRA', sentMailDate: '', sysRfiNo: '', coordinatedStatus: 'Pending', transmittalRef: '-' },
  { id: 'rcp-8', sn: '8', stationName: 'Station Sphinx', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '03-18-2026', sysRfiNo: 'SYS-RFI-000753', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0430-10142' },
  { id: 'rcp-9', sn: '9', stationName: 'Station Al Sadat', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '', sysRfiNo: '', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0412-9919' },
  { id: 'rcp-10', sn: '10', stationName: 'Station Wadi El Natroun', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '', sysRfiNo: '', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0329-9743' },
  { id: 'rcp-11', sn: '11', stationName: 'Station Al Noubarya', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '04-05-2026', sysRfiNo: 'SYS-RFI-000825', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0412-9920' },
  { id: 'rcp-12', sn: '12', stationName: 'Station Borg Al Arab', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '03-28-2026', sysRfiNo: 'SYS-RFI-000992', coordinatedStatus: 'Coordinated', transmittalRef: '-' },
  { id: 'rcp-13', sn: '13', stationName: 'Station Al Hamam', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '03-30-2026', sysRfiNo: 'SYS-RFI-000993', coordinatedStatus: 'Coordinated', transmittalRef: '-' },
  { id: 'rcp-14', sn: '14', stationName: 'Station Al Alameen', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '04-23-2026', sysRfiNo: 'SYS-RFI-000691', coordinatedStatus: 'Pending', transmittalRef: '-' },
  { id: 'rcp-15', sn: '15', stationName: 'Station Al Daaba', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '03-18-2026', sysRfiNo: 'SYS-RFI-000824', coordinatedStatus: 'Coordinated', transmittalRef: '-' },
  { id: 'rcp-16', sn: '16', stationName: 'Station Sidi abdalruhman', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '03-12-2026', sysRfiNo: 'SYS-RFI-000796', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0430-10143' },
  { id: 'rcp-17', sn: '17', stationName: 'Station Ras El Hakma', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '03-10-2026', sysRfiNo: 'HSRGL-JV-GC-002753', coordinatedStatus: 'Coordinated', transmittalRef: 'SYS-SOAC-G-EET-0430-10141' },
  { id: 'rcp-18', sn: '18', stationName: 'Station Marsa Matrouh', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '04-01-2026', sysRfiNo: 'SYS-RFI-001019', coordinatedStatus: 'Pending', transmittalRef: '-' },
  { id: 'rcp-19', sn: '19', stationName: 'Army Stadium', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '', sysRfiNo: '', coordinatedStatus: 'Coordinated', transmittalRef: '-' },
  { id: 'rcp-20', sn: '20', stationName: 'Station Al Amria', systraStatus: 'Released to Systra', scope: 'Full Station', sentMailDate: '04-08-2026', sysRfiNo: 'SYS-RFI-001044', coordinatedStatus: 'Coordinated', transmittalRef: '-' },
  { id: 'rcp-21', sn: '21', stationName: 'Station Alexandria', systraStatus: 'Did not Received from SYSTRA', scope: 'Did not Received from SYSTRA', sentMailDate: '', sysRfiNo: '', coordinatedStatus: 'Pending', transmittalRef: '-' },
];

// 15. ITP (From ITP.png)
export const INITIAL_ITP_DATA: HSRRow[] = [
  { id: 'itp-1', docName: 'Installation of Multiservice System (MSN) Passive', docNo: 'HSR-SOA-TPR-TELMSN-GL-1400001', rev: 'A', status: 'Not Submitted', wf: '' },
  { id: 'itp-2', docName: 'Installation of Multiservice System (MSN) Active', docNo: 'HSR-SOA-TPR-TELMSN-GL-1400002', rev: 'A', status: 'Under Systra Review', wf: 'WF-020135' },
  { id: 'itp-3', docName: 'Installation of Master Clock System (MCS)', docNo: 'HSR-SOA-TPR-TELMCS-GL-1400001', rev: 'D', status: 'Under Systra Review', wf: 'WF-021157' },
  { id: 'itp-4', docName: 'Installation of Video Surveillance System (CCTV)', docNo: 'HSR-SOA-TPR-TELCCTV-GL-1400001', rev: 'A', status: 'Rejected', wf: 'WF-020134' },
  { id: 'itp-5', docName: 'Installation of Public Address System (PAS)', docNo: 'HSR-SOA-TPR-TELPAS-GL-1400001', rev: 'C', status: 'Approved with Comments', wf: 'WF-019822' },
  { id: 'itp-6', docName: 'Installation of Passenger Information System (PIS)', docNo: 'HSR-SOA-TPR-TELPIS-GL-1400001', rev: 'A', status: 'Rejected', wf: 'WF-018898' },
  { id: 'itp-7', docName: 'Installation of Access Control System (ACS)', docNo: 'HSR-SOA-TPR-TELACS-GL-1400001', rev: 'A', status: 'Not Submitted', wf: '' },
  { id: 'itp-8', docName: 'Installation of Railway Wi-Fi System (WIFI)', docNo: 'HSR-SOA-TPR-TELWIFI-GL-1400001', rev: 'D', status: 'Under Systra Review', wf: 'WF-020852' },
  { id: 'itp-9', docName: 'Installation of Operational and Administrative Telephone System (OATS)', docNo: '', rev: 'A', status: 'Not Submitted', wf: '' },
  { id: 'itp-10', docName: 'Installation of Uninterruptible Power Supply (UPS)', docNo: '', rev: 'A', status: 'Not Submitted', wf: '' },
  { id: 'itp-11', docName: 'Installation of Voice Recording System (VRS)', docNo: '', rev: 'A', status: 'Not Submitted', wf: '' },
  { id: 'itp-12', docName: 'Test Procedures Inspection and Test Plan (ITP)Cable Pulling & Fiber Splicing', docNo: 'HSR-SOA-TPR-TEL-GL-1400001', rev: 'B', status: 'Approved with Comments', wf: 'WF-017289' },
];

// 16. Technical Rooms (Matches Excel screenshot for New Capital + other stations)
export const generateTechnicalRoomsData = (): HSRRow[] => {
  const newCapitalRooms: HSRRow[] = [
    {
      id: 'tr-nc-1',
      station: 'New Capital',
      roomName: 'BAT-TEL',
      statusHoneywell: 'Not Submitted',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: '',
      officialAconexReview: '',
      statusSystra: '',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-2',
      station: 'New Capital',
      roomName: 'IT-S BS 206',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020010',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-3',
      station: 'New Capital',
      roomName: 'IT-S BS 303',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020010',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-4',
      station: 'New Capital',
      roomName: 'IT-S BS 115',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020010',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-5',
      station: 'New Capital',
      roomName: 'IT-S BS 010',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020010',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-6',
      station: 'New Capital',
      roomName: 'IT-S GR 153',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020010',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-7',
      station: 'New Capital',
      roomName: 'IT-S GR 208',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-021231',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-8',
      station: 'New Capital',
      roomName: 'TEL-S GR 137',
      statusHoneywell: 'under HNWL update',
      plannedSubmissionDate: '6-Aug-2026',
      cjvRemarks: 'waiting HNWL to cover RCS comments and share the updated drawing',
      smoStatus: '',
      wfNo: '',
      officialAconexReview: '',
      statusSystra: '',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-9',
      station: 'New Capital',
      roomName: 'IT-S MZ 123',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020010',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-10',
      station: 'New Capital',
      roomName: 'IT-S MZ 023',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020010',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-11',
      station: 'New Capital',
      roomName: 'IT-S MZ 313',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020010',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-12',
      station: 'New Capital',
      roomName: 'IT-S MZ 209',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020010',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-13',
      station: 'New Capital',
      roomName: 'IT-S FR 018',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020011',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-14',
      station: 'New Capital',
      roomName: 'IT-S FR 147',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020011',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-15',
      station: 'New Capital',
      roomName: 'IT-S FR 333',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020011',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-16',
      station: 'New Capital',
      roomName: 'IT-S FR 205',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: '',
      wfNo: 'WF-020011',
      officialAconexReview: '',
      statusSystra: 'Approved with comments',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-17',
      station: 'New Capital',
      roomName: 'SOAC Cable Room BS-316',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: 'Under SMO Review',
      wfNo: 'WF-020012',
      officialAconexReview: '31/1/2026',
      statusSystra: '',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-18',
      station: 'New Capital',
      roomName: 'SOAC Cable Room BS-226',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: 'Under SMO Review',
      wfNo: 'WF-020012',
      officialAconexReview: '31/1/2026',
      statusSystra: '',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-19',
      station: 'New Capital',
      roomName: 'SOAC Cable Room BS-110',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: 'Under SMO Review',
      wfNo: 'WF-020012',
      officialAconexReview: '31/1/2026',
      statusSystra: '',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-20',
      station: 'New Capital',
      roomName: 'SOAC Cable Room BS-010',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: 'Under SMO Review',
      wfNo: 'WF-020012',
      officialAconexReview: '31/1/2026',
      statusSystra: '',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-21',
      station: 'New Capital',
      roomName: 'SOAC Cable Room GR-152',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: 'Under SMO Review',
      wfNo: 'WF-020012',
      officialAconexReview: '31/1/2026',
      statusSystra: '',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-22',
      station: 'New Capital',
      roomName: 'SOAC Cable Room GR-030',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: 'Under SMO Review',
      wfNo: 'WF-020012',
      officialAconexReview: '31/1/2026',
      statusSystra: '',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-23',
      station: 'New Capital',
      roomName: 'SOAC Cable Room GR-210',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: 'Under SMO Review',
      wfNo: 'WF-020012',
      officialAconexReview: '31/1/2026',
      statusSystra: '',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
    {
      id: 'tr-nc-24',
      station: 'New Capital',
      roomName: 'SOAC Cable Room GR-347',
      statusHoneywell: '',
      plannedSubmissionDate: '',
      cjvRemarks: '',
      smoStatus: 'Under SMO Review',
      wfNo: 'WF-020012',
      officialAconexReview: '31/1/2026',
      statusSystra: '',
      officialAconexRelease: '',
      dateSystraResponse: '',
    },
  ];

  const rows: HSRRow[] = [...newCapitalRooms];
  const standardRooms = ['CER (Telecom Equipment Room)', 'TER (Technical Equipment Room)', 'SER (Signaling Equipment Room)', 'Battery Room'];
  let counter = 25;

  // Add remaining stations
  HSR_STATIONS.filter((s) => s !== 'New Capital').forEach((station) => {
    standardRooms.forEach((room) => {
      rows.push({
        id: `tr-room-${counter}`,
        station,
        roomName: room,
        statusHoneywell: counter % 2 === 0 ? 'Approved from CJV' : 'Under HNWL update due to CJV comments',
        plannedSubmissionDate: '2026-08-15',
        cjvRemarks: '',
        smoStatus: counter % 3 === 0 ? 'Under SMO Review' : '',
        wfNo: `WF-${(20000 + counter).toString()}`,
        officialAconexReview: '2026-08-20',
        statusSystra: counter % 2 === 0 ? 'Approved with comments' : 'Under Systra Review',
        officialAconexRelease: '',
        dateSystraResponse: '',
      });
      counter++;
    });
  });

  return rows;
};

// 17. MOS (From MOS.png, 14 Systems)
export const INITIAL_MOS_DATA: HSRRow[] = [
  { id: 'mos-1', systems: 'MCS', docNo: 'HSR-SOA-MET-TELMCS-GL-1400001[C]', wfNo: 'WF-017693', status: 'Code 2 Approved', date: '12/1/2025' },
  { id: 'mos-2', systems: 'MSN-ACTIVE', docNo: 'HSR-SOA-MET-TELMSN-GL-1400002[A]', wfNo: 'WF-021727', status: 'code 3 Rejected', date: '6/22/2026' },
  { id: 'mos-3', systems: 'MSN-PASSIVE', docNo: 'HSR-SOA-MET-TELMSN-GL-1400001[A]', wfNo: '23166', status: 'Under Systra Review', date: '' },
  { id: 'mos-4', systems: 'ACS', docNo: 'HSR-SOA-MET-TELACS-GL-1400001[B]', wfNo: 'WF-020868', status: 'Code 2 Approved', date: '7/7/2026' },
  { id: 'mos-5', systems: 'PAS', docNo: 'HSR-SOA-MET-TELPAS-GL-1400001[B]', wfNo: 'WF-017777', status: 'Code 2 Approved', date: '12/1/2025' },
  { id: 'mos-6', systems: 'OATS', docNo: '', wfNo: '', status: 'Did not received any documents from HNWL', date: '' },
  { id: 'mos-7', systems: 'VRS', docNo: '', wfNo: '', status: 'Did not received any documents from HNWL', date: '' },
  { id: 'mos-8', systems: 'PIS', docNo: 'HSR-SOA-MET-TELPIS-GL-1400001[A]', wfNo: 'WF-018090', status: 'code 3 Rejected', date: '22/12/2025' },
  { id: 'mos-9', systems: 'CCTV', docNo: 'HSR-SOA-MET-TELCCTV-GL-1400001[B]', wfNo: 'WF-020262', status: 'Code 2 Approved', date: '15/6/2026' },
  { id: 'mos-10', systems: 'WIFI', docNo: 'HSR-SOA-MET-TELWIFI-GL-1400001[B]', wfNo: 'WF-017608', status: 'Code 2 Approved', date: '14/12/2025' },
  { id: 'mos-11', systems: 'UPS', docNo: '', wfNo: '', status: 'Did not received any documents from HNWL', date: '' },
  { id: 'mos-12', systems: 'Cybersecurity', docNo: '', wfNo: '', status: 'Did not received any documents from HNWL', date: '' },
  { id: 'mos-13', systems: 'Cable Pulling And Fiber Splicing indoor', docNo: 'HSR-SOA-MET-TEL-GL-1400001[C]', wfNo: 'WF-020724', status: 'Code 2 Approved', date: '26/4/2026' },
  { id: 'mos-14', systems: 'IDS', docNo: '', wfNo: '', status: 'Did not received any documents from HNWL', date: '' },
];

// 18. FAT (From FAT.png, 15 Systems)
export const INITIAL_FAT_DATA: HSRRow[] = [
  { id: 'fat-1', systemCode: 'MCS', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELMCS-GL-1300001', rev: 'A', officiallyAconexDate: '18/2/2025', receivedFromSystra: '9/5/2025', docStatus: 'Approved with comments' },
  { id: 'fat-2', systemCode: 'MSN (Active)', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELMSN-GL-1300003', rev: 'B', officiallyAconexDate: '12/8/2025', receivedFromSystra: '19/8/2025', docStatus: 'Approved with comments' },
  { id: 'fat-3', systemCode: 'MSN (Passive)', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELMSN-GL-1300001', rev: 'A', officiallyAconexDate: '21/8/2025', receivedFromSystra: '15/10/2025', docStatus: 'Approved with comments' },
  { id: 'fat-4', systemCode: 'ACS', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELACS-GL-1300001', rev: 'A', officiallyAconexDate: '26/7/2026', receivedFromSystra: '18/8/2025', docStatus: 'Approved with comments' },
  { id: 'fat-5', systemCode: 'PAS', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELPAS-GL-1300001', rev: 'B', officiallyAconexDate: '26/7/2026', receivedFromSystra: '19/8/2025', docStatus: 'Approved with comments' },
  { id: 'fat-6', systemCode: 'PIS', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELPIS-GL-1300001', rev: 'B', officiallyAconexDate: '', receivedFromSystra: '', docStatus: 'Under Systra Review' },
  { id: 'fat-7', systemCode: 'OATS', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELOATS-GL-1300001', rev: 'A', officiallyAconexDate: '15/10/2025', receivedFromSystra: '3/11/2025', docStatus: 'Approved with comments' },
  { id: 'fat-8', systemCode: 'VRS', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELVRS-GL-1300001', rev: 'C', officiallyAconexDate: '22/10/2025', receivedFromSystra: '24/10/2025', docStatus: 'Approved with comments' },
  { id: 'fat-9', systemCode: 'WIFI', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELWIFI-GL-1300001', rev: 'C', officiallyAconexDate: '26/7/2026', receivedFromSystra: '19/8/2025', docStatus: 'Approved with comments' },
  { id: 'fat-10', systemCode: 'FO', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TEL-GL-1300001', rev: 'B', officiallyAconexDate: '19/11/2025', receivedFromSystra: '4/12/2025', docStatus: 'Approved with comments' },
  { id: 'fat-11', systemCode: 'CCTV', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELCCTV-GL-1300001', rev: '', officiallyAconexDate: '', receivedFromSystra: '', docStatus: 'Under HNWL update' },
  { id: 'fat-12', systemCode: 'Cybersecurity', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELMSN-GL-1300005', rev: '', officiallyAconexDate: '', receivedFromSystra: '', docStatus: 'Not sumitted yet' },
  { id: 'fat-13', systemCode: 'IDS', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELACS-GL-1300003', rev: '', officiallyAconexDate: '', receivedFromSystra: '', docStatus: 'Not sumitted yet' },
  { id: 'fat-14', systemCode: 'UPS', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELUPS-GL-1300001', rev: '', officiallyAconexDate: '', receivedFromSystra: '', docStatus: 'Not sumitted yet' },
  { id: 'fat-15', systemCode: 'Power Cables', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TEL-GL-1300002', rev: 'A', officiallyAconexDate: '', receivedFromSystra: '', docStatus: 'Under Systra Review' },
  { id: 'fat-16', systemCode: 'FAT Procedures - Multi Service Network - Passive Components - Indoor Racks', submissionTitle: 'FAT procedure', docNo: 'HSR-SOA-TPR-TELMSN-GL-1300004', rev: 'A', officiallyAconexDate: '', receivedFromSystra: '', docStatus: 'Submitted under CJV Review' },
];

// 19. LLD (From LLD.png)
export const INITIAL_LLD_DATA: HSRRow[] = [
  { id: 'lld-1', systemCode: 'PAS', submissionTitle: 'Public Address System – System Configuration File', docNo: 'HSR-SOA-DES-TELPAS-GL-1200008', rev: 'Draft', statusHoneywell: 'Approved from CJV', statusDateHnwl: '28-Jun', docWfStatus: 'The Draft sent to SMO by mail', wfNo: '', date: '28-Jun', statusSystra: 'Approved with Comments', statusDateSys: '15-Jul' },
  { id: 'lld-2', systemCode: 'MSN', submissionTitle: 'IP Addressing Plan', docNo: 'HSR-SOA-DES-TELMSN-GL-1200021', rev: 'A', statusHoneywell: 'Approved from CJV', statusDateHnwl: '28-Jun', docWfStatus: 'Under SMO Review', wfNo: 'WF-023593', date: '29-Jun', statusSystra: 'Under Systra Review', statusDateSys: '' },
  { id: 'lld-3', systemCode: 'CCTV', submissionTitle: 'CCTV Camera IP & Streaming Multicast Addressing Plan', docNo: 'HSR-SOA-DES-TELCCTV-GL-1200015', rev: 'A', statusHoneywell: 'Approved from CJV', statusDateHnwl: '15-Jul', docWfStatus: 'Released to Systra', wfNo: 'WF-023610', date: '16-Jul', statusSystra: 'Approved with Comments', statusDateSys: '28-Jul' },
  { id: 'lld-4', systemCode: 'ACS', submissionTitle: 'Access Control Controller Subnet Architecture & VLAN Table', docNo: 'HSR-SOA-DES-TELACS-GL-1200009', rev: 'B', statusHoneywell: 'Approved from CJV', statusDateHnwl: '20-Jul', docWfStatus: 'Released to Systra', wfNo: 'WF-023755', date: '22-Jul', statusSystra: 'Approved with Comments', statusDateSys: '05-Aug' },
  { id: 'lld-5', systemCode: 'MCS', submissionTitle: 'NTP Server Hierarchy and Grandmaster Clock Synchronization Plan', docNo: 'HSR-SOA-DES-TELMCS-GL-1200003', rev: 'A', statusHoneywell: 'Approved from CJV', statusDateHnwl: '25-Jul', docWfStatus: 'Released to Systra', wfNo: 'WF-023801', date: '26-Jul', statusSystra: 'Approved with Comments', statusDateSys: '09-Aug' },
  { id: 'lld-6', systemCode: 'WIFI', submissionTitle: 'WLAN Controller SSID, 802.1X & Captive Portal Configuration', docNo: 'HSR-SOA-DES-TELWIFI-GL-1200005', rev: 'A', statusHoneywell: 'Under HNWL update due to SYS comments', statusDateHnwl: '30-Jul', docWfStatus: 'Returned from SMO', wfNo: 'WF-023912', date: '02-Aug', statusSystra: 'Under Systra Review', statusDateSys: '' },
];

export const INITIAL_CONCLUSION_ROWS = INITIAL_CONCLUSION_DATA;

export const INITIAL_ICT_STATIONS_DATA: HSRRow[] = generateIctStationsData();
export const INITIAL_ICT_DEPOT_DATA: HSRRow[] = generateIctDepotData();
export const INITIAL_ICT_SP_DATA: HSRRow[] = generateIctSpData();
export const INITIAL_ELV_STATIONS_DATA: HSRRow[] = generateElvStationsData();
export const INITIAL_ELV_DEPOT_DATA: HSRRow[] = generateElvDepotData();
export const INITIAL_ELV_SP_DATA: HSRRow[] = generateElvSpData();
export const INITIAL_TPS_DATA: HSRRow[] = generateTpsData();
export const INITIAL_TECHNICAL_ROOMS_DATA: HSRRow[] = generateTechnicalRoomsData();

export const INITIAL_ICT_WAYSIDE_DATA: HSRRow[] = [];
export const INITIAL_ELV_WAYSIDE_DATA: HSRRow[] = [];

export const INITIAL_SHEETS_DATA: Record<string, HSRRow[]> = {
  reference: INITIAL_REFERENCE_DATA,
  ict_stations: INITIAL_ICT_STATIONS_DATA,
  ict_depot: INITIAL_ICT_DEPOT_DATA,
  ict_sp: INITIAL_ICT_SP_DATA,
  ict_wayside: INITIAL_ICT_WAYSIDE_DATA,
  elv_stations: INITIAL_ELV_STATIONS_DATA,
  elv_depot: INITIAL_ELV_DEPOT_DATA,
  elv_sp: INITIAL_ELV_SP_DATA,
  elv_wayside: INITIAL_ELV_WAYSIDE_DATA,
  installation_details: INITIAL_INSTALLATION_DETAILS_DATA,
  provision_drawings: INITIAL_PROVISION_DRAWINGS_DATA,
  sds: INITIAL_SDS_DATA,
  tps: INITIAL_TPS_DATA,
  tss3: INITIAL_TSS3_DATA,
  rcp: INITIAL_RCP_DATA,
  itp: INITIAL_ITP_DATA,
  technical_rooms: INITIAL_TECHNICAL_ROOMS_DATA,
  mos: INITIAL_MOS_DATA,
  fat: INITIAL_FAT_DATA,
  lld: INITIAL_LLD_DATA,
};

