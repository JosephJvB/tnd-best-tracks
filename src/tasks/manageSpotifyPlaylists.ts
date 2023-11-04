import { PrePlaylistItem, TrimSpotifyTrack } from './getSpotifyTracks'
import {
  SPOTIFY_PLAYLIST_DESCRIPTION_CHAR_LIMIT,
  SPOTIFY_TRACKS_JSON_PATH,
} from '../constants'
import {
  AUTH_FLOW_INIT_URL,
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
import { execSync } from 'child_process'

export default async function () {
  const code = await performServerCallback(startSpotifyCallback)

  const oauthToken = await submitCode(code)

  setOAuthToken(oauthToken)

  const tracksByYear = getTracksByYear()

  console.log('  >', tracksByYear.size, 'playlists from file')

  const playlistsByYear = await getPlaylistsByYear()

  console.log('  >', tracksByYear.size, 'playlists from spotify file')

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

    await combine(playlist, nextTrackList)
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

export const combine = async (
  playlist: SpotifyPlaylist,
  trackList: PrePlaylistItem[]
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
  const toAdd: string[] = []
  const forbiddenTracks: string[] = []
  trackList.forEach((t) => {
    if (!t.spotifyTrack) {
      forbiddenTracks.push(`${t.youtubeTrack.name} by ${t.youtubeTrack.artist}`)
      return
    }

    if (!currentTracksSet.has(t.spotifyTrack.uri)) {
      toAdd.push(t.spotifyTrack.uri)
      currentTracksSet.add(t.spotifyTrack.uri)
    }
  })

  console.log('  > adding', toAdd.length, 'tracks')

  if (toAdd.length) {
    await addPlaylistItems(playlist.id, toAdd)
  }

  const description =
    `forbidden tracks: ${forbiddenTracks.join(' / ')}`.substring(
      0,
      SPOTIFY_PLAYLIST_DESCRIPTION_CHAR_LIMIT - 1
    ) + '…'
  if (description != playlist.description) {
    console.log(
      ' > updating description with',
      forbiddenTracks.length,
      'forbidden tracks'
    )
    await updatePlaylistDescription(playlist.id, description)
  }
}

export const startSpotifyCallback = () => {
  execSync(`open -a Firefox "${AUTH_FLOW_INIT_URL}"`)
}
