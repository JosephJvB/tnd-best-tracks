import { YoutubeTrack as YoutubeTrack } from './extractYoutubeTracks'
import {
  SpotifyTrack,
  extractSpotifyId,
  findTrack,
  getTracks,
  setToken,
} from '../spotifyApi'
import { readFileSync, writeFileSync } from 'fs'
import {
  SPOTIFY_TRACKS_JSON_PATH,
  YOUTUBE_TRACKS_JSON_PATH,
} from '../constants'

export type TrimSpotifyTrack = Pick<SpotifyTrack, 'id' | 'uri' | 'name'> & {
  artists: string[]
}

export type PrePlaylistItem = {
  idx: number
  spotifyId: string | null
  youtubeTrack: YoutubeTrack
  spotifyTrack?: TrimSpotifyTrack
}
export type WithSpotifyId = PrePlaylistItem & {
  spotifyId: string
}

/**
 * TODO:
 * save incrementally
 * handle restart
 * doable by reading / writing maps to json files
 */

export default async function () {
  const youtubeTracks: YoutubeTrack[] = JSON.parse(
    readFileSync(YOUTUBE_TRACKS_JSON_PATH, 'utf-8')
  )

  const items: PrePlaylistItem[] = youtubeTracks.map((t, i) => ({
    idx: i, // use as ID
    youtubeTrack: t,
    spotifyId: extractSpotifyId(t.link, 'track'),
    spotifyTrack: undefined,
  }))

  await setToken()

  const spotifyIds = items
    .map((i) => i.spotifyId)
    .filter((id): id is string => !!id)
  const spotifyTrackMap = await batchGetById(spotifyIds)
  console.log(
    '  >',
    spotifyTrackMap.size,
    '/',
    spotifyIds.length,
    'spotify tracks found by trackId'
  )

  const toSearch = items.filter((i) => {
    if (!i.spotifyId) {
      return true
    }

    return spotifyTrackMap.has(i.spotifyId)
  })
  const indexTrackMap = await searchSpotifyTracks(toSearch)
  console.log(
    '  >',
    indexTrackMap.size,
    '/',
    spotifyIds.length,
    'spotify tracks found by search'
  )

  const combined = items.map((i) => ({
    ...i,
    spotifyTrack:
      (i.spotifyId && spotifyTrackMap.get(i.spotifyId)) ??
      indexTrackMap.get(i.idx),
  }))
  const withTrack = combined.filter((t) => !!t.spotifyTrack)
  console.log(
    '  >',
    withTrack.length,
    '/',
    combined.length,
    'spotify tracks found total'
  )

  writeFileSync(SPOTIFY_TRACKS_JSON_PATH, JSON.stringify(combined, null, 2))
}

export const batchGetById = async (spotifyIds: string[]) => {
  const spotifyTrackMap = new Map<string, TrimSpotifyTrack>()

  for (let i = 0; i < spotifyIds.length; i += 50) {
    const batch = spotifyIds.slice(i, i + 50)

    const result = await getTracks(batch)

    result.tracks.forEach((t) =>
      spotifyTrackMap.set(t.id, {
        id: t.id,
        uri: t.uri,
        name: t.name,
        artists: t.artists.map((a) => a.name),
      })
    )
  }

  return spotifyTrackMap
}

export const searchSpotifyTracks = async (items: PrePlaylistItem[]) => {
  const idxTrackMap = new Map<number, TrimSpotifyTrack>()

  let trackNum = 1
  for (const item of items) {
    const logMsg = `  > ${trackNum++} / ${items.length}`
    process.stdout.write(`${logMsg}\r`)

    let ts1 = Date.now()
    // await new Promise((r) => setTimeout(r, 10 * Math.random() + 10))
    const results = await findTrack(item.youtubeTrack)
    let ts2 = Date.now()
    const elapsedMS = Math.round(ts2 - ts1)
    process.stdout.write(`${logMsg} ${elapsedMS}ms\r`)

    if (!results.tracks.items.length) {
      continue
    }
    const { id, uri, artists, name } = results.tracks.items[0]
    idxTrackMap.set(item.idx, {
      id,
      uri,
      name,
      artists: artists.map((a) => a.name),
    })
  }

  return idxTrackMap
}

export const mapToString = (map: Map<any, any>) =>
  JSON.stringify([...map.entries()], null, 2)

export const stringToMap = <K, V>(str: string) => new Map<K, V>(JSON.parse(str))
