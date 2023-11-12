import { google, sheets_v4 } from 'googleapis'

// https://github.com/JosephJvB/gsheets-api/blob/main/src/database/sheetClient.ts

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

let _client: sheets_v4.Sheets | undefined

export const getClient = () => {
  if (!_client) {
    // https://stackoverflow.com/questions/30400341/environment-variables-containing-newlines-in-node
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    const authClient = new google.auth.GoogleAuth({
      scopes: SCOPES,
      credentials: {
        private_key: privateKey,
        client_email: process.env.GOOGLE_ACCOUNT_client_email,
      },
    })
    _client = google.sheets({
      version: 'v4',
      auth: authClient,
    })
  }
  return _client
}

export const createSheet = async (sheetName: string) => {
  await getClient().spreadsheets.batchUpdate({
    spreadsheetId: process.env.SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    },
  })
}

export const getRows = async (sheetName: string, range: string) => {
  const res = await getClient().spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetName}!${range}`,
  })
  return res.data.values || []
}

export const addRow = async (
  sheetName: string,
  range: string,
  row: string[]
) => {
  await getClient().spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetName}!${range}`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    includeValuesInResponse: true,
    requestBody: {
      majorDimension: 'ROWS',
      values: [row],
    },
  })
}

export const addRows = async (
  sheetName: string,
  range: string,
  rows: string[][]
) => {
  await getClient().spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetName}!${range}`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    includeValuesInResponse: true,
    requestBody: {
      majorDimension: 'ROWS',
      values: rows,
    },
  })
}
