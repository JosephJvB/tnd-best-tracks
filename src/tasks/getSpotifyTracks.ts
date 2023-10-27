import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { PLAYLIST_PREP_JSON_DIR, YOUTUBE_TRACKS_JSON_DIR } from '../constants'
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

export default async function () {
  const bestTrackFiles = readdirSync(YOUTUBE_TRACKS_JSON_DIR).filter(
    (f) => !f.startsWith('.') && f.endsWith('.json')
  )
  console.log('getting spotify tracks for', bestTrackFiles.length, 'files')

  await setToken()

  let fileNum = 1
  for (const jsonFile of bestTrackFiles) {
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

    const year = parseInt(jsonFile.replace('.json', ''))
    const saveFn = (d: PrePlaylistItem[]) =>
      writeFileSync(
        `${PLAYLIST_PREP_JSON_DIR}/${jsonFile}`,
        JSON.stringify(d, null, 2)
      )

    const items = tracksFromFile.map((t, i) => ({
      idx: i,
      spotifyId: extractSpotifyId(t.link, 'track'),
      youtubeTrack: t,
      spotifyTrack: undefined,
    }))

    await tryAssignByGet(items, saveFn)

    await tryAssignBySearch(items, year, saveFn)
  }
}

export const tryAssignByGet = async (
  items: PrePlaylistItem[],
  saveFn: (d: PrePlaylistItem[]) => void
) => {
  // https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
  const withSpotifyIds: WithSpotifyId[] = items.filter(
    (i): i is WithSpotifyId => !!i.spotifyId
  )

  for (let i = 0; i < withSpotifyIds.length; i += 50) {
    const batch = withSpotifyIds.slice(i, i + 50)

    const result = await getTracks(batch.map((i) => i.spotifyId))

    const spotifyTrackMap = new Map<string, TrimSpotifyTrack>()
    result.tracks.forEach((t) =>
      spotifyTrackMap.set(t.id, {
        id: t.id,
        uri: t.uri,
        name: t.name,
        artists: t.artists.map((a) => a.name),
      })
    )

    const _items = items.slice(0)
    batch.forEach((i) => {
      _items[i.idx].spotifyTrack = spotifyTrackMap.get(i.spotifyId)
    })

    saveFn(_items)
  }
}

export const tryAssignBySearch = async (
  items: PrePlaylistItem[],
  year: number,
  saveFn: (d: PrePlaylistItem[]) => void
): Promise<void> => {
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

    if (results.tracks.items.length) {
      const { id, uri, artists, name } = results.tracks.items[0]
      items[item.idx].spotifyTrack = {
        id,
        uri,
        name,
        artists: artists.map((a) => a.name),
      }

      saveFn(items)
    }
  }
}
