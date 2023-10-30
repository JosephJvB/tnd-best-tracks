import { SPOTIFY_ID_LENGTH } from '../constants'
import * as spotifyApi from '../spotifyApi'

describe('spotifyApi.ts', () => {
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
  describe('#findTrack', () => {
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(jest.fn() as any)
    const findTrackSpy = jest.spyOn(spotifyApi, 'findTrack')
    const normalizeTrackSpy = jest.spyOn(spotifyApi, 'normalizeTrackName')
    const normalizeArtistSpy = jest.spyOn(spotifyApi, 'normalizeArtistName')

    beforeAll(async () => {
      await spotifyApi.setToken()
    })

    describe('can handle ft. in trackname', () => {
      it('can find Denzel Curry__WOO ft. PlayThatBoiZay & Chief Pound__2023', async () => {
        const input = {
          name: 'WOO ft. PlayThatBoiZay & Chief Pound',
          artist: 'Denzel Curry',
          link: 'https://www.youtube.com/watch?v=geVZ6ayvyzY&pp=ygUzRGVuemVsIEN1cnJ5IC0gV09PIGZ0LiBQbGF5VGhhdEJvaVpheSAmIENoaWVmIFBvdW5k',
          year: 2023,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Phoenix__All Eyes on Me ft. BENEE, Chad Hugo & Pusha T__2023', async () => {
        const input = {
          name: 'All Eyes on Me ft. BENEE, Chad Hugo & Pusha T',
          artist: 'Phoenix',
          link: 'https://www.youtube.com/watch?v=zmA7_I_q5e8&pp=ygU3UGhvZW5peCAtIEFsbCBFeWVzIG9uIE1lIGZ0LiBCRU5FRSwgQ2hhZCBIdWdvICYgUHVzaGEgVA%3D%3D',
          year: 2023,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })
    })

    describe('misc trackname issues', () => {
      it('can find Car Seat Headrest__We Looked Like Giants ( + shoutout to The Beths & Pickle Darling)__2023', async () => {
        const input = {
          name: 'We Looked Like Giants ( + shoutout to The Beths & Pickle Darling)',
          artist: 'Car Seat Headrest',
          link: 'https://www.youtube.com/watch?v=SkSewZhqXG8&pp=ygUpQ2FyIFNlYXQgSGVhZHJlc3QgLSBXZSBMb29rZWQgTGlrZSBHaWFudHM%3D',
          year: 2023,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Paul Wall & Termanology__Houston BBQ ft. Bun B__2023', async () => {
        const input = {
          name: 'Houston BBQ ft. Bun B',
          artist: 'Paul Wall & Termanology',
          link: 'https://www.youtube.com/watch?v=wbIXsr0nzPs&pp=ygUuUGF1bCBXYWxsLCBUZXJtYW5vbG9neSAtIEhvdXN0b24gQkJRIGZ0LiBCdW4gQg%3D%3D',
          year: 2023,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })
    })
  })
})
