import * as spotifyApi from '../../spotifyApi'
import * as fsUtil from '../../fsUtil'
import * as manageSpotifyPlaylists from '../../tasks/manageSpotifyPlaylists'
import { PrePlaylistItem } from '../../tasks/getSpotifyTracks'
import { MISSING_TRACKS_JSON_PATH, PLAYLIST_NAME_PREFIX } from '../../constants'
import * as server from '../../server'
import fs from 'fs'

describe('unit/manageSpotifyPlaylists.ts', () => {
  const performCallbackSpy = jest
    .spyOn(server, 'performServerCallback')
    .mockImplementation(jest.fn())
  const submitCodeSpy = jest
    .spyOn(spotifyApi, 'submitCode')
    .mockImplementation(jest.fn())
  const loadJsonSpy = jest
    .spyOn(fsUtil, 'loadJsonFile')
    .mockImplementation(jest.fn())
  const getMyPlaylistsSpy = jest
    .spyOn(spotifyApi, 'getMyPlaylists')
    .mockImplementation(jest.fn())
  const getPlaylistItemsSpy = jest
    .spyOn(spotifyApi, 'getPlaylistItems')
    .mockImplementation(jest.fn())
  const createPlaylistSpy = jest
    .spyOn(spotifyApi, 'createPlaylist')
    .mockImplementation(jest.fn())
  const addPlaylistItemsSpy = jest
    .spyOn(spotifyApi, 'addPlaylistItems')
    .mockImplementation(jest.fn())
  const updatePlaylistDescriptionSpy = jest
    .spyOn(spotifyApi, 'updatePlaylistDescription')
    .mockImplementation(jest.fn())
  const setOAuthTokenSpy = jest
    .spyOn(spotifyApi, 'setOAuthToken')
    .mockImplementation(jest.fn())
  const getYearFromPlaylistSpy = jest.spyOn(spotifyApi, 'getYearFromPlaylist')
  const addTracksToPlaylistSpy = jest.spyOn(
    manageSpotifyPlaylists,
    'addTracksToPlaylist'
  )
  const writeFileSpy = jest
    .spyOn(fs, 'writeFileSync')
    .mockImplementation(jest.fn())

  describe('#manageSpotifyPlaylists', () => {
    // 2021, 2022, 2023. 6 items, 5 spotify tracks
    const mockAuthCode = 'code_123'
    const mockAuthToken = 'token_123'
    const input: PrePlaylistItem[] = [2021, 2022, 2023].flatMap((year) =>
      Array(6)
        .fill(0)
        .map((_, idx) => ({
          youtubeTrack: {
            videoPublishedDate: `${year}-10-08T07:33:42Z`,
          },
          spotifyTrack:
            idx > 4
              ? undefined
              : {
                  uri: `spotify:track:id_${year}_${idx}`,
                },
        }))
    ) as PrePlaylistItem[]
    // 2021, 2022. 3 tracks in each
    const existingYears = [2021, 2022]
    const existingPlaylists: spotifyApi.SpotifyPlaylist[] = existingYears.map(
      (year, idx) => ({
        id: `playlist_${idx}`,
        name: `${PLAYLIST_NAME_PREFIX}${year}`,
        tracks: {
          total: 3,
          items: Array(3)
            .fill(0)
            .map((_, idx) => ({
              added_at: `${year}-10-16T07:33:42Z`,
              track: {
                uri: `spotify:track:id_${year}_${idx}`,
              },
            })),
        },
      })
    ) as spotifyApi.SpotifyPlaylist[]

    it('correctly adds tracks with no existing playlists', async () => {
      performCallbackSpy.mockResolvedValueOnce(mockAuthCode)
      submitCodeSpy.mockResolvedValueOnce(mockAuthToken)
      loadJsonSpy.mockReturnValueOnce(input)
      getMyPlaylistsSpy.mockResolvedValueOnce([])

      const years = [2021, 2022, 2023]
      years.forEach((year, idx) => {
        createPlaylistSpy.mockResolvedValueOnce({
          id: `playlist_${idx}`,
          name: `${PLAYLIST_NAME_PREFIX}${year}`,
          tracks: {
            total: 0,
            items: [] as spotifyApi.PlaylistItem[],
          },
        } as spotifyApi.SpotifyPlaylist)
      })

      await manageSpotifyPlaylists.default()

      expect(performCallbackSpy).toHaveBeenCalledTimes(1)
      expect(submitCodeSpy).toHaveBeenCalledTimes(1)
      expect(setOAuthTokenSpy).toHaveBeenCalledTimes(1)
      expect(setOAuthTokenSpy).toHaveBeenCalledWith(mockAuthToken)
      expect(loadJsonSpy).toHaveBeenCalledTimes(1)
      expect(getYearFromPlaylistSpy).toHaveBeenCalledTimes(0)
      expect(getPlaylistItemsSpy).toHaveBeenCalledTimes(0)
      expect(createPlaylistSpy).toHaveBeenCalledTimes(3)
      years.forEach((year) => {
        expect(createPlaylistSpy).toHaveBeenCalledWith(year)
      })
      expect(addTracksToPlaylistSpy).toHaveBeenCalledTimes(3)
      years.forEach((year, playlistIdx) => {
        expect(addPlaylistItemsSpy).toHaveBeenCalledWith(
          `playlist_${playlistIdx}`,
          Array(5)
            .fill(0)
            .map((_, trackIdx) => `spotify:track:id_${year}_${trackIdx}`)
        )
      })
      expect(updatePlaylistDescriptionSpy).toHaveBeenCalledTimes(3)
      expect(writeFileSpy).toHaveBeenCalledTimes(1)
      expect(writeFileSpy.mock.calls[0][0]).toBe(MISSING_TRACKS_JSON_PATH)
      const jsonString = writeFileSpy.mock.calls[0][1]
      const missingItems = JSON.parse(jsonString.toString())
      expect(missingItems.length).toBe(3)
    })

    it('correctly adds tracks with 2 existing playlists x3songs each', async () => {
      performCallbackSpy.mockResolvedValueOnce(mockAuthCode)
      submitCodeSpy.mockResolvedValueOnce(mockAuthToken)
      loadJsonSpy.mockReturnValueOnce(input)
      getMyPlaylistsSpy.mockResolvedValueOnce(existingPlaylists)
      existingPlaylists.forEach((p) => {
        getPlaylistItemsSpy.mockResolvedValueOnce(p.tracks.items)
      })

      createPlaylistSpy.mockResolvedValueOnce({
        id: `playlist_2`,
        name: `${PLAYLIST_NAME_PREFIX}2023`,
        tracks: {
          total: 0,
          items: [] as Array<{
            added_at: string
            track: spotifyApi.SpotifyTrack
          }>,
        },
      } as spotifyApi.SpotifyPlaylist)

      await manageSpotifyPlaylists.default()

      expect(performCallbackSpy).toHaveBeenCalledTimes(1)
      expect(submitCodeSpy).toHaveBeenCalledTimes(1)
      expect(setOAuthTokenSpy).toHaveBeenCalledTimes(1)
      expect(setOAuthTokenSpy).toHaveBeenCalledWith(mockAuthToken)
      expect(loadJsonSpy).toHaveBeenCalledTimes(1)
      expect(getYearFromPlaylistSpy).toHaveBeenCalledTimes(2)
      expect(createPlaylistSpy).toHaveBeenCalledTimes(1)
      expect(createPlaylistSpy).toHaveBeenCalledWith(2023)
      expect(addTracksToPlaylistSpy).toHaveBeenCalledTimes(3)

      const years = [2021, 2022]
      years.forEach((year, playlistIdx) => {
        expect(addPlaylistItemsSpy).toHaveBeenCalledWith(
          `playlist_${playlistIdx}`,
          Array(2)
            .fill(0)
            .map((_, trackIdx) => `spotify:track:id_${year}_${trackIdx + 3}`)
        )
      })
      expect(addPlaylistItemsSpy).toHaveBeenCalledWith(
        `playlist_2`,
        Array(5)
          .fill(0)
          .map((_, trackIdx) => `spotify:track:id_2023_${trackIdx}`)
      )
      expect(updatePlaylistDescriptionSpy).toHaveBeenCalledTimes(3)
      expect(writeFileSpy).toHaveBeenCalledTimes(1)
      expect(writeFileSpy.mock.calls[0][0]).toBe(MISSING_TRACKS_JSON_PATH)
      const jsonString = writeFileSpy.mock.calls[0][1]
      const missingItems = JSON.parse(jsonString.toString())
      expect(missingItems.length).toBe(3)
    })
  })

  // TODO:
  // describe('#getTracksByYear', () => {})
  // describe('#getPlaylistsByYear', () => {})
  // describe('#addTracksToPlaylist', () => {})
})
