import { read, readFileSync, readdirSync, writeFileSync } from 'fs'
import { PLAYLIST_PREP_JSON_DIR, YOUTUBE_TRACKS_JSON_DIR } from '../constants'
import { YoutubeTrack as YoutubeTrack } from './extractYoutubeTracks'
import {
  SpotifyTrack,
  extractSpotifyId,
  findTrack,
  getTracks,
  setToken,
} from '../spotifyApi'
import { fileHelper } from '../fileApi'

export type YoutubeTrackWithId = YoutubeTrack & {
  trackId: string
}
export type TrimSpotifyTrack = Pick<SpotifyTrack, 'uri' | 'name'> & {
  artists: string[]
}

export type PrePlaylistItem = {
  youtubeTrack: YoutubeTrack
  spotifyTrack: TrimSpotifyTrack
}

export default async function () {
  const bestTrackFiles = readdirSync(YOUTUBE_TRACKS_JSON_DIR).filter(
    (f) => !f.startsWith('.') && f.endsWith('.json')
  )
  console.log('getting spotify tracks for', bestTrackFiles.length, 'files')

  await setToken()

  let fileNum = 1
  for (const jsonFile of bestTrackFiles) {
    const year = parseInt(jsonFile.replace('.json', ''))
    console.log({
      jsonFile,
      readFileSync,
      calls: (readFileSync as any as jest.SpyInstance).mock.calls,
    })
    const tracksFromFile: YoutubeTrack[] = JSON.parse(
      readFileSync(`${YOUTUBE_TRACKS_JSON_DIR}/${jsonFile}`, 'utf8')
    )
    console.log(
      '\n',
      fileNum++,
      '/',
      bestTrackFiles.length,
      jsonFile,
      'x',
      tracksFromFile.length,
      'tracks'
    )

    const { toGet, toSearch } = allocateTracks(tracksFromFile)
    console.log('  > toGet:', toGet.length, ' toSearch:', toSearch.length)

    const { saveFn } = fileHelper<PrePlaylistItem>(
      `${PLAYLIST_PREP_JSON_DIR}/${jsonFile}`
    )

    await handleBatchGet(toGet, saveFn)

    await handleSingleSearch(toSearch, year, saveFn)
  }
}

export const allocateTracks = (tracks: YoutubeTrack[]) => {
  const toGet: YoutubeTrackWithId[] = []
  const toSearch: YoutubeTrack[] = []

  tracks.forEach((track) => {
    const trackId = extractSpotifyId(track.link, 'track')
    if (trackId) {
      toGet.push({ ...track, trackId })
    } else {
      toSearch.push(track)
    }
  })

  return {
    toGet,
    toSearch,
  }
}

export const handleBatchGet = async (
  tracks: YoutubeTrackWithId[],
  saveFn: (nextItems: PrePlaylistItem[]) => void
): Promise<void> => {
  const ytMap = new Map<string, YoutubeTrack>()
  const spotifyMap = new Map<string, TrimSpotifyTrack>()

  for (let i = 0; i < tracks.length; i += 50) {
    const batch: string[] = []
    tracks.slice(i, i + 50).forEach((t) => {
      ytMap.set(t.trackId, t)
      batch.push(t.trackId)
    })

    const result = await getTracks(batch)

    result.tracks.forEach((t) => {
      spotifyMap.set(t.id, {
        name: t.name,
        artists: t.artists.map((a) => a.name),
        uri: t.uri,
      })
    })
  }

  const nextItems = tracks.map((t) => ({
    youtubeTrack: ytMap.get(t.trackId)!,
    spotifyTrack: spotifyMap.get(t.trackId)!,
  }))

  saveFn(nextItems)
}

export const handleSingleSearch = async (
  tracks: YoutubeTrack[],
  year: number,
  saveFn: (nextItems: PrePlaylistItem[]) => void
): Promise<void> => {
  let trackNum = 1
  for (const youtubeTrack of tracks) {
    const logMsg = `  > ${trackNum++} / ${tracks.length}`
    process.stdout.write(`${logMsg}\r`)

    let ts1 = Date.now()
    // await new Promise((r) => setTimeout(r, 10 * Math.random() + 10))
    const results = await findTrack(youtubeTrack, year)
    const { uri, artists, name } = results.tracks.items[0]
    let ts2 = Date.now()

    const elapsedMS = Math.round(ts2 - ts1)
    process.stdout.write(`${logMsg} ${elapsedMS}ms\r`)

    const nextItem = {
      youtubeTrack,
      spotifyTrack: {
        uri,
        name,
        artists: artists.map((a) => a.name),
      },
    }

    saveFn([nextItem])
  }
}
