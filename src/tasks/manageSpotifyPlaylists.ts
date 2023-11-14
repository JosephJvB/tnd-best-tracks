import { PrePlaylistItem } from './getSpotifyTracks'
import { SPOTIFY_TRACKS_JSON_PATH } from '../constants'
import {
  SpotifyPlaylist,
  addPlaylistItems,
  createPlaylist,
  getMyPlaylists,
  getPlaylistItems,
  getYearFromPlaylist,
  setOAuthToken,
  submitCode,
  updatePlaylistDescription,
} from '../spotifyApi'
import { loadJsonFile } from '../fsUtil'
import { performServerCallback } from '../server'
import {
  ALL_DATA_RANGE,
  SHEET_NAME,
  SPREADSHEET_LINK,
  SheetTrack,
  getRows,
  itemToTrack,
  rowToTrack,
  trackToRow,
  upsertRows,
} from '../sheetsApi'

export default async function () {
  const code = await performServerCallback()

  const oauthToken = await submitCode(code)

  setOAuthToken(oauthToken)

  const tracksByYear = getTracksByYear()
  console.log('  >', tracksByYear.size, 'playlists from file')

  const playlistsByYear = await getPlaylistsByYear()
  console.log('  >', playlistsByYear.size, 'playlists from spotify')

  const missingTracks: PrePlaylistItem[] = []
  for (const [year, nextTrackList] of tracksByYear.entries()) {
    let playlist = playlistsByYear.get(year)
    console.log(
      '  >',
      year,
      !!playlist ? 'exists, loading current tracks' : 'not exists, creating'
    )
    if (playlist) {
      playlist.tracks.items = await getPlaylistItems(playlist.id)
    } else {
      playlist = await createPlaylist(year)
    }

    const canAdd: PrePlaylistItem[] = []
    nextTrackList.forEach((t) => {
      if (t.spotifyTrack) {
        canAdd.push(t)
      } else {
        missingTracks.push(t)
      }
    })

    console.log('  >', canAdd.length, 'tracks to add to playlist')

    await addTracksToPlaylist(playlist, canAdd)

    const description = `missing tracks list: ${SPREADSHEET_LINK}`
    if (playlist.description !== description) {
      console.log('  > updating playlist description', SPREADSHEET_LINK)
      await updatePlaylistDescription(playlist.id, description)
    }
  }

  await updateMissingSpreadsheet(missingTracks)
}

export const getTracksByYear = () => {
  const prePlaylistItems = loadJsonFile<PrePlaylistItem[]>(
    SPOTIFY_TRACKS_JSON_PATH
  )
  console.log('  >', prePlaylistItems.length, 'youtube tracks from file')

  const tracksByYear = new Map<number, PrePlaylistItem[]>()
  prePlaylistItems.forEach((item) => {
    const year = new Date(item.youtubeTrack.videoPublishedDate).getFullYear()
    const soFar = tracksByYear.get(year) ?? []
    soFar.push(item)

    tracksByYear.set(year, soFar)
  })
  tracksByYear.forEach((trackList, year) => {
    console.log('  >', year, 'has', trackList.length, 'tracks')
  })

  return tracksByYear
}

export const getPlaylistsByYear = async () => {
  const allPlaylists = await getMyPlaylists()

  const playlistsByYear = new Map<number, SpotifyPlaylist>()
  allPlaylists.forEach((p) => {
    const year = getYearFromPlaylist(p)
    if (year) {
      playlistsByYear.set(year, p)
    }
  })

  return playlistsByYear
}

export const addTracksToPlaylist = async (
  playlist: SpotifyPlaylist,
  nextTracks: PrePlaylistItem[]
) => {
  const currentTracksSet = new Set(
    playlist.tracks.items.map((i) => i.track.uri)
  )
  console.log('  >', playlist.name, 'has', currentTracksSet.size, 'tracks')

  /**
   * how to combine&order existing tracks with tracks from list
   * 1. want to order by fantano video release date
   *  - but then I have to map spotifyTracks back to my youtube playlist tracklist to find their video release..
   * 2. order by spotify release date - but then if a track is re-uploaded, that's wrong
   * 3. add next items to end of playlist
   *  - issue if I add a batch of youtube video songs, but some failed in parsing, and then I re-add them after fixing parsing.
   * tricky!
   * Will add them to end of list for now, TODO: handle playlist order
   */

  const toAdd = new Set<string>()
  nextTracks.forEach((t) => {
    if (!t.spotifyTrack || currentTracksSet.has(t.spotifyTrack.uri)) {
      return
    }

    toAdd.add(t.spotifyTrack.uri)
  })
  console.log('  > adding', toAdd.size, 'tracks')

  if (toAdd.size) {
    await addPlaylistItems(playlist.id, [...toAdd])
  }
}

export const updateMissingSpreadsheet = async (items: PrePlaylistItem[]) => {
  const foundRows = await getRows(SHEET_NAME, ALL_DATA_RANGE)

  const nextTrackMap = new Map<string, SheetTrack>()
  foundRows.forEach((r) => {
    const t = rowToTrack(r)
    nextTrackMap.set(t.id, t)
  })
  items.forEach((i) => {
    const t = itemToTrack(i)
    nextTrackMap.set(i.id, t)
  })

  const nextTracks = [...nextTrackMap.values()]

  nextTracks.sort(
    (a, z) => new Date(a.date).getTime() - new Date(z.date).getTime()
  )

  const nextRows = nextTracks.map((t) => trackToRow(t))
  console.log('  > setting', nextRows.length, 'rows in spreadsheet')

  if (nextRows.length) {
    await upsertRows(SHEET_NAME, ALL_DATA_RANGE, nextRows)
  }
}
