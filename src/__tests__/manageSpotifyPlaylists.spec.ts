import * as spotifyApi from '../spotifyApi'
import * as fsUtil from '../fsUtil'
import * as manageSpotifyPlaylists from '../tasks/manageSpotifyPlaylists'
import { PrePlaylistItem } from '../tasks/getSpotifyTracks'
import { PLAYLIST_NAME_PREFIX } from '../constants'
import * as server from '../server'

describe('manageSpotifyPlaylists.ts', () => {
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
  const setOAuthTokenSpy = jest
    .spyOn(spotifyApi, 'setOAuthToken')
    .mockImplementation(jest.fn())
  const getYearFromPlaylistSpy = jest.spyOn(spotifyApi, 'getYearFromPlaylist')
  const combineSpy = jest.spyOn(manageSpotifyPlaylists, 'combine')

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
    const existingPlaylists: spotifyApi.SpotifyPlaylist[] = [2021, 2022].map(
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

      expect(performCallbackSpy).toBeCalledTimes(1)
      expect(submitCodeSpy).toBeCalledTimes(1)
      expect(setOAuthTokenSpy).toBeCalledTimes(1)
      expect(setOAuthTokenSpy).toBeCalledWith(mockAuthToken)
      expect(loadJsonSpy).toBeCalledTimes(1)
      expect(getYearFromPlaylistSpy).toBeCalledTimes(0)
      expect(getPlaylistItemsSpy).toBeCalledTimes(0)
      expect(createPlaylistSpy).toBeCalledTimes(3)
      years.forEach((year) => {
        expect(createPlaylistSpy).toBeCalledWith(year)
      })
      expect(combineSpy).toBeCalledTimes(3)
      years.forEach((year, playlistIdx) => {
        expect(addPlaylistItemsSpy).toBeCalledWith(
          `playlist_${playlistIdx}`,
          Array(5)
            .fill(0)
            .map((_, trackIdx) => `spotify:track:id_${year}_${trackIdx}`)
        )
      })
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

      expect(performCallbackSpy).toBeCalledTimes(1)
      expect(submitCodeSpy).toBeCalledTimes(1)
      expect(setOAuthTokenSpy).toBeCalledTimes(1)
      expect(setOAuthTokenSpy).toBeCalledWith(mockAuthToken)
      expect(loadJsonSpy).toBeCalledTimes(1)
      expect(getYearFromPlaylistSpy).toBeCalledTimes(2)
      expect(createPlaylistSpy).toBeCalledTimes(1)
      expect(createPlaylistSpy).toBeCalledWith(2023)
      expect(combineSpy).toBeCalledTimes(3)

      const years = [2021, 2022]
      years.forEach((year, playlistIdx) => {
        expect(addPlaylistItemsSpy).toBeCalledWith(
          `playlist_${playlistIdx}`,
          Array(2)
            .fill(0)
            .map((_, trackIdx) => `spotify:track:id_${year}_${trackIdx + 3}`)
        )
      })
      expect(addPlaylistItemsSpy).toBeCalledWith(
        `playlist_2`,
        Array(5)
          .fill(0)
          .map((_, trackIdx) => `spotify:track:id_2023_${trackIdx}`)
      )
    })
  })
})
