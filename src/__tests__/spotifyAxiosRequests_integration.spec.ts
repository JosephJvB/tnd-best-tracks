import axios from 'axios'
import { extractSpotifyId, getToken } from '../spotifyApi'
import { YoutubeTrack } from '../tasks/extractYoutubeTracks'

describe('spotifyAxiosRequests_integration', () => {
  let TOKEN = ''

  beforeAll(async () => {
    TOKEN = await getToken()
  })

  describe('GET /search', () => {
    const requestSearch = (track: YoutubeTrack) => {
      const { name, artist, link, year } = track
      const params = {
        q: [`track:${name}`, `artist:${artist}`, `year:${year}`].join(' '),
        type: 'track',
        limit: 3,
      }

      const albumId = extractSpotifyId(link, 'album')
      if (albumId) {
        params.q += ` album:${albumId}`
      }
      return axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/search',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        params,
      })
    }

    describe('ft. in trackname', () => {
      it('cant find Denzel Curry__WOO ft. PlayThatBoiZay & Chief Pound__2023', async () => {
        const input = {
          name: 'WOO ft. PlayThatBoiZay & Chief Pound',
          artist: 'Denzel Curry',
          link: 'https://www.youtube.com/watch?v=geVZ6ayvyzY&pp=ygUzRGVuemVsIEN1cnJ5IC0gV09PIGZ0LiBQbGF5VGhhdEJvaVpheSAmIENoaWVmIFBvdW5k',
          year: 2023,
          videoPublishedDate: 'some-date',
        }

        const result = await requestSearch(input)

        expect(result.data.tracks.items.length).toBe(0)
      })

      it('can find Denzel Curry__WOO__2023', async () => {
        const input = {
          name: 'WOO',
          artist: 'Denzel Curry',
          link: 'https://www.youtube.com/watch?v=geVZ6ayvyzY&pp=ygUzRGVuemVsIEN1cnJ5IC0gV09PIGZ0LiBQbGF5VGhhdEJvaVpheSAmIENoaWVmIFBvdW5k',
          year: 2023,
          videoPublishedDate: 'some-date',
        }

        const result = await requestSearch(input)

        expect(result.data.tracks.items.length).toBeGreaterThan(0)
      })

      it('cant find Phoenix__All Eyes on Me ft. BENEE, Chad Hugo & Pusha T__2023', async () => {
        const input = {
          name: 'All Eyes on Me ft. BENEE, Chad Hugo & Pusha T',
          artist: 'Phoenix',
          link: 'https://www.youtube.com/watch?v=zmA7_I_q5e8&pp=ygU3UGhvZW5peCAtIEFsbCBFeWVzIG9uIE1lIGZ0LiBCRU5FRSwgQ2hhZCBIdWdvICYgUHVzaGEgVA%3D%3D',
          year: 2023,
          videoPublishedDate: 'some-date',
        }

        const result = await requestSearch(input)

        expect(result.data.tracks.items.length).toBe(0)
      })

      it('can find Phoenix__All Eyes on Me__2023', async () => {
        const input = {
          name: 'All Eyes on Me',
          artist: 'Phoenix',
          link: 'https://www.youtube.com/watch?v=zmA7_I_q5e8&pp=ygU3UGhvZW5peCAtIEFsbCBFeWVzIG9uIE1lIGZ0LiBCRU5FRSwgQ2hhZCBIdWdvICYgUHVzaGEgVA%3D%3D',
          year: 2023,
          videoPublishedDate: 'some-date',
        }

        const result = await requestSearch(input)

        expect(result.data.tracks.items.length).toBeGreaterThan(0)
      })
    })

    describe('misc trackname issues', () => {
      it('cant find Car Seat Headrest__We Looked Like Giants ( + shoutout to The Beths & Pickle Darling)__2023', async () => {
        const input = {
          name: 'We Looked Like Giants ( + shoutout to The Beths & Pickle Darling)',
          artist: 'Car Seat Headrest',
          link: 'https://www.youtube.com/watch?v=SkSewZhqXG8&pp=ygUpQ2FyIFNlYXQgSGVhZHJlc3QgLSBXZSBMb29rZWQgTGlrZSBHaWFudHM%3D',
          year: 2023,
          videoPublishedDate: 'some-date',
        }

        const result = await requestSearch(input)

        expect(result.data.tracks.items.length).toBe(0)
      })

      it('can find Car Seat Headrest__We Looked Like Giants__2023', async () => {
        const input = {
          name: 'We Looked Like Giants',
          artist: 'Car Seat Headrest',
          link: 'https://www.youtube.com/watch?v=SkSewZhqXG8&pp=ygUpQ2FyIFNlYXQgSGVhZHJlc3QgLSBXZSBMb29rZWQgTGlrZSBHaWFudHM%3D',
          year: 2023,
          videoPublishedDate: 'some-date',
        }

        const result = await requestSearch(input)

        expect(result.data.tracks.items.length).toBeGreaterThan(0)
      })
    })

    describe('& sign in artist name', () => {
      it('cant find Paul Wall & Termanology__Houston BBQ ft. Bun B__2023', async () => {
        const input = {
          name: 'Houston BBQ ft. Bun B',
          artist: 'Paul Wall & Termanology',
          link: 'https://www.youtube.com/watch?v=wbIXsr0nzPs&pp=ygUuUGF1bCBXYWxsLCBUZXJtYW5vbG9neSAtIEhvdXN0b24gQkJRIGZ0LiBCdW4gQg%3D%3D',
          year: 2023,
          videoPublishedDate: 'some-date',
        }

        const result = await requestSearch(input)

        expect(result.data.tracks.items.length).toBe(0)
      })

      it('can find Paul Wall Termanology__Houston BBQ__2023', async () => {
        // remove & from artist, remove ft. from trackname
        const input = {
          name: 'Houston BBQ ',
          artist: 'Paul Wall Termanology',
          link: 'https://www.youtube.com/watch?v=wbIXsr0nzPs&pp=ygUuUGF1bCBXYWxsLCBUZXJtYW5vbG9neSAtIEhvdXN0b24gQkJRIGZ0LiBCdW4gQg%3D%3D',
          year: 2023,
          videoPublishedDate: 'some-date',
        }

        const result = await requestSearch(input)

        expect(result.data.tracks.items.length).toBeGreaterThan(0)
      })
    })
  })
})
