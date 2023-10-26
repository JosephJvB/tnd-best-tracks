import { readFileSync, readdirSync, utimes, writeFileSync } from 'fs'
import {
  PLAYLISTS_JSON_DIR,
  SPOTIFY_ID_LENGTH,
  TRACKLISTS_JSON_DIR,
} from '../constants'
import { BestTrack } from './extractBestTracks'
import {
  SpotifyTrack,
  extractSpotifyId,
  findTrack,
  setToken,
} from '../spotifyApi'

export type FromYoutube = {
  fromYoutube: true
  uri: string
}
export type FromSpotify = Pick<SpotifyTrack, 'uri' | 'name'> & {
  artist: string
}
export type PrePlaylistitem = {
  youtubeTrack: BestTrack
  // we can infer spotify uri from youtube info if the track in the youtube track link is a open.spotify.com link
  // otherwise we must search spotify
  spotifyTrack: FromYoutube | FromSpotify
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
    return {
      youtubeTrack: track,
      spotifyTrack: {
        fromYoutube: true,
        uri: `spotify:track:${trackId}`,
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
      artist: artists[0].name,
    },
  }
}
