import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { PLAYLIST_PREP_JSON_DIR, YOUTUBE_TRACKS_JSON_DIR } from '../constants'
import { YoutubeTrack as YoutubeTrack } from './extractBestTracks'
import {
  SpotifyTrack,
  extractSpotifyId,
  findTrack,
  getTrack,
  setToken,
} from '../spotifyApi'

export type PrePlaylistitem = {
  youtubeTrack: YoutubeTrack
  spotifyTrack: Pick<SpotifyTrack, 'uri' | 'name'> & {
    artists: string[]
  }
}

export default async function () {
  const bestTrackFiles = readdirSync(YOUTUBE_TRACKS_JSON_DIR).filter(
    (f) => !f.startsWith('.') && f.endsWith('.json')
  )

  await setToken()

  console.log('getting spotify tracks for', bestTrackFiles.length, 'files')
  let fileNum = 1
  for (const jsonFile of bestTrackFiles) {
    const year = parseInt(jsonFile.replace('.json', ''))
    const tracksFromFile: YoutubeTrack[] = JSON.parse(
      readFileSync(`${YOUTUBE_TRACKS_JSON_DIR}/${jsonFile}`, 'utf8')
    )
    console.log(
      fileNum++,
      '/',
      bestTrackFiles.length,
      jsonFile,
      'x',
      tracksFromFile.length,
      'tracks'
    )

    const withSpotifyId: PrePlaylistitem[] = []
    let trackNum = 1
    for (const youtubeTrack of tracksFromFile) {
      const logMsg = `  > ${trackNum++} / ${tracksFromFile.length}`
      process.stdout.write(`${logMsg}\r`)

      let ts1 = Date.now()
      // await new Promise((r) => setTimeout(r, 10 * Math.random() + 10))
      const playlistItem = await preparePlaylistItem(youtubeTrack, year)
      let ts2 = Date.now()

      const elapsedMS = Math.round(ts2 - ts1)
      process.stdout.write(`${logMsg} ${elapsedMS}ms\r`)

      withSpotifyId.push(playlistItem)
      writeFileSync(
        `${PLAYLIST_PREP_JSON_DIR}/${jsonFile}`,
        JSON.stringify(withSpotifyId, null, 2)
      )
    }
  }
}

export const preparePlaylistItem = async (
  track: YoutubeTrack,
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
