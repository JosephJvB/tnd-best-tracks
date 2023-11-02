// https://github.com/JosephJvB/spotty-likes-mc-chunker/blob/main/src/

import { PrePlaylistItem, TrimSpotifyTrack } from './getSpotifyTracks'
import { SPOTIFY_TRACKS_JSON_PATH } from '../constants'
import {
  SpotifyPlaylist,
  addPlaylistItems,
  createPlaylist,
  getMyPlaylists,
  getYearFromPlaylist,
  setOAuthToken,
} from '../spotifyApi'
import { loadJsonFile } from '../fsUtil'

export type ValidPrePlaylistItem = Omit<PrePlaylistItem, 'spotifyTrack'> & {
  spotifyTrack: TrimSpotifyTrack
}

// 7. add any missing songs to each playlist
export default async function () {
  // TODO:
  // Server / callback stuff to get token
  const oauthToken = '' // await performCallbackProcess()
  setOAuthToken(oauthToken)

  const tracksByYear = await getTracksByYear()

  const playlistsByYear = await getPlaylistsByYear()

  for (const [year, nextTrackList] of tracksByYear.entries()) {
    let playlist = playlistsByYear.get(year)
    if (!playlist) {
      playlist = await createPlaylist(year)
    }

    await combine(playlist, nextTrackList)
  }
}

export const getTracksByYear = async () => {
  const prePlaylistItems = loadJsonFile<PrePlaylistItem[]>(
    SPOTIFY_TRACKS_JSON_PATH
  )

  const tracksByYear = new Map<number, ValidPrePlaylistItem[]>()
  prePlaylistItems.forEach((item) => {
    if (!item.spotifyTrack) {
      return
    }
    const validItem = item as ValidPrePlaylistItem

    const year = new Date(
      validItem.youtubeTrack.videoPublishedDate
    ).getFullYear()
    const soFar = tracksByYear.get(year) ?? []
    soFar.push(validItem)

    tracksByYear.set(year, soFar)
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
  trackList: ValidPrePlaylistItem[]
) => {
  const currentTracksSet = new Set(
    playlist.tracks.items.map((i) => i.track.uri)
  )

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
  const toAdd = trackList
    .filter((t) => !currentTracksSet.has(t.spotifyTrack.uri))
    .map((t) => t.spotifyTrack.uri)

  await addPlaylistItems(playlist.id, toAdd)
}
