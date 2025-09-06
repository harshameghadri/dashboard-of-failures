import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasSpreadsheetId: !!process.env.SPREADSHEET_ID,
    hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    spreadsheetId: process.env.SPREADSHEET_ID || 'NOT SET',
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'NOT SET',
    privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
    privateKeyStart: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 50) || 'NOT SET',
    privateKeyEnd: process.env.GOOGLE_PRIVATE_KEY?.substring(-50) || 'NOT SET',
  };

  return res.status(200).json(debug);
}