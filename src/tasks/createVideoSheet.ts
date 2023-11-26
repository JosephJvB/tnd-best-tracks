import { readFileSync, writeFileSync } from 'fs'
import {
  PARSED_YOUTUBE_VIDEOS_JSON_PATH,
  TND_PLAYLIST_ITEMS_JSON_PATH,
} from '../constants'
import { PlaylistItem } from '../youtubeApi'
import { extractTrackList_v2 } from './extractYoutubeTracks'
import { test__setSheetId, upsertRows } from '../sheetsApi'

export const SHEETS = {
  MISSING_TRACKS: {
    NAME: 'Missing Tracks',
    ID: 1814426117,
    RANGES: {
      ALL_ROWS: 'A2:F',
    },
  },
  PARSED_VIDEOS: {
    ID: 123, // not so relevant. only need the link to the missing tracks shet
    NAME: 'Youtube Videos',
    RANGES: {
      HEADERS_TOO: 'A1:D',
      ALL_ROWS: 'A2:D',
    },
  },
} as const

export type ParsedVideo = {
  id: string
  title: string
  published_at: string
  total_tracks: string
}

export const videoToRow = (video: ParsedVideo): string[] => [
  video.id,
  video.title,
  video.published_at,
  video.total_tracks,
]

export default async function () {
  // process.env.JEST_WORKER_ID = '1'
  // const SHEET_ID = '17-Vx_oswIG_Rw7S28xfE5TWx2HTJeE2r25zP4CAR5Ko'
  // test__setSheetId(SHEET_ID)

  const allItems: PlaylistItem[] = JSON.parse(
    readFileSync(TND_PLAYLIST_ITEMS_JSON_PATH, 'utf-8')
  )

  const parsedVideos: ParsedVideo[] = allItems.map((i) => ({
    id: i.id,
    title: i.snippet.title,
    published_at: i.snippet.publishedAt,
    total_tracks: extractTrackList_v2(i).length.toString(),
  }))

  writeFileSync(
    PARSED_YOUTUBE_VIDEOS_JSON_PATH,
    JSON.stringify(parsedVideos, null, 2)
  )

  await upsertRows(
    SHEETS.PARSED_VIDEOS.NAME,
    SHEETS.PARSED_VIDEOS.RANGES.HEADERS_TOO,
    [
      ['id', 'title', 'published_at', 'total_tracks'],
      ...parsedVideos.map((v) => videoToRow(v)),
    ]
  )
}
