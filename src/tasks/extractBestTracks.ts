import { readFileSync, writeFileSync } from 'fs'
import { PlaylistItem } from '../youtubeApi'
import { PLAYLISTS_JSON_DIR, PLAYLIST_ITEMS_JSON_PATH } from '../constants'

// TODO: refactor - don't just push logic down

const BEST_TRACK_PREFIXES = [
  '!!!BEST TRACK',
  '!!BEST TRACK',
  '!!!BEST SONG',
  '!!!FAV TRACK',
]
const REVIEW_TITLES = ['MIXTAPE', 'EP', 'ALBUM', 'TRACK', 'COMPILATION']
const TRACK_DIVIDERS = [' - ', ' – ']

export default function () {
  const allItems: PlaylistItem[] = JSON.parse(
    readFileSync(PLAYLIST_ITEMS_JSON_PATH, 'utf-8')
  )

  allItems.sort(
    (a, z) =>
      new Date(a.snippet.publishedAt).getTime() -
      new Date(z.snippet.publishedAt).getTime()
  )

  console.log(
    'videos sorted oldest to newest:',
    allItems[0].snippet.publishedAt,
    '->',
    allItems[allItems.length - 1].snippet.publishedAt
  )

  const bestTracksByYear = allItems.reduce((acc, item) => {
    // cases to skip parsing tracks
    // dont like logic at this level, cos it's outside of my tests
    if (item.snippet.channelId !== item.snippet.videoOwnerChannelId) {
      return acc
    }
    if (item.status.privacyStatus === 'private') {
      return acc
    }
    const reviewTitle = REVIEW_TITLES.find((rt) =>
      item.snippet.title.includes(rt)
    )
    if (!!reviewTitle) {
      return acc
    }

    const year = item.snippet.publishedAt.split('-')[0]
    const yearsTracks = acc.get(year) ?? []

    const nextBatch = extractTrackList_v2(item)
    acc.set(year, [...yearsTracks, ...nextBatch])

    return acc
  }, new Map<string, string[]>())

  bestTracksByYear.forEach((trackList, year) => {
    console.log(' > write', trackList.length, 'tracks for', year)
    writeFileSync(
      `${PLAYLISTS_JSON_DIR}/${year}.json`,
      JSON.stringify(trackList, null, 2)
    )
  })
}
export const extractTrackList_v2 = (item: PlaylistItem) => {
  const trackList: string[] = []
  const lines = item.snippet.description.split('\n\n')
  let foundBestSection = false
  for (const line of lines) {
    const lt = line.trim()
    const bestTrackPrefix = BEST_TRACK_PREFIXES.find((pref) =>
      lt.startsWith(pref)
    )
    if (!!bestTrackPrefix) {
      foundBestSection = true
      continue
    }
    if (!foundBestSection) {
      continue
    }

    const s = lt.split('\n')
    if (s.length === 1) {
      break // at the end of best tracks
    }

    const trackName = s[0].trim()
    trackList.push(trackName)
  }

  if (trackList.length === 0) {
    trackList.push(...extractTrackList_fallback(item))
  }

  if (trackList.length === 0) {
    console.error('failed to extract bestTrackList for', item.snippet.title, {
      foundBestSection,
    })
  }

  return trackList
}

export const extractTrackList_fallback = (item: PlaylistItem) => {
  const trackList: string[] = []
  if (!item.snippet.title.startsWith('FAV & WORST TRACKS:')) {
    return trackList
  }

  item.snippet.description.split('\n\n').forEach((line) => {
    const lt = line.trim()
    if (lt.toLowerCase().startsWith('amazon link')) {
      return
    }

    const ls = lt.split('\n')
    const trackDivider = TRACK_DIVIDERS.find((td) => ls[0].includes(td))
    if (!!trackDivider && ls[1]?.startsWith('http')) {
      trackList.push(ls[0])
    }
  })

  return trackList
}
