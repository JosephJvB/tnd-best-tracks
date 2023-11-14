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
  ADD_ROWS_RANGE,
  ALL_ROWS_RANGE,
  HEADERS,
  Spreadsheet,
  addRows,
  createSheet,
  getRows,
  getSheetLink,
  getSpreadsheet,
  rowToTrack,
  trackToRow,
} from '../sheetsApi'

export default async function () {
  const code = await performServerCallback()

  const oauthToken = await submitCode(code)

  setOAuthToken(oauthToken)

  const tracksByYear = getTracksByYear()
  console.log('  >', tracksByYear.size, 'playlists from file')

  const playlistsByYear = await getPlaylistsByYear()
  console.log('  >', playlistsByYear.size, 'playlists from spotify')

  const spreadsheet = await getSpreadsheet()

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
    const forbidden: PrePlaylistItem[] = []
    nextTrackList.forEach((t) => {
      if (t.spotifyTrack) {
        canAdd.push(t)
      } else {
        forbidden.push(t)
      }
    })

    console.log('  >', canAdd.length, 'tracks to add to playlist')
    console.log('  >', forbidden.length, 'tracks to add to missing spreadsheet')

    await addTracksToPlaylist(playlist, canAdd)
    const sheet = await addMissingToSpreadsheet(spreadsheet, year, forbidden)

    const sheetLink = getSheetLink(sheet.properties?.sheetId)

    const description = `missing tracks list: ${sheetLink}`
    if (playlist.description !== description) {
      console.log('  > updating playlist description', sheetLink)
      await updatePlaylistDescription(playlist.id, description)
    }
  }
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

export const addMissingToSpreadsheet = async (
  spreadsheet: Spreadsheet,
  year: number,
  tracks: PrePlaylistItem[]
) => {
  const sheetName = year.toString()
  let sheet = spreadsheet.sheets?.find((s) => s.properties?.title === sheetName)

  const rowsToAdd: string[][] = []
  const existingIds = new Set<string>()

  if (!sheet) {
    sheet = await createSheet(sheetName)
    rowsToAdd.push(HEADERS as any as string[])
  } else {
    const foundRows = await getRows(sheetName, ALL_ROWS_RANGE)
    foundRows.slice(1).forEach((r) => {
      const t = rowToTrack(r)
      existingIds.add(t.id)
    })
  }

  tracks.forEach((t) => {
    if (existingIds.has(t.id)) {
      return
    }

    rowsToAdd.push(
      trackToRow({
        id: t.id,
        name: t.youtubeTrack.name,
        artist: t.youtubeTrack.artist,
        link: t.youtubeTrack.link,
        video_published_date: t.youtubeTrack.videoPublishedDate,
        spotify_id: t.spotifyId ?? '',
      })
    )
  })

  rowsToAdd.sort((a, z) => new Date(a[4]).getTime() - new Date(z[4]).getTime())

  console.log('  > adding', rowsToAdd.length, 'to sheet', sheetName)

  if (rowsToAdd.length) {
    await addRows(sheetName, ADD_ROWS_RANGE, rowsToAdd)
  }

  return sheet
}
