import { readFileSync, writeFileSync } from 'fs'
import { PlaylistItem } from '../youtubeApi'
import {
  TND_PLAYLIST_ITEMS_JSON_PATH,
  YOUTUBE_TRACKS_JSON_PATH,
} from '../constants'
import { MANUAL_CORRECTIONS } from '../manualCorrections'

export type YoutubeTrack = {
  name: string
  artist: string
  link: string
  year: number
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
    readFileSync(TND_PLAYLIST_ITEMS_JSON_PATH, 'utf-8')
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

  const youtubeTracks = allItems.flatMap((item) => {
    const trackList = extractTrackList_v2(item)
    const year = parseInt(item.snippet.publishedAt.split('-')[0])

    return trackList.map((t) => ({
      ...t,
      year,
    }))
  })

  console.log(' > write', youtubeTracks.length, 'youtube tracks')
  writeFileSync(
    YOUTUBE_TRACKS_JSON_PATH,
    JSON.stringify(youtubeTracks, null, 2)
  )
}
export const extractTrackList_v2 = (item: PlaylistItem) => {
  const trackList: Omit<YoutubeTrack, 'year'>[] = []
  if (!containsBestTracks(item)) {
    return []
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
  const trackList: Omit<YoutubeTrack, 'year'>[] = []
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

export const containsBestTracks = (v: PlaylistItem) => {
  if (v.snippet.channelId !== v.snippet.videoOwnerChannelId) {
    return false
  }
  if (v.status.privacyStatus === 'private') {
    return false
  }
  // playlist is "Weekly Track Roundup / Raw Reviews"
  // skip raw reviews
  const reviewTitle = RAW_REVIEW_TITLES.find((rt) =>
    v.snippet.title.includes(`${rt} REVIEW`)
  )
  if (!!reviewTitle) {
    return false
  }

  return true
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
