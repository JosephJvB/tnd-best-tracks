import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { PLAYLISTS_JSON_DIR, TRACKLISTS_JSON_DIR } from '../constants'
import { BestTrack } from './extractBestTracks'
import {
  SpotifyTrack,
  extractSpotifyId,
  findTrack,
  getTrack,
  setToken,
} from '../spotifyApi'

export type PrePlaylistitem = {
  youtubeTrack: BestTrack
  spotifyTrack: Pick<SpotifyTrack, 'uri' | 'name'> & {
    artists: string[]
  }
}

export default async function () {
  const bestTrackFiles = readdirSync(TRACKLISTS_JSON_DIR).filter(
    (f) => !f.startsWith('.') && f.endsWith('.json')
  )

  await setToken()

  for (const jsonFile of bestTrackFiles) {
    const year = parseInt(jsonFile.replace('.json', ''))
    const bestTracks: BestTrack[] = JSON.parse(
      readFileSync(`${TRACKLISTS_JSON_DIR}/${jsonFile}`, 'utf8')
    )

    const withSpotifyId: PrePlaylistitem[] = []
    for (const bestTrack of bestTracks) {
      const playlistItem = await preparePlaylistItem(bestTrack, year)

      withSpotifyId.push(playlistItem)
    }

    writeFileSync(
      `${PLAYLISTS_JSON_DIR}/${jsonFile}`,
      JSON.stringify(withSpotifyId, null, 2)
    )
  }
}

export const preparePlaylistItem = async (
  track: BestTrack,
  year: number
): Promise<PrePlaylistitem> => {
  const trackId = extractSpotifyId(track.link, 'track')
  if (trackId) {
    const result = await getTrack(trackId)
    const { uri, artists, name } = result

    return {
      youtubeTrack: track,
      spotifyTrack: {
        uri,
        name,
        artists: artists.map((a) => a.name),
      },
    }
  }

  const results = await findTrack(track, year)
  const { uri, artists, name } = results.tracks.items[0]

  return {
    youtubeTrack: track,
    spotifyTrack: {
      uri,
      name,
      artists: artists.map((a) => a.name),
    },
  }
}
