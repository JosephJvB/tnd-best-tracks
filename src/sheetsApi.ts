import { google, sheets_v4 } from 'googleapis'

// https://github.com/JosephJvB/gsheets-api/blob/main/src/database/sheetClient.ts

export const BASE_SHEET_URL = 'https://docs.google.com/spreadsheets/d'
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
export const ALL_ROWS_RANGE = 'A1:F2000'
export const ADD_ROWS_RANGE = 'A:F'

export type Spreadsheet = Awaited<ReturnType<typeof getSpreadsheet>>
export type SheetTrack = {
  id: string
  name: string
  artist: string
  video_published_date: string
  link: string
  spotify_id?: string | null
}
export const rowToTrack = (row: string[]): SheetTrack => ({
  id: row[0],
  name: row[1],
  artist: row[2],
  video_published_date: row[3],
  link: row[4],
  spotify_id: row[5],
})
export const trackToRow = (track: SheetTrack): string[] => {
  const row = [
    track.id,
    track.name,
    track.artist,
    track.video_published_date,
    track.link,
  ]
  if (track.spotify_id) {
    row.push(track.spotify_id)
  }
  return row
}

// https://docs.google.com/spreadsheets/d/17-Vx_oswIG_Rw7S28xfE5TWx2HTJeE2r25zP4CAR5Ko/edit#gid=675094536
export const getSheetLink = (sheetId?: number | null) => {
  const sheetIdSegment = sheetId ? `#gid=${sheetId}` : ''
  return `${BASE_SHEET_URL}/${SHEET_ID}/edit${sheetIdSegment}?usp=sharing`
}

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
  const res = await getClient().spreadsheets.get({
    spreadsheetId: SHEET_ID,
  })

  return res.data
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

  return res.data.values ?? []
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
