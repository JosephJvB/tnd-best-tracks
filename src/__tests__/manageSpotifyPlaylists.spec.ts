import * as spotifyApi from '../spotifyApi'
import * as fsUtil from '../fsUtil'
import manageSpotifyPlaylists from '../tasks/manageSpotifyPlaylists'
import { PrePlaylistItem } from '../tasks/getSpotifyTracks'
import { PLAYLIST_NAME_PREFIX } from '../constants'

describe('manageSpotifyPlaylists.ts', () => {
  const loadJsonSpy = jest
    .spyOn(fsUtil, 'loadJsonFile')
    .mockImplementation(jest.fn())
  const addPlaylistItemsSpy = jest
    .spyOn(spotifyApi, 'addPlaylistItems')
    .mockImplementation(jest.fn())
  const createPlaylistSpy = jest
    .spyOn(spotifyApi, 'createPlaylist')
    .mockImplementation(jest.fn())
  const getMyPlaylistsSpy = jest
    .spyOn(spotifyApi, 'getMyPlaylists')
    .mockImplementation(jest.fn())
  const getYearFromPlaylistSpy = jest
    .spyOn(spotifyApi, 'getYearFromPlaylist')
    .mockImplementation(jest.fn())
  const setOAuthTokenSpy = jest
    .spyOn(spotifyApi, 'setOAuthToken')
    .mockImplementation(jest.fn())

  describe('#manageSpotifyPlaylists', () => {
    // 2021, 2022, 2023. 6 items, 5 spotify tracks
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
        name: `${PLAYLIST_NAME_PREFIX}2023`,
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
    it('correctly adds tracks to no existing playlists', async () => {
      loadJsonSpy.mockReturnValueOnce(input)
      getMyPlaylistsSpy.mockResolvedValueOnce([])
      const years = [2021, 2022, 2023]
      years.forEach((year, idx) => {
        createPlaylistSpy.mockResolvedValueOnce({
          id: `playlist_${idx}`,
          name: `${PLAYLIST_NAME_PREFIX}${year}`,
          tracks: {
            total: 0,
            items: [] as Array<{
              added_at: string
              track: spotifyApi.SpotifyTrack
            }>,
          },
        } as spotifyApi.SpotifyPlaylist)
      })

      await manageSpotifyPlaylists()

      expect(loadJsonSpy).toBeCalledTimes(1)
      years.forEach((year) => {
        expect(createPlaylistSpy).toBeCalledWith(year)
      })
    })
  })
})
