import { readFileSync, writeFileSync } from 'fs'
import { PlaylistItem } from '../youtubeApi'
import { TRACKLISTS_JSON_DIR, PLAYLIST_ITEMS_JSON_PATH } from '../constants'

// TODO: refactor - don't just push logic down

const BEST_TRACK_PREFIXES = [
  '!!!BEST TRACK',
  '!!BEST TRACK',
  '!!!BEST SONG',
  '!!!FAV TRACK',
]
const RAW_REVIEW_TITLES = ['MIXTAPE', 'EP', 'ALBUM', 'TRACK', 'COMPILATION']
const OLD_TITLE_PREFIXES = ['FAV TRACKS:', 'FAV & WORST TRACKS:']

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
    const nextBatch = extractTrackList_v2(item)
    if (nextBatch.length) {
      const year = item.snippet.publishedAt.split('-')[0]
      const yearsTracks = acc.get(year) ?? []
      acc.set(year, [...yearsTracks, ...nextBatch])
    }

    return acc
  }, new Map<string, string[]>())

  bestTracksByYear.forEach((trackList, year) => {
    console.log(' > write', trackList.length, 'tracks for', year)
    writeFileSync(
      `${TRACKLISTS_JSON_DIR}/${year}.json`,
      JSON.stringify(trackList, null, 2)
    )
  })
}
export const extractTrackList_v2 = (item: PlaylistItem) => {
  const trackList: string[] = []
  // early return cases
  if (item.snippet.channelId !== item.snippet.videoOwnerChannelId) {
    return trackList
  }
  if (item.status.privacyStatus === 'private') {
    return trackList
  }
  // playlist is "Weekly Track Roundup / Raw Reviews"
  // skip raw reviews
  const reviewTitle = RAW_REVIEW_TITLES.find((rt) =>
    item.snippet.title.includes(`${rt} REVIEW`)
  )
  if (!!reviewTitle) {
    return trackList
  }

  const lines = descriptionToLines(item.snippet.description)

  let foundBestSection = false
  for (const line of lines) {
    const bestTrackPrefix = BEST_TRACK_PREFIXES.find((pref) =>
      line.startsWith(pref)
    )
    if (!!bestTrackPrefix) {
      foundBestSection = true
      continue
    }
    if (!foundBestSection) {
      continue
    }

    const bestTrack = getBestTrackStr(line)
    if (!bestTrack) {
      // console.log('exit', line)
      break // assume best tracks section has ended
    }

    trackList.push(bestTrack)
  }

  if (trackList.length === 0) {
    trackList.push(...extractTrackList_fallback(item, lines))
  }

  if (trackList.length === 0) {
    console.error('failed to extract bestTrackList for', item.snippet.title, {
      foundBestSection,
    })
  }

  return trackList
}

export const extractTrackList_fallback = (
  item: PlaylistItem,
  lines: string[]
) => {
  const trackList: string[] = []
  const oldPrefix = OLD_TITLE_PREFIXES.find((p) =>
    item.snippet.title.startsWith(p)
  )
  // only handle old videos
  if (!oldPrefix) {
    return trackList
  }

  lines.forEach((line) => {
    if (line.toLowerCase().startsWith('amazon link')) {
      return
    }

    const bestTrack = getBestTrackStr(line)
    if (bestTrack) {
      trackList.push(bestTrack)
    }
  })

  return trackList
}

export const getBestTrackStr = (line: string) => {
  const lineSplit = line.split('\n').map((s) => s.trim())

  if (![2, 3, 4].includes(lineSplit.length)) {
    return null
  }

  const [bestTrack, trackLink] = lineSplit

  if (!bestTrack.includes(' - ')) {
    return null
  }

  if (!trackLink.startsWith('http')) {
    return null
  }

  return bestTrack
}

export const descriptionToLines = (description: string) => {
  return description
    .replace(/–/g, '-')
    .replace('Brain Tentacles -"The Sadist"', 'Brain Tentacles - "The Sadist"')
    .replace('SORRY NOT SORRY\nDogtooth: https', 'SORRY NOT SORRY\nhttps')
    .replace('Model/Actriz- Damocles', 'Model/Actriz - Damocles')
    .replace(
      `Bonnie Prince Billy \"I've Made Up My Mind`,
      `Bonnie Prince Billy - \"I've Made Up My Mind`
    )
    .split('\n\n')
    .map((l) => l.trim())
}
