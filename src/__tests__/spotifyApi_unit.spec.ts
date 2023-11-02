import axios from 'axios'
import { SPOTIFY_ID_LENGTH } from '../constants'
import * as spotifyApi from '../spotifyApi'

jest.mock('axios')

const axiosMock = axios as jest.MockedFunction<typeof axios>

describe('spotifyApi_unit.ts', () => {
  describe('#extractSpotifyId', () => {
    it('returns null for invalid url', () => {
      const link = 'invalid url here'

      const id = spotifyApi.extractSpotifyId(link, 'track')

      expect(id).toBeNull()
    })

    it('returns null for non-spotify links', () => {
      const link = 'https://www.youtube.com/watch?v=DJs_thSFreI'

      const id = spotifyApi.extractSpotifyId(link, 'track')

      expect(id).toBeNull()
    })

    it('returns null when type does not match', () => {
      const link = 'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU'

      const id = spotifyApi.extractSpotifyId(link, 'album')

      expect(id).toBeNull()
    })

    it('can extract spotify trackId', () => {
      const link = 'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU'

      let id: null | string = null

      expect(() => {
        id = spotifyApi.extractSpotifyId(link, 'track')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })

    it('can extract spotify albumId', () => {
      const link = 'https://open.spotify.com/album/4m08vFKrKbjEklzRIBwllU'

      let id: null | string = null

      expect(() => {
        id = spotifyApi.extractSpotifyId(link, 'album')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })

    it('can extract spotify trackId with queryParams', () => {
      const link =
        'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU?si=123&test=true'

      let id: null | string = null

      expect(() => {
        id = spotifyApi.extractSpotifyId(link, 'track')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })

    it('can extract spotify trackId with pathParams', () => {
      const link =
        'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU/some/other/params'

      let id: null | string = null

      expect(() => {
        id = spotifyApi.extractSpotifyId(link, 'track')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })
  })
  describe('#getYearFromPlaylist', () => {
    it('does not extract year from non-tony playlist', () => {
      const playlist = {
        name: '2021 likes',
      } as spotifyApi.SpotifyPlaylist

      const result = spotifyApi.getYearFromPlaylist(playlist)

      expect(result).toBeNull()
    })

    it('does extract year from a tony playlist', () => {
      const playlist = {
        name: "TONY'S TOP TRACKS 1840",
      } as spotifyApi.SpotifyPlaylist

      const result = spotifyApi.getYearFromPlaylist(playlist)

      expect(result).toBe(1840)
    })
  })
  describe('#getMyPlaylists', () => {
    it('calls axios with correct args once', async () => {
      const myPlaylists = Array(3)
        .fill(0)
        .map(
          (_, idx) =>
            ({
              id: `playlist_${idx}`,
              name: `name_${idx}`,
            } as spotifyApi.SpotifyPlaylist)
        )
      const mockResponse: spotifyApi.PaginatedResponse<spotifyApi.SpotifyPlaylist> =
        {
          items: myPlaylists,
          next: undefined,
        }
      axiosMock.mockResolvedValueOnce({
        data: mockResponse,
      })

      const mockAuthToken = 'token_oauth'
      spotifyApi.setOAuthToken(mockAuthToken)

      const results = await spotifyApi.getMyPlaylists()

      expect(axiosMock).toBeCalledTimes(1)
      expect(axiosMock).toBeCalledWith({
        method: 'get',
        url: `${spotifyApi.API_BASE_URL}/me/playlists`,
        headers: {
          Authorization: `Bearer ${mockAuthToken}`,
        },
        params: {
          limit: 50,
          offset: 0,
        },
      })
      expect(results).toEqual(myPlaylists)
    })

    it('calls axios with correct args three times', async () => {
      const myPlaylists = Array(110)
        .fill(0)
        .map(
          (_, idx) =>
            ({
              id: `playlist_${idx}`,
              name: `name_${idx}`,
            } as spotifyApi.SpotifyPlaylist)
        )
      for (let i = 0; i < myPlaylists.length; i += 50) {
        const mockResponse: spotifyApi.PaginatedResponse<spotifyApi.SpotifyPlaylist> =
          {
            items: myPlaylists.slice(i, i + 50),
            next: i + 50 < myPlaylists.length ? 'next url' : undefined,
          }
        axiosMock.mockResolvedValueOnce({
          data: mockResponse,
        })
      }

      const mockAuthToken = 'token_oauth'
      spotifyApi.setOAuthToken(mockAuthToken)

      const results = await spotifyApi.getMyPlaylists()

      expect(axiosMock).toBeCalledTimes(3)
      for (let i = 0; i < myPlaylists.length; i += 50) {
        expect(axiosMock).toBeCalledWith({
          method: 'get',
          url: `${spotifyApi.API_BASE_URL}/me/playlists`,
          headers: {
            Authorization: `Bearer ${mockAuthToken}`,
          },
          params: {
            limit: 50,
            offset: i,
          },
        })
      }
      expect(results).toEqual(myPlaylists)
    })
  })
  // describe('#createPlaylist', () => {})
  // describe('#getPlaylistItems', () => {})
  // describe('#addPlaylistItems', () => {})
})
