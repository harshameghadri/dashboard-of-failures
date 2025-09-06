// Date string in YYYY-MM-DD format
export type DateString = string;

// Application status types
export type ApplicationStatus = 
  | 'Applied' 
  | 'Screening' 
  | 'Interviewing' 
  | 'Offer' 
  | 'Rejected' 
  | 'Ghosted';

export interface Application {
  company: string;
  position: string;
  dateApplied: DateString; // YYYY-MM-DD format
  status: ApplicationStatus;
  lastUpdate: DateString; // YYYY-MM-DD format
  notes: string;
  highlight: boolean;
}

export interface DashboardStats {
  totalApplications: number;
  totalRejections: number;
  ghostedCount: number;
  successRate: number; // Percentage as decimal (0-100)
}

export interface StatusCount {
  status: ApplicationStatus;
  count: number;
  fill: string; // Hex color code
}

export interface ApiResponse {
  applications: Application[];
  error?: string;
  debug?: string;
  debugDetails?: {
    hasSpreadsheetId: boolean;
    hasServiceAccountEmail: boolean;
    hasPrivateKey: boolean;
    spreadsheetIdValue: string;
    serviceAccountEmailValue: string;
  };
}

// Badge variants for UI components
export type BadgeVariant = 
  | 'default' 
  | 'secondary' 
  | 'destructive' 
  | 'outline' 
  | 'success' 
  | 'warning' 
  | 'info';

// Component prop types
export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

export interface HighlightCardProps {
  application: Application;
}

export interface StatusPieChartProps {
  data: StatusCount[];
}

export interface ApplicationTableProps {
  applications: Application[];
}

// Error types for better error handling
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}