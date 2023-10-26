import { readFileSync, writeFileSync } from 'fs'
import { PlaylistItem } from '../youtubeApi'
import {
  YOUTUBE_TRACKS_JSON_DIR,
  YOUTUBE_PLAYLIST_ITEMS_JSON_PATH,
} from '../constants'
import { MANUAL_CORRECTIONS } from '../manualCorrections'

// TODO: refactor - don't just push logic down

export type YoutubeTrack = {
  name: string
  artist: string
  link: string
}

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
    readFileSync(YOUTUBE_PLAYLIST_ITEMS_JSON_PATH, 'utf-8')
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

  const youtubeTracksByYear = allItems.reduce((acc, item) => {
    const nextBatch = extractTrackList_v2(item)
    if (nextBatch.length) {
      const year = item.snippet.publishedAt.split('-')[0]
      const yearsTracks = acc.get(year) ?? []
      acc.set(year, [...yearsTracks, ...nextBatch])
    }

    return acc
  }, new Map<string, YoutubeTrack[]>())

  youtubeTracksByYear.forEach((trackList, year) => {
    console.log(' > write', trackList.length, 'tracks for', year)
    writeFileSync(
      `${YOUTUBE_TRACKS_JSON_DIR}/${year}.json`,
      JSON.stringify(trackList, null, 2)
    )
  })
}
export const extractTrackList_v2 = (item: PlaylistItem) => {
  const trackList: YoutubeTrack[] = []
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
    const youtubeTrackPrefix = BEST_TRACK_PREFIXES.find((pref) =>
      line.startsWith(pref)
    )
    if (!!youtubeTrackPrefix) {
      foundBestSection = true
      continue
    }
    if (!foundBestSection) {
      continue
    }

    const youtubeTrack = getYoutubeTrack(line)
    if (!youtubeTrack) {
      // console.log('exit', JSON.stringify(line))
      break // assume best tracks section has ended
    }

    trackList.push(youtubeTrack)
  }

  if (trackList.length === 0) {
    trackList.push(...extractTrackList_fallback(item, lines))
  }

  if (trackList.length === 0) {
    console.error(
      'failed to extract youtubeTrackList for',
      item.snippet.title,
      {
        foundBestSection,
      }
    )
  }

  return trackList
}

export const extractTrackList_fallback = (
  item: PlaylistItem,
  lines: string[]
) => {
  const trackList: YoutubeTrack[] = []
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

    const youtubeTrack = getYoutubeTrack(line)
    if (youtubeTrack) {
      trackList.push(youtubeTrack)
    }
  })

  return trackList
}

export const getYoutubeTrack = (line: string) => {
  const lineSplit = line.split('\n').map((s) => s.trim())

  if (![2, 3, 4].includes(lineSplit.length)) {
    return null
  }

  const [youtubeTrack, link] = lineSplit

  if (!youtubeTrack.includes(' - ')) {
    return null
  }

  const [artist, name] = youtubeTrack.split(' - ')

  if (!link.startsWith('http')) {
    return null
  }

  return {
    name,
    artist,
    link,
  }
}

export const descriptionToLines = (description: string) => {
  let temp = description.replace(/–/g, '-').replace(/\n \n/g, '\n\n')

  MANUAL_CORRECTIONS.forEach(({ original, corrected }) => {
    if (temp.includes(original)) {
      temp = temp.replace(original, corrected)
    }
  })

  return temp.split('\n\n').map((l) => l.trim())
}