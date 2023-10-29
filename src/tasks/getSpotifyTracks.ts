import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { YoutubeTrack as YoutubeTrack } from './extractYoutubeTracks'
import {
  SpotifyTrack,
  extractSpotifyId,
  findTrack,
  getTracks,
  setToken,
} from '../spotifyApi'

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

export default async function () {}

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

export const searchSpotifyTracks = async (
  items: PrePlaylistItem[],
  year: number
) => {
  const idxTrackMap = new Map<number, TrimSpotifyTrack>()

  let trackNum = 1
  for (const item of items) {
    const logMsg = `  > ${trackNum++} / ${items.length}`
    process.stdout.write(`${logMsg}\r`)

    let ts1 = Date.now()
    // await new Promise((r) => setTimeout(r, 10 * Math.random() + 10))
    const results = await findTrack(item.youtubeTrack, year)
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
