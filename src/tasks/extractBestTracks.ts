import { readFileSync, writeFileSync } from 'fs'
import { PlaylistItem } from '../youtubeApi'
import { TRACKLISTS_JSON_DIR, PLAYLIST_ITEMS_JSON_PATH } from '../constants'

// TODO: refactor - don't just push logic down

export type BestTrack = {
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
  }, new Map<string, BestTrack[]>())

  bestTracksByYear.forEach((trackList, year) => {
    console.log(' > write', trackList.length, 'tracks for', year)
    writeFileSync(
      `${TRACKLISTS_JSON_DIR}/${year}.json`,
      JSON.stringify(trackList, null, 2)
    )
  })
}
export const extractTrackList_v2 = (item: PlaylistItem) => {
  const trackList: BestTrack[] = []
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
      // console.log('exit', JSON.stringify(line))
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
  const trackList: BestTrack[] = []
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

  const [bestTrack, link] = lineSplit

  if (!bestTrack.includes(' - ')) {
    return null
  }

  const [artist, name] = bestTrack.split(' - ')

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
  return (
    description
      .replace(/–/g, '-')
      .replace(/\n \n/g, '\n\n')
      .replace(
        'Brain Tentacles -"The Sadist"',
        'Brain Tentacles - "The Sadist"'
      )
      .replace('SORRY NOT SORRY\nDogtooth: https', 'SORRY NOT SORRY\nhttps')
      .replace('Model/Actriz- Damocles', 'Model/Actriz - Damocles')
      .replace(
        `Bonnie Prince Billy \"I've Made Up My Mind`,
        `Bonnie Prince Billy - \"I've Made Up My Mind`
      )
      .replace('ft. Charlie Wilson\nReview: https', 'ft. Charlie Wilson\nhttps')
      // multi song
      .replace(
        'Björk / Fever Ray co-remixes:\nhttp://bjork.lnk.to/fctheknife \nhttp://bjork.lnk.to/fcfeverray \nhttp://bjork.lnk.to/bjorkremix',
        [
          [
            'Björk - Features Creatures (The Knife Remix)',
            'http://bjork.lnk.to/fctheknife',
          ],
          [
            'Björk - Features Creatures (Fever Ray Remix)',
            'http://bjork.lnk.to/fcfeverray',
          ],
          [
            'Fever Ray - This Country Makes It Hard To Fuck (Björk Remix)',
            'https://bjork.lnk.to/bjorkremix',
          ],
        ]
          .map((p) => p.join('\n'))
          .join('\n\n')
      )
      // multi song
      .replace(
        'Nails / Full of Hell split:\nhttp://www.theneedledrop.com/articles/2016/11/nails-full-of-hell-split-7',
        [
          [
            'Nails / Full of Hell - No Longer Under Your Control',
            'https://open.spotify.com/track/6KIoYx5Xee7TyxNEOtl29k?si=deced926fa6c48e2',
          ],
          [
            'Nails / Full of Hell - Thy Radiant Garotte Exposed',
            'https://open.spotify.com/track/3XTUzlzeuaLlT7ae17pF70?si=1a0f39504b4c47b3',
          ],
          [
            'Nails / Full of Hell - Bez Bólu',
            'https://open.spotify.com/track/4WS4lLtwZQ6Ezen9Q0oFqD?si=53b1ce902cd94bc7',
          ],
        ]
          .map((p) => p.join('\n'))
          .join('\n\n')
      )
      // multi song
      .replace(
        'Disclosure - Where You Come From (Extended Mix) / Love Can Be So Hard / Where Angels Fear To Tread / Moonlight\nhttps://youtu.be/wslO7YNg3S0\nhttps://youtu.be/4CCfYi1u8Y4\nhttps://youtu.be/stixXyfsJfE\nhttps://youtu.be/yTF7LwR9YEc',
        [
          [
            'Disclosure - Where You Come From (Extended Mix)',
            'https://youtu.be/wslO7YNg3S0',
          ],
          ['Disclosure - Love Can Be So Hard', 'https://youtu.be/4CCfYi1u8Y4'],
          [
            'Disclosure - Where Angels Fear To Tread',
            'https://youtu.be/stixXyfsJfE',
          ],
          ['Disclosure - Moonlight', 'https://youtu.be/yTF7LwR9YEc'],
        ]
          .map((p) => p.join('\n'))
          .join('\n\n')
      )
      // multi song - just chose one for simplicity
      .replace(
        'JP Moregun Mixtape\nhttp://www.jpmoregun.com/',
        'JP Moregun - Street Signs\nhttps://open.spotify.com/track/1sB9RQHc2ZGFwUNC00YirL?si=74f1c85a180d46b4'
      )
      // multi song - just chose one for simplicity
      .replace(
        'Aesop Rock / Homeboy Sandman EP\nhttp://www.theneedledrop.com/articles/2016/10/aesop-rock-homeboy-sandman-lice-two-still-buggin',
        'Lice, Aesop Rock, Homeboy Sandman - Oatmeal Cookies\nhttps://open.spotify.com/track/17AAfKkchZ7GTBH48ODdoF?si=abe23d9591f94927'
      )
      .split('\n\n')
      .map((l) => l.trim())
  )
}
