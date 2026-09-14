export interface HSRRow {
  id: string;
  [key: string]: any;
}

export type SheetId =
  | 'conclusion'
  | 'reference'
  | 'ict_stations'
  | 'ict_depot'
  | 'ict_sp'
  | 'elv_stations'
  | 'elv_depot'
  | 'elv_sp'
  | 'installation_details'
  | 'provision_drawings'
  | 'sds'
  | 'tps'
  | 'tss3'
  | 'rcp'
  | 'itp'
  | 'technical_rooms'
  | 'mos'
  | 'fat'
  | 'lld'
  | 'python_code';

export interface ColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'number';
  options?: string[];
  width?: string;
}

export interface SheetDefinition {
  id: SheetId;
  name: string;
  category: 'Overview' | 'Detailed Design (DD)' | 'Engineering Packages' | 'Tests & Specs' | 'System & Code';
  columns: ColumnDef[];
  description: string;
}

export interface ConclusionRow {
  transmittal: string;
  totalDocs: number;
  submittedHnwl: number;
  pctSubmittedHnwl: string;
  notSubmittedHnwl: number;
  pctNotSubmittedHnwl: string;
  underHnwlUpdate: number;
  underCjvReview: number;
  underSafetyReview: number;
  underSmoReview: number;
  underSystraReview: number;
  approvedWithComments: number;
  pctApprovedFromSys: string;
  rejected: number;
  pctRejectedFromSys: string;
}
