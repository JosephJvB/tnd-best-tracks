import { stringify } from 'querystring'
import { SPOTIFY_ID_LENGTH } from '../constants'
import { extractSpotifyId, findTrack, setToken } from '../spotifyApi'

describe('spotifyApi.ts', () => {
  describe('#extractSpotifyId', () => {
    it('returns null for invalid url', () => {
      const link = 'invalid url here'

      const id = extractSpotifyId(link, 'track')

      expect(id).toBeNull()
    })

    it('returns null for non-spotify links', () => {
      const link = 'https://www.youtube.com/watch?v=DJs_thSFreI'

      const id = extractSpotifyId(link, 'track')

      expect(id).toBeNull()
    })

    it('returns null when type does not match', () => {
      const link = 'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU'

      const id = extractSpotifyId(link, 'album')

      expect(id).toBeNull()
    })

    it('can extract spotify trackId', () => {
      const link = 'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU'

      let id: null | string = null

      expect(() => {
        id = extractSpotifyId(link, 'track')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })

    it('can extract spotify albumId', () => {
      const link = 'https://open.spotify.com/album/4m08vFKrKbjEklzRIBwllU'

      let id: null | string = null

      expect(() => {
        id = extractSpotifyId(link, 'album')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })

    it('can extract spotify trackId with queryParams', () => {
      const link =
        'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU?si=123&test=true'

      let id: null | string = null

      expect(() => {
        id = extractSpotifyId(link, 'track')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })

    it('can extract spotify trackId with pathParams', () => {
      const link =
        'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU/some/other/params'

      let id: null | string = null

      expect(() => {
        id = extractSpotifyId(link, 'track')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })
  })
  describe('#findTrack', () => {
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(jest.fn() as any)

    beforeAll(async () => {
      await setToken()
    })

    it.skip('creates the correct query string', () => {
      const input = {
        name: 'WOO ft. PlayThatBoiZay & Chief Pound',
        artist: 'Denzel Curry',
        link: 'https://www.youtube.com/watch?v=geVZ6ayvyzY&pp=ygUzRGVuemVsIEN1cnJ5IC0gV09PIGZ0LiBQbGF5VGhhdEJvaVpheSAmIENoaWVmIFBvdW5k',
        year: 2023,
      }

      const { name, artist, link, year } = input
      const actual = stringify({
        q: [`track:${name}`, `artist:${artist}`, `year:${year}`].join(' '),
      })

      const expectedOutput =
        'q=track:WOO+ft.+PlayThatBoiZay+%26+Chief+Pound+artist:Denzel+Curry+year:2023'

      expect(actual).toEqual(expectedOutput)
    })

    // issue case 1.
    // can be solved by excluding trackName after "ft. "
    // ie: track.split('ft. ')[0]
    describe('can handle ft. in trackname', () => {
      it('cant find Denzel Curry__WOO ft. PlayThatBoiZay & Chief Pound__2023', async () => {
        // q=track:WOO+ft.+PlayThatBoiZay+%26+Chief+Pound+artist:Denzel+Curry+year:2023
        const input = {
          name: 'WOO ft. PlayThatBoiZay & Chief Pound',
          artist: 'Denzel Curry',
          link: 'https://www.youtube.com/watch?v=geVZ6ayvyzY&pp=ygUzRGVuemVsIEN1cnJ5IC0gV09PIGZ0LiBQbGF5VGhhdEJvaVpheSAmIENoaWVmIFBvdW5k',
          year: 2023,
        }

        const result = await findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(result.tracks.items.length).toBe(0)
      })
      it('can find Denzel Curry__WOO__2023', async () => {
        // q=track:WOO+ft.+PlayThatBoiZay+%26+Chief+Pound+artist:Denzel+Curry+year:2023
        const input = {
          name: 'WOO',
          artist: 'Denzel Curry',
          link: 'https://www.youtube.com/watch?v=geVZ6ayvyzY&pp=ygUzRGVuemVsIEN1cnJ5IC0gV09PIGZ0LiBQbGF5VGhhdEJvaVpheSAmIENoaWVmIFBvdW5k',
          year: 2023,
        }

        const result = await findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('cant find Phoenix__All Eyes on Me ft. BENEE, Chad Hugo & Pusha T__2023', async () => {
        // q=track:All+Eyes+on+Me+ft.+BENEE,+Chad+Hugo+%26+Pusha+T+artist:Phoenix+year:2023
        const input = {
          name: 'All Eyes on Me ft. BENEE, Chad Hugo & Pusha T',
          artist: 'Phoenix',
          link: 'https://www.youtube.com/watch?v=zmA7_I_q5e8&pp=ygU3UGhvZW5peCAtIEFsbCBFeWVzIG9uIE1lIGZ0LiBCRU5FRSwgQ2hhZCBIdWdvICYgUHVzaGEgVA%3D%3D',
          year: 2023,
        }

        const result = await findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(result.tracks.items.length).toBe(0)
      })

      it('can find Phoenix__All Eyes on Me__2023', async () => {
        // q=track:All+Eyes+on+Me+artist:Phoenix+year:2023
        const input = {
          name: 'All Eyes on Me',
          artist: 'Phoenix',
          link: 'https://www.youtube.com/watch?v=zmA7_I_q5e8&pp=ygU3UGhvZW5peCAtIEFsbCBFeWVzIG9uIE1lIGZ0LiBCRU5FRSwgQ2hhZCBIdWdvICYgUHVzaGEgVA%3D%3D',
          year: 2023,
        }

        const result = await findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })
    })
  })
})
