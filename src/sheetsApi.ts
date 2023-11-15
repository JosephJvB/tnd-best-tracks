import { google, sheets_v4 } from 'googleapis'
import { PrePlaylistItem } from './tasks/getSpotifyTracks'

// https://github.com/JosephJvB/gsheets-api/blob/main/src/database/sheetClient.ts

export const BASE_SHEET_URL = 'https://docs.google.com/spreadsheets/d'
export let SPREADSHEET_ID = '1F5DXCTNZbDy6mFE3Sp1prvU2SfpoqK0dZRsXVHiiOfo'
export const test__setSheetId = (id: string) => {
  if (!process.env.JEST_WORKER_ID) {
    throw new Error('get te fuk u junkie')
  }
  SPREADSHEET_ID = id
}
export const SHEET_NAME = 'MELON'
export const SHEET_ID = 1814426117
export const SPREADSHEET_LINK = `${BASE_SHEET_URL}/${SPREADSHEET_ID}/edit#gid=${SHEET_ID}?usp=sharing`
export const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
export const HEADERS = [
  'id',
  'name',
  'artist',
  'date',
  'link',
  'spotify_id',
] as const
export const ALL_DATA_RANGE = 'A2:F'
export const ADD_ROWS_RANGE = 'A:F'

export type Spreadsheet = Awaited<ReturnType<typeof getSpreadsheet>>
export type SheetTrack = {
  id: string
  name: string
  artist: string
  date: string
  link: string
  spotify_id: string
}
export const rowToTrack = (row: string[]): SheetTrack => ({
  id: row[0],
  name: row[1],
  artist: row[2],
  date: row[3],
  link: row[4],
  spotify_id: row[5] ?? '',
})
export const trackToRow = (track: SheetTrack): string[] => [
  track.id,
  track.name,
  track.artist,
  track.date,
  track.link,
  track.spotify_id ?? '',
]
export const itemToRow = (item: PrePlaylistItem) => [
  item.id,
  item.youtubeTrack.name,
  item.youtubeTrack.artist,
  item.youtubeTrack.videoPublishedDate,
  item.youtubeTrack.link,
  item.spotifyId ?? '',
]
export const itemToTrack = (item: PrePlaylistItem): SheetTrack => ({
  id: item.id,
  name: item.youtubeTrack.name,
  artist: item.youtubeTrack.artist,
  date: item.youtubeTrack.videoPublishedDate,
  link: item.youtubeTrack.link,
  spotify_id: item.spotifyId ?? '',
})

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
    spreadsheetId: SPREADSHEET_ID,
  })

  return res.data
}

export const createSheet = async (sheetName: string) => {
  const res = await getClient().spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
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
    spreadsheetId: SPREADSHEET_ID,
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
    spreadsheetId: SPREADSHEET_ID,
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
    spreadsheetId: SPREADSHEET_ID,
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

export const upsertRows = async (
  sheetName: string,
  range: string,
  rows: string[][]
) => {
  await getClient().spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!${range}`,
    valueInputOption: 'RAW',
    includeValuesInResponse: true,
    requestBody: {
      majorDimension: 'ROWS',
      values: rows,
    },
  })
}
