import * as spotifyApi from '../spotifyApi'
import * as fsUtil from '../fsUtil'
import * as manageSpotifyPlaylists from '../tasks/manageSpotifyPlaylists'
import { PrePlaylistItem } from '../tasks/getSpotifyTracks'
import { PLAYLIST_NAME_PREFIX } from '../constants'
import * as server from '../server'
import * as sheetsApi from '../sheetsApi'

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
  const updatePlaylistDescriptionSpy = jest
    .spyOn(spotifyApi, 'updatePlaylistDescription')
    .mockImplementation(jest.fn())
  const setOAuthTokenSpy = jest
    .spyOn(spotifyApi, 'setOAuthToken')
    .mockImplementation(jest.fn())
  const getSpreadsheetSpy = jest
    .spyOn(sheetsApi, 'getSpreadsheet')
    .mockImplementation(jest.fn())
  const createSheetSpy = jest
    .spyOn(sheetsApi, 'createSheet')
    .mockImplementation(jest.fn())
  const getRowsSpy = jest
    .spyOn(sheetsApi, 'getRows')
    .mockImplementation(jest.fn())
  const addRowsSpy = jest
    .spyOn(sheetsApi, 'addRows')
    .mockImplementation(jest.fn())
  const addRowSpy = jest
    .spyOn(sheetsApi, 'addRow')
    .mockImplementation(jest.fn())
  const getYearFromPlaylistSpy = jest.spyOn(spotifyApi, 'getYearFromPlaylist')
  const addTracksToPlaylistSpy = jest.spyOn(
    manageSpotifyPlaylists,
    'addTracksToPlaylist'
  )
  const addMissingToSpreadsheetSpy = jest.spyOn(
    manageSpotifyPlaylists,
    'addMissingToSpreadsheet'
  )
  const trackToRowsSpy = jest.spyOn(sheetsApi, 'trackToRow')

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
      getSpreadsheetSpy.mockResolvedValueOnce({
        sheets: [],
      })

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
        createSheetSpy.mockResolvedValueOnce({
          properties: {
            title: year.toString(),
            sheetId: year,
          },
        })
      })

      await manageSpotifyPlaylists.default()

      expect(performCallbackSpy).toBeCalledTimes(1)
      expect(submitCodeSpy).toBeCalledTimes(1)
      expect(setOAuthTokenSpy).toBeCalledTimes(1)
      expect(setOAuthTokenSpy).toBeCalledWith(mockAuthToken)
      expect(loadJsonSpy).toBeCalledTimes(1)
      expect(getYearFromPlaylistSpy).toBeCalledTimes(0)
      expect(getPlaylistItemsSpy).toBeCalledTimes(0)
      expect(getSpreadsheetSpy).toBeCalledTimes(1)
      expect(createPlaylistSpy).toBeCalledTimes(3)
      years.forEach((year) => {
        expect(createPlaylistSpy).toBeCalledWith(year)
      })
      expect(addTracksToPlaylistSpy).toBeCalledTimes(3)
      years.forEach((year, playlistIdx) => {
        expect(addPlaylistItemsSpy).toBeCalledWith(
          `playlist_${playlistIdx}`,
          Array(5)
            .fill(0)
            .map((_, trackIdx) => `spotify:track:id_${year}_${trackIdx}`)
        )
      })
      expect(createSheetSpy).toBeCalledTimes(3)
      expect(addRowSpy).toBeCalledTimes(3)
      expect(getRowsSpy).toBeCalledTimes(0)
      expect(addMissingToSpreadsheetSpy).toBeCalledTimes(3)
      expect(addRowsSpy).toBeCalledTimes(3)
      years.forEach((year, idx) => {
        expect(addRowSpy.mock.calls[idx][2]).toBe(sheetsApi.HEADERS)
        expect(addRowsSpy.mock.calls[idx][2].length).toBe(1)
      })
      expect(updatePlaylistDescriptionSpy).toBeCalledTimes(3)
    })

    it('correctly adds tracks with 2 existing playlists x3songs each', async () => {
      performCallbackSpy.mockResolvedValueOnce(mockAuthCode)
      submitCodeSpy.mockResolvedValueOnce(mockAuthToken)
      loadJsonSpy.mockReturnValueOnce(input)
      getMyPlaylistsSpy.mockResolvedValueOnce(existingPlaylists)
      existingPlaylists.forEach((p) => {
        getPlaylistItemsSpy.mockResolvedValueOnce(p.tracks.items)
      })
      getSpreadsheetSpy.mockResolvedValueOnce({
        sheets: existingYears.map((year) => ({
          properties: {
            sheetId: year,
            title: year.toString(),
          },
        })),
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
      createSheetSpy.mockResolvedValueOnce({
        properties: {
          sheetId: 2023,
          title: '2023',
        },
      })
      existingYears.forEach((year) => {
        getRowsSpy.mockResolvedValueOnce([sheetsApi.HEADERS as any as string[]])
      })

      await manageSpotifyPlaylists.default()

      expect(performCallbackSpy).toBeCalledTimes(1)
      expect(submitCodeSpy).toBeCalledTimes(1)
      expect(setOAuthTokenSpy).toBeCalledTimes(1)
      expect(setOAuthTokenSpy).toBeCalledWith(mockAuthToken)
      expect(loadJsonSpy).toBeCalledTimes(1)
      expect(getYearFromPlaylistSpy).toBeCalledTimes(2)
      expect(createPlaylistSpy).toBeCalledTimes(1)
      expect(createPlaylistSpy).toBeCalledWith(2023)
      expect(addTracksToPlaylistSpy).toBeCalledTimes(3)

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
      expect(createSheetSpy).toBeCalledTimes(1)
      expect(createSheetSpy).toBeCalledWith('2023')
      expect(addRowSpy).toBeCalledTimes(1)
      expect(getRowsSpy).toBeCalledTimes(2)
      expect(addRowsSpy).toBeCalledTimes(3)
      expect(addRowsSpy).toBeCalledTimes(3)
      years.forEach((year, idx) => {
        expect(addRowsSpy.mock.calls[idx][2].length).toBe(1)
      })
      expect(updatePlaylistDescriptionSpy).toBeCalledTimes(3)
    })
  })

  // TODO:
  // describe('#getTracksByYear', () => {})
  // describe('#getPlaylistsByYear', () => {})
  // describe('#addTracksToPlaylist', () => {})

  describe('#addMissingToSpreadsheet', () => {
    it('creates sheet and adds all tracks', async () => {
      const spreadsheet = {
        sheets: [],
      }
      const year = 2023
      const date = new Date().toString()
      const items = Array(5)
        .fill(0)
        .map((_, idx) => ({
          id: `id_${idx}`,
          youtubeTrack: {
            name: `name_${idx}`,
            artist: `artist_${idx}`,
            link: `link_${idx}`,
            videoPublishedDate: date,
          },
        })) as PrePlaylistItem[]

      createSheetSpy.mockResolvedValueOnce({
        properties: {
          sheetId: year,
          title: year.toString(),
        },
      })

      await manageSpotifyPlaylists.addMissingToSpreadsheet(
        spreadsheet,
        year,
        items
      )

      expect(trackToRowsSpy).toHaveBeenCalledTimes(items.length)
      items.forEach((i) => {
        expect(trackToRowsSpy).toHaveBeenCalledWith({
          id: i.id,
          name: i.youtubeTrack.name,
          artist: i.youtubeTrack.artist,
          link: i.youtubeTrack.link,
          video_published_date: i.youtubeTrack.videoPublishedDate,
          spotify_id: '',
        })
      })
      expect(getRowsSpy).toHaveBeenCalledTimes(0)
      expect(addRowSpy).toHaveBeenCalledTimes(1)
      expect(addRowSpy.mock.calls[0][2]).toBe(sheetsApi.HEADERS)
      expect(addRowsSpy).toHaveBeenCalledTimes(1)
      expect(addRowsSpy.mock.calls[0][2].length).toBe(items.length)
    })

    it('adds all tracks to an empty existing sheet', async () => {
      const year = 2023
      const spreadsheet: sheetsApi.Spreadsheet = {
        sheets: [
          {
            properties: {
              title: year.toString(),
            },
          },
        ],
      }
      const date = new Date().toString()
      const items = Array(5)
        .fill(0)
        .map((_, idx) => ({
          id: `id_${idx}`,
          youtubeTrack: {
            name: `name_${idx}`,
            artist: `artist_${idx}`,
            link: `link_${idx}`,
            videoPublishedDate: date,
          },
        })) as PrePlaylistItem[]

      getRowsSpy.mockResolvedValueOnce([sheetsApi.HEADERS as any as string[]])

      await manageSpotifyPlaylists.addMissingToSpreadsheet(
        spreadsheet,
        year,
        items
      )

      expect(trackToRowsSpy).toHaveBeenCalledTimes(items.length)
      items.forEach((i) => {
        expect(trackToRowsSpy).toHaveBeenCalledWith({
          id: i.id,
          name: i.youtubeTrack.name,
          artist: i.youtubeTrack.artist,
          link: i.youtubeTrack.link,
          video_published_date: i.youtubeTrack.videoPublishedDate,
          spotify_id: '',
        })
      })
      expect(getRowsSpy).toHaveBeenCalledTimes(1)
      expect(addRowSpy).toHaveBeenCalledTimes(0)
      expect(addRowsSpy).toHaveBeenCalledTimes(1)
      expect(addRowsSpy.mock.calls[0][2].length).toBe(items.length)
    })

    it('adds all tracks to an existing sheet with some rows', async () => {
      const numExistingRows = 2
      const year = 2023
      const spreadsheet: sheetsApi.Spreadsheet = {
        sheets: [
          {
            properties: {
              title: year.toString(),
            },
          },
        ],
      }
      const date = new Date().toString()
      const items = Array(5)
        .fill(0)
        .map((_, idx) => ({
          id: `id_${idx}`,
          youtubeTrack: {
            name: `name_${idx}`,
            artist: `artist_${idx}`,
            link: `link_${idx}`,
            videoPublishedDate: date,
          },
        })) as PrePlaylistItem[]

      getRowsSpy.mockResolvedValueOnce([
        sheetsApi.HEADERS as any as string[],
        ...items
          .slice(0, numExistingRows)
          .map((i) => [
            i.id,
            i.youtubeTrack.name,
            i.youtubeTrack.artist,
            i.youtubeTrack.videoPublishedDate,
            i.youtubeTrack.link,
            '',
          ]),
      ])

      await manageSpotifyPlaylists.addMissingToSpreadsheet(
        spreadsheet,
        year,
        items
      )

      expect(trackToRowsSpy).toHaveBeenCalledTimes(
        items.length - numExistingRows
      )
      items.slice(numExistingRows).forEach((i) => {
        expect(trackToRowsSpy).toHaveBeenCalledWith({
          id: i.id,
          name: i.youtubeTrack.name,
          artist: i.youtubeTrack.artist,
          link: i.youtubeTrack.link,
          video_published_date: i.youtubeTrack.videoPublishedDate,
          spotify_id: '',
        })
      })
      expect(getRowsSpy).toHaveBeenCalledTimes(1)
      expect(addRowSpy).toHaveBeenCalledTimes(0)
      expect(addRowsSpy).toHaveBeenCalledTimes(1)
      expect(addRowsSpy.mock.calls[0][2].length).toBe(
        items.length - numExistingRows
      )
    })
  })
})
