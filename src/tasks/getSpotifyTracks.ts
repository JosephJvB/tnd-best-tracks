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
  YOUTUBE_ID_MAP_JSON_PATH,
  SPOTIFY_TRACKS_JSON_PATH,
  SPOTIFY_TRACK_ID_MAP_JSON_PATH,
  YOUTUBE_TRACKS_JSON_PATH,
} from '../constants'
import { createMapHelper } from '../mapUtil'

export type TrimSpotifyTrack = Pick<SpotifyTrack, 'id' | 'uri' | 'name'> & {
  artists: string[]
}

export type PrePlaylistItem = {
  id: string
  spotifyId: string | null
  youtubeTrack: YoutubeTrack
  spotifyTrack?: TrimSpotifyTrack
}
export type WithSpotifyId = PrePlaylistItem & {
  spotifyId: string
}

export default async function () {
  const youtubeTracks: YoutubeTrack[] = JSON.parse(
    readFileSync(YOUTUBE_TRACKS_JSON_PATH, 'utf-8')
  )

  const items: PrePlaylistItem[] = youtubeTracks.map((t) => ({
    id: [t.artist, t.name, t.year].join('__'), // use as ID
    youtubeTrack: t,
    spotifyId: extractSpotifyId(t.link, 'track'),
    spotifyTrack: undefined,
  }))

  await setToken()

  const spotifyIds = items
    .map((i) => i.spotifyId)
    .filter((id): id is string => !!id)
  const spotifyIdTrackMap = await batchGetById(spotifyIds)
  console.log(
    '  >',
    spotifyIdTrackMap.size,
    '/',
    spotifyIds.length,
    'spotify tracks found by trackId'
  )

  const toSearch = items.filter((i) => {
    if (!i.spotifyId) {
      return true
    }

    return spotifyIdTrackMap.has(i.spotifyId)
  })
  const youtubeIdTrackMap = await searchSpotifyTracks(toSearch)
  console.log(
    '  >',
    youtubeIdTrackMap.size,
    '/',
    spotifyIds.length,
    'spotify tracks found by search'
  )

  const combined = items.map((i) => ({
    ...i,
    spotifyTrack:
      (i.spotifyId && spotifyIdTrackMap.get(i.spotifyId)) ??
      youtubeIdTrackMap.get(i.id),
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
  const mapHelper = createMapHelper<string, TrimSpotifyTrack>(
    SPOTIFY_TRACK_ID_MAP_JSON_PATH
  )
  const spotifyTrackMap = mapHelper.load()

  const toGet = spotifyIds.filter((id) => !spotifyTrackMap.has(id))
  for (let i = 0; i < toGet.length; i += 50) {
    const batch = toGet.slice(i, i + 50)

    const result = await getTracks(batch)

    result.tracks.forEach((t) =>
      spotifyTrackMap.set(t.id, {
        id: t.id,
        uri: t.uri,
        name: t.name,
        artists: t.artists.map((a) => a.name),
      })
    )

    mapHelper.save(spotifyTrackMap)
  }

  return spotifyTrackMap
}

export const searchSpotifyTracks = async (items: PrePlaylistItem[]) => {
  const mapHelper = createMapHelper<string, TrimSpotifyTrack>(
    YOUTUBE_ID_MAP_JSON_PATH
  )
  const youtubeTrackMap = mapHelper.load()

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
    youtubeTrackMap.set(item.id, {
      id,
      uri,
      name,
      artists: artists.map((a) => a.name),
    })

    mapHelper.save(youtubeTrackMap)
  }

  return youtubeTrackMap
}
