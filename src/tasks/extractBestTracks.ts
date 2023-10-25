import { readFileSync, writeFileSync } from 'fs'
import { PlaylistItem } from '../youtubeApi'
import { PLAYLISTS_JSON_DIR, PLAYLIST_ITEMS_JSON_PATH } from '../constants'

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
  if (item.status.privacyStatus === 'private') {
    return []
  }

  const trackList: string[] = []
  const lines = item.snippet.description.split('\n\n')
  let foundBestSection = false
  for (const line of lines) {
    const lt = line.trim()
    if (lt.startsWith('!!!BEST TRACK') || lt.startsWith('!!!BEST SONG')) {
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
    console.error('failed to extract bestTrackList for', item.snippet.title, {
      foundBestSection,
    })
  }

  return trackList
}

// not working properly, inconsistent description format
export const extractTrackList_v1 = (item: PlaylistItem) => {
  if (item.status.privacyStatus === 'private') {
    return null
  }

  const sections = item.snippet.description.replace(/\r/, '').split('\n\n\n')

  const bestTracksSection = sections.find((s) => s.trim().startsWith('!!!BEST'))
  if (!bestTracksSection) {
    console.error('unable to find bestTracksSection for', item.snippet.title)
    return null
  }

  const trackList = bestTracksSection
    .split('\n\n')
    // each track is `${artist} - ${trackName}\n${linkToTrack}`
    .map((track) => track.split('\n')[0])

  return trackList
}
