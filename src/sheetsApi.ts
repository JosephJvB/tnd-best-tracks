import { google, sheets_v4 } from 'googleapis'

// https://github.com/JosephJvB/gsheets-api/blob/main/src/database/sheetClient.ts

export let SHEET_ID = '1F5DXCTNZbDy6mFE3Sp1prvU2SfpoqK0dZRsXVHiiOfo'
export const test__setSheetId = (id: string) => {
  if (!process.env.JEST_WORKER_ID) {
    throw new Error('get te fuk u junkie')
  }
  SHEET_ID = id
}
export const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

export const HEADERS = [
  'id',
  'name',
  'artist',
  'video_published_date',
  'link',
  'spotify_id',
] as const

let _client: sheets_v4.Sheets | undefined

export const getClient = () => {
  if (!_client) {
    // https://stackoverflow.com/questions/30400341/environment-variables-containing-newlines-in-node
    const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY.replace(/\\n/g, '\n')
    const authClient = new google.auth.GoogleAuth({
      scopes: SCOPES,
      credentials: {
        private_key: privateKey,
        client_email: process.env.GOOGLE_SA_CLIENT_EMAIL,
      },
    })
    _client = google.sheets({
      version: 'v4',
      auth: authClient,
    })
  }
  return _client
}

export const getSpreadsheet = async () => {
  return await getClient().spreadsheets.get({
    spreadsheetId: SHEET_ID,
  })
}

export const createSheet = async (sheetName: string) => {
  const res = await getClient().spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
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

  return res.data.replies?.[0].addSheet!
}

export const getRows = async (sheetName: string, range: string) => {
  const res = await getClient().spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
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
    spreadsheetId: SHEET_ID,
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
    spreadsheetId: SHEET_ID,
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
