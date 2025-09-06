import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { Application, ApiResponse, ApplicationStatus } from '@/lib/types';
import { DEMO_APPLICATIONS } from '@/lib/demo-data';

// Cache for Google Auth to avoid recreating on every request
let cachedAuth: any = null;

// Valid status values for validation
const VALID_STATUSES: ApplicationStatus[] = [
  'Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected', 'Ghosted'
];

// Date validation helper
const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

// Status validation helper
const isValidStatus = (status: string): status is ApplicationStatus => {
  return VALID_STATUSES.includes(status as ApplicationStatus);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ applications: [], error: 'Method not allowed' });
  }

  try {
    // Demo mode: If no environment variables are set, return demo data
    const spreadsheetId = process.env.SPREADSHEET_ID?.trim();
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      console.log('No Google Sheets credentials found, using demo data');
      return res.status(200).json({ 
        applications: DEMO_APPLICATIONS
      });
    }

    // Validate spreadsheet ID format
    if (!/^[a-zA-Z0-9-_]{44}$/.test(spreadsheetId)) {
      console.error('Invalid spreadsheet ID format');
      return res.status(500).json({ 
        applications: [], 
        error: 'Invalid server configuration' 
      });
    }

    // Authenticate with Google Sheets API (with caching)
    if (!cachedAuth) {
      cachedAuth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccountEmail,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    }

    const sheets = google.sheets({ version: 'v4', auth: cachedAuth });

    // Fetch data from the sheet with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:G', // Skip header row, get all 7 columns (A-G)
    });

    clearTimeout(timeoutId);

    const rows = response.data.values || [];

    // Transform and validate raw data into Application objects
    const applications: Application[] = rows
      .map((row: any[], index: number) => {
        // Basic data extraction
        const company = (row[0] || '').toString().trim();
        const position = (row[1] || '').toString().trim();
        const dateApplied = (row[2] || '').toString().trim();
        const status = (row[3] || 'Applied').toString().trim();
        const lastUpdate = (row[4] || row[2] || '').toString().trim(); // Default to dateApplied if no lastUpdate
        const notes = (row[5] || '').toString().trim();
        const highlight = row[6] === 'TRUE' || row[6] === true || row[6] === 'true' || row[6] === 'WAHR';

        // Validate required fields
        if (!company || !position || !dateApplied) {
          console.warn(`Row ${index + 2}: Missing required fields`);
          return null;
        }

        // Validate dates
        if (!isValidDate(dateApplied)) {
          console.warn(`Row ${index + 2}: Invalid dateApplied format: ${dateApplied}`);
          return null;
        }

        if (lastUpdate && !isValidDate(lastUpdate)) {
          console.warn(`Row ${index + 2}: Invalid lastUpdate format: ${lastUpdate}`);
          return null;
        }

        // Validate and normalize status
        const normalizedStatus = isValidStatus(status) ? status : 'Applied';
        if (status !== normalizedStatus) {
          console.warn(`Row ${index + 2}: Invalid status '${status}', defaulting to 'Applied'`);
        }

        return {
          company,
          position,
          dateApplied,
          status: normalizedStatus,
          lastUpdate: lastUpdate || dateApplied,
          notes: notes.length > 500 ? notes.substring(0, 500) + '...' : notes, // Limit notes length
          highlight,
        };
      })
      .filter((app): app is Application => app !== null);

    // Additional validation: ensure dates are not in the future
    const now = new Date();
    const validApplications = applications.filter(app => {
      const appDate = new Date(app.dateApplied);
      if (appDate > now) {
        console.warn(`Application to ${app.company} has future date: ${app.dateApplied}`);
        return false;
      }
      return true;
    });

    // Sort by dateApplied descending (most recent first)
    validApplications.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());

    console.log(`Successfully fetched ${validApplications.length} applications`);
    
    // Add cache headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json({ applications: validApplications });

  } catch (error) {
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error fetching applications:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Provide more specific error messages based on error type
      if (error.message.includes('permission') || error.message.includes('access')) {
        return res.status(500).json({ 
          applications: [], 
          error: 'Permission denied accessing spreadsheet' 
        });
      }
      
      if (error.message.includes('not found') || error.message.includes('404')) {
        return res.status(500).json({ 
          applications: [], 
          error: 'Spreadsheet not found' 
        });
      }
      
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        return res.status(500).json({ 
          applications: [], 
          error: 'Request timeout - please try again' 
        });
      }
    } else {
      console.error('Unknown error:', error);
    }

    return res.status(500).json({ 
      applications: [], 
      error: 'Failed to fetch applications' 
    });
  }
}